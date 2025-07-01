-- Add new fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_experience VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Create assessment ratings table for HR ratings
CREATE TABLE IF NOT EXISTS assessment_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating_period VARCHAR(50) NOT NULL, -- e.g., "Q1 2024", "Annual 2024"
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
  leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
  problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  initiative INTEGER CHECK (initiative >= 1 AND initiative <= 5),
  goals_achieved TEXT,
  areas_for_improvement TEXT,
  training_recommendations TEXT,
  hr_comments TEXT,
  employee_comments TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'finalized')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalized_at TIMESTAMP WITH TIME ZONE
);

-- Create performance goals table
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  set_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'overdue')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  employee_notes TEXT,
  manager_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_ratings_employee_id ON assessment_ratings(employee_id);
CREATE INDEX IF NOT EXISTS idx_assessment_ratings_rated_by ON assessment_ratings(rated_by);
CREATE INDEX IF NOT EXISTS idx_assessment_ratings_period ON assessment_ratings(rating_period);
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee_id ON performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_status ON performance_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_code ON user_profiles(employee_code);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_assessment_ratings_updated_at
  BEFORE UPDATE ON assessment_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at
  BEFORE UPDATE ON performance_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
