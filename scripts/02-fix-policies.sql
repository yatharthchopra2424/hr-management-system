-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "HR can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "HR can manage levels" ON levels;
DROP POLICY IF EXISTS "HR can manage assessments" ON assessments;
DROP POLICY IF EXISTS "HR can view all results" ON assessment_results;
DROP POLICY IF EXISTS "HR can view all assessment ratings" ON assessment_ratings;
DROP POLICY IF EXISTS "HR can create assessment ratings" ON assessment_ratings;
DROP POLICY IF EXISTS "HR can update assessment ratings" ON assessment_ratings;
DROP POLICY IF EXISTS "HR can manage all performance goals" ON performance_goals;

-- Create non-recursive HR policies using auth.jwt() instead of user_profiles lookup

-- User profiles policies (fixed)
CREATE POLICY "HR can view all profiles" ON user_profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

CREATE POLICY "HR can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

CREATE POLICY "HR can update all profiles" ON user_profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Levels policies (fixed)
CREATE POLICY "HR can manage levels" ON levels
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Assessments policies (fixed)
CREATE POLICY "HR can manage assessments" ON assessments
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Assessment results policies (fixed)
CREATE POLICY "HR can view all results" ON assessment_results
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Assessment ratings policies (fixed)
CREATE POLICY "HR can view all assessment ratings" ON assessment_ratings
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

CREATE POLICY "HR can create assessment ratings" ON assessment_ratings
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

CREATE POLICY "HR can update assessment ratings" ON assessment_ratings
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );

-- Performance Goals Policies (fixed)
CREATE POLICY "HR can manage all performance goals" ON performance_goals
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
  );
