-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create training table
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trainer_name VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER,
  max_participants INTEGER,
  department VARCHAR(100),
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training participants table
CREATE TABLE IF NOT EXISTS training_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'absent', 'completed')),
  completion_date TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(training_id, user_id)
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee skills table
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER CHECK (level >= 1 AND level <= 5) NOT NULL,
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, skill_id)
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  head_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
('Human Resources', 'Employee management and organizational development'),
('Information Technology', 'Software development and IT infrastructure'),
('Marketing', 'Brand management and customer acquisition'),
('Finance', 'Financial planning and accounting'),
('Sales', 'Revenue generation and client relations'),
('Operations', 'Business operations and process management')
ON CONFLICT (name) DO NOTHING;

-- Insert default skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Technical'),
('React', 'Technical'),
('Node.js', 'Technical'),
('Python', 'Technical'),
('SQL', 'Technical'),
('Project Management', 'Management'),
('Team Leadership', 'Management'),
('Communication', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Digital Marketing', 'Marketing'),
('Content Strategy', 'Marketing'),
('Data Analysis', 'Analytics'),
('Financial Planning', 'Finance'),
('Sales Strategy', 'Sales'),
('Customer Service', 'Sales')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(start_date);
CREATE INDEX IF NOT EXISTS idx_training_participants_training ON training_participants(training_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_user ON employee_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_skill ON employee_skills(skill_id);

-- Add department reference to user_profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'department_id') THEN
        ALTER TABLE user_profiles ADD COLUMN department_id UUID REFERENCES departments(id);
    END IF;
END $$;

-- Create RLS policies for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON attendance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "HR can view all attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can manage all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Create RLS policies for training
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view training sessions" ON training_sessions
  FOR SELECT USING (true);

CREATE POLICY "HR can manage training sessions" ON training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Users can view their training participation" ON training_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for training" ON training_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "HR can manage all training participation" ON training_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Create RLS policies for skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "HR can manage skills" ON skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "Users can view their own skills" ON employee_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "HR can view all employee skills" ON employee_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

CREATE POLICY "HR can manage employee skills" ON employee_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Create RLS policies for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "HR can manage departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'hr'
    )
  );
