-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom types
CREATE TYPE user_role AS ENUM ('hr', 'employee');

-- Create levels table
CREATE TABLE levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL UNIQUE,
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users profile table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'employee',
  avatar_url TEXT,
  department VARCHAR(100),
  current_level_id UUID REFERENCES levels(id),
  contact_info JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '{}',
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default levels
INSERT INTO levels (name, order_index, criteria) VALUES
('Junior', 1, 'Entry level position requiring basic skills'),
('Mid-Level', 2, 'Intermediate position requiring 2-3 years experience'),
('Senior', 3, 'Advanced position requiring 5+ years experience'),
('Lead', 4, 'Leadership position requiring 7+ years experience'),
('Principal', 5, 'Expert level position requiring 10+ years experience');

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_department ON user_profiles(department);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_assessments_level_id ON assessments(level_id);
