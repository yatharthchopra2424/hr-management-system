-- Insert sample assessments
INSERT INTO assessments (title, level_id, questions, passing_score, created_by) VALUES
(
  'JavaScript Fundamentals',
  (SELECT id FROM levels WHERE name = 'Junior'),
  '[
    {
      "id": "1",
      "question": "What is the correct way to declare a variable in JavaScript?",
      "options": ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
      "correct_answer": 0,
      "explanation": "var is the traditional way to declare variables in JavaScript"
    },
    {
      "id": "2", 
      "question": "Which method is used to add an element to the end of an array?",
      "options": ["push()", "add()", "append()", "insert()"],
      "correct_answer": 0,
      "explanation": "push() method adds elements to the end of an array"
    }
  ]'::jsonb,
  70,
  NULL
),
(
  'React Development',
  (SELECT id FROM levels WHERE name = 'Mid-Level'),
  '[
    {
      "id": "1",
      "question": "What is JSX?",
      "options": ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
      "correct_answer": 0,
      "explanation": "JSX stands for JavaScript XML and allows writing HTML in React"
    },
    {
      "id": "2",
      "question": "Which hook is used for state management in functional components?",
      "options": ["useEffect", "useState", "useContext", "useReducer"],
      "correct_answer": 1,
      "explanation": "useState is the primary hook for managing state in functional components"
    }
  ]'::jsonb,
  75,
  NULL
),
(
  'System Architecture',
  (SELECT id FROM levels WHERE name = 'Senior'),
  '[
    {
      "id": "1",
      "question": "What is microservices architecture?",
      "options": ["Single large application", "Multiple small services", "Database architecture", "Frontend framework"],
      "correct_answer": 1,
      "explanation": "Microservices architecture breaks down applications into small, independent services"
    }
  ]'::jsonb,
  80,
  NULL
);

-- Note: Sample user data will be created when users sign up through the application
-- The trigger will automatically create user_profiles entries
