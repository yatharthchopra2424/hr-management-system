-- Row Level Security Policies for assessment_ratings

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

-- Enable RLS
ALTER TABLE assessment_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
