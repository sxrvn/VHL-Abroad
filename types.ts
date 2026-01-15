
export interface NavItem {
  label: string;
  path: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  highlights: string[];
  image: string;
}

export enum GermanLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2'
}

// Dashboard Types

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface BatchStudent {
  id: string;
  batch_id: string;
  student_id: string;
  access_expiry: string;
  created_at: string;
  batch?: Batch;
  student?: Profile;
}

export interface Video {
  id: string;
  batch_id: string;
  title: string;
  video_url: string;
  description?: string;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  batch?: Batch;
}

// New Material interface for the file upload system
export interface Material {
  id: string;
  batch_id: string;
  title: string;
  description?: string;
  material_type: 'video' | 'pdf' | 'audio' | 'document' | 'image';
  storage_provider: 'youtube' | 'google_drive';
  external_url: string;
  file_size_mb?: number;
  duration_minutes?: number;
  thumbnail_url?: string;
  view_count: number;
  download_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  order_index: number;
  batch?: Batch;
}

export interface MaterialProgress {
  id: string;
  student_id: string;
  material_id: string;
  watch_percentage: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  material?: Material;
}


export interface LiveClass {
  id: string;
  batch_id: string;
  title: string;
  meeting_link: string;
  scheduled_at: string;
  duration_minutes: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  batch?: Batch;
}

export interface Exam {
  id: string;
  batch_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks?: number;
  is_published: boolean;
  publish_result: boolean;
  created_at: string;
  updated_at: string;
  batch?: Batch;
  questions?: Question[];
}

export interface Question {
  id: string;
  exam_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  marks: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  exam_id: string;
  answers: Record<string, string>; // question_id -> selected_option
  is_submitted: boolean;
  submitted_at?: string;
  started_at: string;
  created_at: string;
  updated_at: string;
  exam?: Exam;
}

export interface Result {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  created_at: string;
  exam?: Exam;
  student?: Profile;
}

export interface LearningProgress {
  id: string;
  student_id: string;
  video_id: string;
  watch_percentage: number;
  completed: boolean;
  last_watched_at?: string;
  created_at: string;
  updated_at: string;
  video?: Video;
}

export interface ProgressSummary {
  totalVideos: number;
  completedVideos: number;
  averageCompletion: number;
  lastActivity?: string;
}