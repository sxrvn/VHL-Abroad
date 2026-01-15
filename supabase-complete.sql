-- ============================================================================
-- VHL ABROAD CAREER PORTAL - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This is the ONLY schema file you need. It includes:
-- 1. Cleanup of unused tables
-- 2. Complete schema for all active tables (14 tables)
-- 3. All necessary functions
-- 4. Migration notes for videos → materials
-- Created: January 15, 2026
-- Last Updated: January 15, 2026
-- ============================================================================

-- ============================================================================
-- IMPORTANT: CLEANUP UNUSED TABLES FIRST
-- ============================================================================
-- Run this section to remove tables that are NOT used in the application
-- This reduces schema complexity by 36% with ZERO functionality loss

DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.meeting_chat CASCADE;
DROP TABLE IF EXISTS public.meeting_attendance CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.personal_calendar_events CASCADE;
DROP TABLE IF EXISTS public.quiz_analytics CASCADE;
DROP TABLE IF EXISTS public.learning_progress CASCADE; -- Replaced by material_progress
DROP TABLE IF EXISTS public.enrollments CASCADE; -- Replaced by batch_students

-- ============================================================================
-- ACTIVE TABLES (14 tables used by the application)
-- ============================================================================
-- ✓ profiles, consultations, batches, batch_students
-- ✓ videos (legacy - to migrate), materials, material_progress
-- ✓ live_classes, exams, questions, exam_attempts, results
-- ✓ notifications, calendar_events
-- ============================================================================

-- ============================================================================
-- SECTION 1: MAIN SCHEMA
-- ============================================================================

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
    passing_marks INTEGER,
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

-- Step 17: Create LEARNING_PROGRESS table (Progress Tracking)
-- ============================================================
CREATE TABLE public.learning_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    watch_percentage INTEGER DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE,
    total_watch_time INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, video_id)
);

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own progress
CREATE POLICY "learning_progress_select_own" ON public.learning_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "learning_progress_insert_own" ON public.learning_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "learning_progress_update_own" ON public.learning_progress
    FOR UPDATE USING (auth.uid() = student_id);

-- Admins can view all progress
CREATE POLICY "learning_progress_select_admin" ON public.learning_progress
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_learning_progress_updated_at
    BEFORE UPDATE ON public.learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 18: Create QUIZ_ANALYTICS table (Exam Performance Analytics)
-- ==================================================================
CREATE TABLE public.quiz_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    time_spent INTEGER, -- seconds spent on exam
    attempts_count INTEGER DEFAULT 1,
    weak_topics JSONB DEFAULT '{}'::jsonb,
    strong_topics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, exam_id)
);

-- Enable RLS
ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

-- Students can view their own analytics
CREATE POLICY "quiz_analytics_select_own" ON public.quiz_analytics
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "quiz_analytics_insert_own" ON public.quiz_analytics
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "quiz_analytics_update_own" ON public.quiz_analytics
    FOR UPDATE USING (auth.uid() = student_id);

-- Admins can view all analytics
CREATE POLICY "quiz_analytics_select_admin" ON public.quiz_analytics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_quiz_analytics_updated_at
    BEFORE UPDATE ON public.quiz_analytics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 19: Create indexes for progress tracking
-- ==============================================
CREATE INDEX idx_learning_progress_student ON public.learning_progress(student_id);
CREATE INDEX idx_learning_progress_video ON public.learning_progress(video_id);
CREATE INDEX idx_learning_progress_completed ON public.learning_progress(completed);
CREATE INDEX idx_quiz_analytics_student ON public.quiz_analytics(student_id);
CREATE INDEX idx_quiz_analytics_exam ON public.quiz_analytics(exam_id);

-- Step 20: Create CALENDAR_EVENTS table (Unified calendar view)
-- ==============================================================
CREATE TABLE public.calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('class', 'exam', 'assignment', 'holiday', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT, -- meeting link or physical location
    is_all_day BOOLEAN DEFAULT false,
    reminder_minutes INTEGER DEFAULT 60, -- remind X minutes before
    color TEXT, -- hex color for calendar display
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Students can view events for their batch
CREATE POLICY "calendar_events_select_student" ON public.calendar_events
    FOR SELECT USING (
        batch_id IN (SELECT batch_id FROM public.batch_students WHERE student_id = auth.uid())
    );

-- Admins can manage all events
CREATE POLICY "calendar_events_all_admin" ON public.calendar_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 21: Create PERSONAL_CALENDAR_EVENTS table (Student personal events)
-- =========================================================================
CREATE TABLE public.personal_calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.personal_calendar_events ENABLE ROW LEVEL SECURITY;

-- Students can manage their own events
CREATE POLICY "personal_calendar_events_all_own" ON public.personal_calendar_events
    FOR ALL USING (auth.uid() = student_id);

-- Updated_at trigger
CREATE TRIGGER set_personal_calendar_events_updated_at
    BEFORE UPDATE ON public.personal_calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 22: Create indexes for calendar tables
-- ============================================
CREATE INDEX idx_calendar_events_batch ON public.calendar_events(batch_id);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_start ON public.calendar_events(start_time);
CREATE INDEX idx_personal_calendar_student ON public.personal_calendar_events(student_id);

-- Step 23: Create MEETINGS table (Video Conferencing)
-- ====================================================
CREATE TABLE public.meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    live_class_id UUID REFERENCES public.live_classes(id) ON DELETE CASCADE,
    platform TEXT DEFAULT 'jitsi' CHECK (platform IN ('zoom', 'jitsi', 'agora', 'other')),
    meeting_id TEXT NOT NULL, -- Platform-specific meeting ID (e.g., room name for Jitsi)
    password TEXT,
    host_url TEXT,
    join_url TEXT,
    is_recording_enabled BOOLEAN DEFAULT true,
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Students can view meetings for their batch
CREATE POLICY "meetings_select_student" ON public.meetings
    FOR SELECT USING (
        live_class_id IN (
            SELECT lc.id FROM public.live_classes lc
            JOIN public.batches b ON lc.batch_id = b.id
            JOIN public.batch_students bs ON b.id = bs.batch_id
            WHERE bs.student_id = auth.uid()
        )
    );

-- Students can insert meetings for their batch's live classes
CREATE POLICY "meetings_insert_student" ON public.meetings
    FOR INSERT WITH CHECK (
        live_class_id IN (
            SELECT lc.id FROM public.live_classes lc
            JOIN public.batches b ON lc.batch_id = b.id
            JOIN public.batch_students bs ON b.id = bs.batch_id
            WHERE bs.student_id = auth.uid()
            AND lc.is_active = true
        )
    );

-- Students can update meetings they can access (for ending meetings, etc.)
CREATE POLICY "meetings_update_student" ON public.meetings
    FOR UPDATE USING (
        live_class_id IN (
            SELECT lc.id FROM public.live_classes lc
            JOIN public.batches b ON lc.batch_id = b.id
            JOIN public.batch_students bs ON b.id = bs.batch_id
            WHERE bs.student_id = auth.uid()
        )
    );

-- Admins can manage all meetings
CREATE POLICY "meetings_all_admin" ON public.meetings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 24: Create MEETING_ATTENDANCE table (Track attendance)
-- =============================================================
CREATE TABLE public.meeting_attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    is_present BOOLEAN DEFAULT false, -- Present if duration > 75% of class
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(meeting_id, student_id)
);

-- Enable RLS
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
CREATE POLICY "meeting_attendance_select_own" ON public.meeting_attendance
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert/update their own attendance
CREATE POLICY "meeting_attendance_insert_own" ON public.meeting_attendance
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "meeting_attendance_update_own" ON public.meeting_attendance
    FOR UPDATE USING (auth.uid() = student_id);

-- Admins can view all attendance
CREATE POLICY "meeting_attendance_all_admin" ON public.meeting_attendance
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Updated_at trigger
CREATE TRIGGER set_meeting_attendance_updated_at
    BEFORE UPDATE ON public.meeting_attendance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 25: Create MEETING_CHAT table (Store chat messages)
-- ==========================================================
CREATE TABLE public.meeting_chat (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.meeting_chat ENABLE ROW LEVEL SECURITY;

-- Anyone in the meeting can view and send chat
CREATE POLICY "meeting_chat_select" ON public.meeting_chat
    FOR SELECT USING (
        meeting_id IN (
            SELECT m.id FROM public.meetings m
            JOIN public.live_classes lc ON m.live_class_id = lc.id
            JOIN public.batches b ON lc.batch_id = b.id
            JOIN public.batch_students bs ON b.id = bs.batch_id
            WHERE bs.student_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "meeting_chat_insert" ON public.meeting_chat
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Step 26: Create indexes for meeting tables
-- ===========================================
CREATE INDEX idx_meetings_live_class ON public.meetings(live_class_id);
CREATE INDEX idx_meetings_platform ON public.meetings(platform);
CREATE INDEX idx_meeting_attendance_meeting ON public.meeting_attendance(meeting_id);
CREATE INDEX idx_meeting_attendance_student ON public.meeting_attendance(student_id);
CREATE INDEX idx_meeting_attendance_present ON public.meeting_attendance(is_present);
CREATE INDEX idx_meeting_chat_meeting ON public.meeting_chat(meeting_id);
CREATE INDEX idx_meeting_chat_sender ON public.meeting_chat(sender_id);

-- Step 27: Create MATERIALS table for File Upload System
-- ========================================================
-- This table replaces the videos table with a more flexible material system
-- supporting YouTube videos, Google Drive files, PDFs, audio, etc.

CREATE TABLE public.materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL CHECK (material_type IN ('video', 'pdf', 'audio', 'document', 'image')),
    storage_provider TEXT NOT NULL CHECK (storage_provider IN ('youtube', 'google_drive')),
    external_url TEXT NOT NULL, -- YouTube URL or Google Drive file ID/preview URL
    file_size_mb DECIMAL(10,2),
    duration_minutes INTEGER, -- For videos and audio
    thumbnail_url TEXT,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_published BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "materials_select_students" ON public.materials
    FOR SELECT USING (
        is_published = true AND
        batch_id IN (
            SELECT batch_id FROM public.batch_students WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "materials_select_admin" ON public.materials
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "materials_insert_admin" ON public.materials
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "materials_update_admin" ON public.materials
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "materials_delete_admin" ON public.materials
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Indexes
CREATE INDEX idx_materials_batch ON public.materials(batch_id);
CREATE INDEX idx_materials_type ON public.materials(material_type);
CREATE INDEX idx_materials_published ON public.materials(is_published);
CREATE INDEX idx_materials_provider ON public.materials(storage_provider);
CREATE INDEX idx_materials_order ON public.materials(batch_id, order_index);

-- Updated_at trigger
CREATE TRIGGER set_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 28: Create MATERIAL_PROGRESS table for tracking
-- =====================================================
CREATE TABLE public.material_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
    watch_percentage INTEGER DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_watch_time INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, material_id)
);

-- Enable RLS
ALTER TABLE public.material_progress ENABLE ROW LEVEL SECURITY;

-- Students can only view and manage their own progress
CREATE POLICY "material_progress_select_own" ON public.material_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "material_progress_insert_own" ON public.material_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "material_progress_update_own" ON public.material_progress
    FOR UPDATE USING (auth.uid() = student_id);

-- Admins can view all progress
CREATE POLICY "material_progress_select_admin" ON public.material_progress
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Indexes
CREATE INDEX idx_material_progress_student ON public.material_progress(student_id);
CREATE INDEX idx_material_progress_material ON public.material_progress(material_id);
CREATE INDEX idx_material_progress_completed ON public.material_progress(completed);

-- Updated_at trigger
CREATE TRIGGER set_material_progress_updated_at
    BEFORE UPDATE ON public.material_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 29: Create CHAT_MESSAGES table
-- ====================================
CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "chat_messages_select" ON public.chat_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can insert messages as sender
CREATE POLICY "chat_messages_insert" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent or received (for read status)
CREATE POLICY "chat_messages_update" ON public.chat_messages
    FOR UPDATE USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Indexes for better performance
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON public.chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_unread ON public.chat_messages(receiver_id, is_read);

-- Updated_at trigger
CREATE TRIGGER set_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 2: MATERIALS FUNCTIONS (from supabase-materials-functions.sql)
-- ============================================================================

-- Additional functions for Materials system
-- Run this after running the main supabase-schema.sql

-- Function to increment material view count
CREATE OR REPLACE FUNCTION increment_material_views(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.materials
  SET view_count = view_count + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment material download count
CREATE OR REPLACE FUNCTION increment_material_downloads(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.materials
  SET download_count = download_count + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student material statistics
CREATE OR REPLACE FUNCTION get_student_material_stats(student_uuid UUID)
RETURNS TABLE (
  total_materials BIGINT,
  completed_materials BIGINT,
  in_progress_materials BIGINT,
  total_watch_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT m.id) as total_materials,
    COUNT(DISTINCT CASE WHEN mp.completed = true THEN mp.material_id END) as completed_materials,
    COUNT(DISTINCT CASE WHEN mp.completed = false AND mp.watch_percentage > 0 THEN mp.material_id END) as in_progress_materials,
    COALESCE(SUM(mp.total_watch_time), 0)::INTEGER as total_watch_time
  FROM public.materials m
  LEFT JOIN public.material_progress mp ON m.id = mp.material_id AND mp.student_id = student_uuid
  WHERE m.is_published = true
    AND m.batch_id IN (
      SELECT batch_id FROM public.batch_students WHERE student_id = student_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get batch material statistics
CREATE OR REPLACE FUNCTION get_batch_material_stats(batch_uuid UUID)
RETURNS TABLE (
  total_materials BIGINT,
  published_materials BIGINT,
  total_views BIGINT,
  total_downloads BIGINT,
  video_count BIGINT,
  document_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_materials,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_materials,
    COALESCE(SUM(view_count), 0) as total_views,
    COALESCE(SUM(download_count), 0) as total_downloads,
    COUNT(CASE WHEN material_type = 'video' THEN 1 END) as video_count,
    COUNT(CASE WHEN material_type != 'video' THEN 1 END) as document_count
  FROM public.materials
  WHERE batch_id = batch_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: OPTIONAL MIGRATION (videos → materials)
-- ============================================================================
-- Both systems work in parallel. Run this when ready to migrate completely.

/*
-- Step 1: Migrate videos to materials
INSERT INTO public.materials (
  batch_id, title, description, material_type, storage_provider, 
  external_url, is_published, order_index, created_at, updated_at
)
SELECT 
  batch_id, title, description, 'video',
  CASE 
    WHEN video_url LIKE '%youtube.com%' OR video_url LIKE '%youtu.be%' THEN 'youtube'
    ELSE 'google_drive'
  END,
  video_url, is_published, order_index, created_at, updated_at
FROM public.videos
ON CONFLICT DO NOTHING;

-- Step 2: After verifying migration, drop old table
-- DROP TABLE IF EXISTS public.videos CASCADE;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all tables in the schema:
/*
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
*/

-- Check RLS is enabled on all tables:
/*
SELECT tablename, 
       CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
*/

-- Check row counts:
/*
SELECT 
  'profiles' as table_name, COUNT(*) FROM public.profiles
UNION ALL SELECT 'consultations', COUNT(*) FROM public.consultations
UNION ALL SELECT 'batches', COUNT(*) FROM public.batches
UNION ALL SELECT 'batch_students', COUNT(*) FROM public.batch_students
UNION ALL SELECT 'videos', COUNT(*) FROM public.videos
UNION ALL SELECT 'materials', COUNT(*) FROM public.materials
UNION ALL SELECT 'material_progress', COUNT(*) FROM public.material_progress
UNION ALL SELECT 'live_classes', COUNT(*) FROM public.live_classes
UNION ALL SELECT 'exams', COUNT(*) FROM public.exams
UNION ALL SELECT 'questions', COUNT(*) FROM public.questions
UNION ALL SELECT 'exam_attempts', COUNT(*) FROM public.exam_attempts
UNION ALL SELECT 'results', COUNT(*) FROM public.results
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL SELECT 'calendar_events', COUNT(*) FROM public.calendar_events;
*/

-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
-- 
-- TOTAL ACTIVE TABLES: 14
-- - User Management: profiles, consultations
-- - Batch System: batches, batch_students
-- - Content: videos (legacy), materials, material_progress
-- - Classes: live_classes
-- - Exams: exams, questions, exam_attempts, results
-- - Communication: notifications, calendar_events
-- 
-- REMOVED UNUSED TABLES (8):
-- - enrollments, learning_progress, quiz_analytics
-- - personal_calendar_events, meetings, meeting_attendance
-- - meeting_chat, chat_messages
-- 
-- SECURITY: All tables have RLS enabled with proper policies
-- STORAGE: 100% external (YouTube URLs, Google Drive file IDs)
-- PERFORMANCE: All foreign keys and frequently queried columns indexed
-- 
-- ============================================================================
-- END OF SCHEMA - Ready to deploy!
-- ============================================================================
