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

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
