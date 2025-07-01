-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS assessment_ratings CASCADE;
DROP TABLE IF EXISTS performance_goals CASCADE;
DROP TABLE IF EXISTS assessment_results CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;

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
  employee_code VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  qualification TEXT,
  total_experience VARCHAR(50),
  remarks TEXT,
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

-- Create assessment ratings table for HR ratings
CREATE TABLE assessment_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating_period VARCHAR(50) NOT NULL,
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
CREATE TABLE performance_goals (
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
CREATE INDEX idx_user_profiles_employee_code ON user_profiles(employee_code);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_assessments_level_id ON assessments(level_id);
CREATE INDEX idx_assessment_ratings_employee_id ON assessment_ratings(employee_id);
CREATE INDEX idx_assessment_ratings_rated_by ON assessment_ratings(rated_by);
CREATE INDEX idx_assessment_ratings_period ON assessment_ratings(rating_period);
CREATE INDEX idx_performance_goals_employee_id ON performance_goals(employee_id);
CREATE INDEX idx_performance_goals_status ON performance_goals(status);

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_ratings_updated_at
  BEFORE UPDATE ON assessment_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at
  BEFORE UPDATE ON performance_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "HR can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Levels policies (read-only for employees, full access for HR)
CREATE POLICY "Everyone can view levels" ON levels
  FOR SELECT USING (true);

CREATE POLICY "HR can manage levels" ON levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Assessments policies
CREATE POLICY "Everyone can view assessments" ON assessments
  FOR SELECT USING (true);

CREATE POLICY "HR can manage assessments" ON assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Assessment results policies
CREATE POLICY "Users can view their own results" ON assessment_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results" ON assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR can view all results" ON assessment_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Assessment ratings policies

-- HR can view all ratings
CREATE POLICY "HR can view all assessment ratings" ON assessment_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- HR can insert ratings
CREATE POLICY "HR can create assessment ratings" ON assessment_ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- HR can update ratings
CREATE POLICY "HR can update assessment ratings" ON assessment_ratings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Employees can view their own ratings (only finalized ones)
CREATE POLICY "Employees can view their own finalized ratings" ON assessment_ratings
  FOR SELECT USING (
    auth.uid() = employee_id AND status = 'finalized'
  );

-- Employees can add comments to their ratings
CREATE POLICY "Employees can update their own rating comments" ON assessment_ratings
  FOR UPDATE USING (
    auth.uid() = employee_id AND status IN ('submitted', 'reviewed')
  )
  WITH CHECK (
    auth.uid() = employee_id
  );

-- Performance Goals Policies

-- HR can manage all goals
CREATE POLICY "HR can manage all performance goals" ON performance_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Employees can view their own goals
CREATE POLICY "Employees can view their own goals" ON performance_goals
  FOR SELECT USING (auth.uid() = employee_id);

-- Employees can update progress and notes on their goals
CREATE POLICY "Employees can update their goal progress" ON performance_goals
  FOR UPDATE USING (auth.uid() = employee_id)
  WITH CHECK (auth.uid() = employee_id);
