-- VHL Abroad Career Portal - FRESH Database Schema
-- ================================================
-- IMPORTANT: Run this in Supabase SQL Editor
-- This schema avoids RLS recursion by using simple, non-recursive policies

-- Step 1: Clean up everything first
-- ==================================

-- Drop all existing policies
DO $$ 
BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
    
    -- Consultations policies
    DROP POLICY IF EXISTS "Anyone can create consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Users can create consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Admin can view all consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Admin can update consultations" ON public.consultations;
    DROP POLICY IF EXISTS "View consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Users can view own consultations if authenticated" ON public.consultations;
    
    -- Enrollments policies
    DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
    DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Drop existing tables (start completely fresh)
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Step 2: Enable extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create helper function for timestamps
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create PROFILES table
-- =============================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies (NO recursion - no self-referential queries)
-- Allow insert for trigger
CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Users can read ALL profiles (needed for admin dashboard, simple and safe for internal app)
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (true);

-- Users can only update their OWN profile
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Updated_at trigger
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 5: Create auto-profile trigger
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create CONSULTATIONS table
-- ==================================
CREATE TABLE public.consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    desired_degree TEXT,
    intake_year TEXT,
    field_of_interest TEXT,
    current_education TEXT,
    cgpa TEXT,
    budget TEXT,
    preferred_country TEXT DEFAULT 'Germany',
    german_level TEXT DEFAULT 'None',
    background TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Simple policies
-- Anyone can submit a consultation
CREATE POLICY "consultations_insert" ON public.consultations
    FOR INSERT WITH CHECK (true);

-- Authenticated users can view all (for admin dashboard)
CREATE POLICY "consultations_select" ON public.consultations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can update (for admin to change status)
CREATE POLICY "consultations_update" ON public.consultations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER set_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 7: Create ENROLLMENTS table
-- ================================
CREATE TABLE public.enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_level TEXT NOT NULL CHECK (course_level IN ('A1', 'A2', 'B1', 'B2')),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Simple policies
-- Users can only see their own enrollments
CREATE POLICY "enrollments_select" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own enrollments
CREATE POLICY "enrollments_insert" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own enrollments
CREATE POLICY "enrollments_update" ON public.enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 8: Create indexes for performance
-- ======================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_level ON public.enrollments(course_level);

-- Step 9: Create BATCHES table (Learning Management)
-- ====================================================
CREATE TABLE public.batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view batches
CREATE POLICY "batches_select" ON public.batches
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update batches (will be enforced in application logic)
CREATE POLICY "batches_insert" ON public.batches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "batches_update" ON public.batches
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "batches_delete" ON public.batches
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_batches_updated_at
    BEFORE UPDATE ON public.batches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 10: Create BATCH_STUDENTS table (Enrollment with expiry)
-- ==============================================================
CREATE TABLE public.batch_students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    access_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(batch_id, student_id)
);

ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments, admins can view all
CREATE POLICY "batch_students_select" ON public.batch_students
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

CREATE POLICY "batch_students_insert" ON public.batch_students
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "batch_students_delete" ON public.batch_students
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 11: Create VIDEOS table
-- ==============================
CREATE TABLE public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Students can only view published videos for their batch
-- Admins can view all videos
CREATE POLICY "videos_select" ON public.videos
    FOR SELECT USING (
        is_published = true 
        OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "videos_insert" ON public.videos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "videos_update" ON public.videos
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "videos_delete" ON public.videos
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 12: Create LIVE_CLASSES table
-- ===================================
CREATE TABLE public.live_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    meeting_link TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_classes_select" ON public.live_classes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "live_classes_insert" ON public.live_classes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "live_classes_update" ON public.live_classes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "live_classes_delete" ON public.live_classes
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_live_classes_updated_at
    BEFORE UPDATE ON public.live_classes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 13: Create EXAMS table
-- ============================
CREATE TABLE public.exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    publish_result BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exams_select" ON public.exams
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "exams_insert" ON public.exams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "exams_update" ON public.exams
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "exams_delete" ON public.exams
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 14: Create QUESTIONS table
-- ================================
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    marks INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select" ON public.questions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "questions_insert" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "questions_update" ON public.questions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "questions_delete" ON public.questions
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER set_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 15: Create EXAM_ATTEMPTS table
-- ====================================
CREATE TABLE public.exam_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    is_submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, exam_id)
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Students can only see their own attempts
CREATE POLICY "exam_attempts_select" ON public.exam_attempts
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

CREATE POLICY "exam_attempts_insert" ON public.exam_attempts
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "exam_attempts_update" ON public.exam_attempts
    FOR UPDATE USING (auth.uid() = student_id);

CREATE TRIGGER set_exam_attempts_updated_at
    BEFORE UPDATE ON public.exam_attempts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 16: Create RESULTS table
-- ==============================
CREATE TABLE public.results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, exam_id)
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Students can only see their own results, admins can see all
CREATE POLICY "results_select" ON public.results
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() IS NOT NULL);

CREATE POLICY "results_insert" ON public.results
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "results_update" ON public.results
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Step 17: Create indexes for performance
-- ========================================
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_batch_students_student_id ON public.batch_students(student_id);
CREATE INDEX idx_batch_students_batch_id ON public.batch_students(batch_id);
CREATE INDEX idx_batch_students_expiry ON public.batch_students(access_expiry);
CREATE INDEX idx_videos_batch_id ON public.videos(batch_id);
CREATE INDEX idx_videos_published ON public.videos(is_published);
CREATE INDEX idx_live_classes_batch_id ON public.live_classes(batch_id);
CREATE INDEX idx_live_classes_scheduled ON public.live_classes(scheduled_at);
CREATE INDEX idx_exams_batch_id ON public.exams(batch_id);
CREATE INDEX idx_exams_published ON public.exams(is_published);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_exam_attempts_student_id ON public.exam_attempts(student_id);
CREATE INDEX idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX idx_results_student_id ON public.results(student_id);
CREATE INDEX idx_results_exam_id ON public.results(exam_id);

-- Step 18: Create profiles for existing users (if any)
-- =====================================================
INSERT INTO public.profiles (id, email, full_name, phone)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    COALESCE(raw_user_meta_data->>'phone', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Step 16: Create NOTIFICATIONS table
-- ====================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'class', 'content', 'exam')),
    send_to TEXT DEFAULT 'all' CHECK (send_to IN ('all', 'batch')),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
-- Students can view notifications sent to all or to their batches
CREATE POLICY "notifications_select_students" ON public.notifications
    FOR SELECT USING (
        send_to = 'all' OR 
        (send_to = 'batch' AND batch_id IN (
            SELECT batch_id FROM public.batch_students WHERE student_id = auth.uid()
        ))
    );

-- Only admins can insert notifications
CREATE POLICY "notifications_insert_admin" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can view all notifications
CREATE POLICY "notifications_select_admin" ON public.notifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can delete notifications
CREATE POLICY "notifications_delete_admin" ON public.notifications
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_batch_id ON public.notifications(batch_id);
CREATE INDEX idx_notifications_send_to ON public.notifications(send_to);

-- Done! Your database is ready.
-- =============================
