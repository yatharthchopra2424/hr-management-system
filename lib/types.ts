export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "hr" | "employee"
          employee_code?: string
          position?: string
          department?: string
          level_id?: string
          created_at: string
          updated_at: string
          levels?: Level
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: "hr" | "employee"
          employee_code?: string
          position?: string
          department?: string
          level_id?: string
          created_at?: string
          updated_at?: string
          levels?: Level
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "hr" | "employee"
          employee_code?: string
          position?: string
          department?: string
          level_id?: string
          created_at?: string
          updated_at?: string
          levels?: Level
        }
      }
      levels: {
        Row: {
          id: string
          name: string
          description?: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          title: string
          description?: string
          level_id: string
          questions: AssessmentQuestion[]
          passing_score: number
          time_limit?: number
          created_at: string
          updated_at: string
          levels: Level
        }
        Insert: {
          id?: string
          title: string
          description?: string
          level_id: string
          questions?: AssessmentQuestion[]
          passing_score: number
          time_limit?: number
          created_at?: string
          updated_at?: string
          levels?: Level
        }
        Update: {
          id?: string
          title?: string
          description?: string
          level_id?: string
          questions?: AssessmentQuestion[]
          passing_score?: number
          time_limit?: number
          created_at?: string
          updated_at?: string
          levels?: Level
        }
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          assessment_id: string
          score: number
          passed: boolean
          answers: Record<string, any>
          taken_at: string
          completed_at?: string
          user_profiles: UserProfile
          assessments: Assessment
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id: string
          score: number
          passed: boolean
          answers?: Record<string, any>
          taken_at?: string
          completed_at?: string
          user_profiles?: UserProfile
          assessments?: Assessment
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string
          score?: number
          passed?: boolean
          answers?: Record<string, any>
          taken_at?: string
          completed_at?: string
          user_profiles?: UserProfile
          assessments?: Assessment
        }
      }
      assessment_ratings: {
        Row: {
          id: string
          employee_id: string
          rated_by: string | null
          rating_period: string
          overall_rating: number | null
          technical_skills: number | null
          communication: number | null
          teamwork: number | null
          leadership: number | null
          problem_solving: number | null
          punctuality: number | null
          initiative: number | null
          goals_achieved: string | null
          areas_for_improvement: string | null
          training_recommendations: string | null
          hr_comments: string | null
          employee_comments: string | null
          status: string
          created_at: string
          updated_at: string
          finalized_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          rated_by?: string | null
          rating_period: string
          overall_rating?: number | null
          technical_skills?: number | null
          communication?: number | null
          teamwork?: number | null
          leadership?: number | null
          problem_solving?: number | null
          punctuality?: number | null
          initiative?: number | null
          goals_achieved?: string | null
          areas_for_improvement?: string | null
          training_recommendations?: string | null
          hr_comments?: string | null
          employee_comments?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          finalized_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          rated_by?: string | null
          rating_period?: string
          overall_rating?: number | null
          technical_skills?: number | null
          communication?: number | null
          teamwork?: number | null
          leadership?: number | null
          problem_solving?: number | null
          punctuality?: number | null
          initiative?: number | null
          goals_achieved?: string | null
          areas_for_improvement?: string | null
          training_recommendations?: string | null
          hr_comments?: string | null
          employee_comments?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          finalized_at?: string | null
        }
      }
      performance_goals: {
        Row: {
          id: string
          employee_id: string
          set_by: string | null
          title: string
          description: string | null
          target_date: string | null
          priority: string
          status: string
          progress_percentage: number
          employee_notes: string | null
          manager_notes: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          set_by?: string | null
          title: string
          description?: string | null
          target_date?: string | null
          priority?: string
          status?: string
          progress_percentage?: number
          employee_notes?: string | null
          manager_notes?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          set_by?: string | null
          title?: string
          description?: string | null
          target_date?: string | null
          priority?: string
          status?: string
          progress_percentage?: number
          employee_notes?: string | null
          manager_notes?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      ratings: {
        Row: {
          id: string
          employee_id: string
          rated_by: string
          rating: number
          feedback?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          rated_by: string
          rating: number
          feedback?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          rated_by?: string
          rating?: number
          feedback?: string
          created_at?: string
          updated_at?: string
        }
      }
      employee_ratings: {
        Row: {
          id: string
          employee_id: string
          rated_by: string
          performance_score: number
          technical_skills: number
          communication: number
          teamwork: number
          leadership: number
          comments?: string
          rating_period: string
          created_at: string
          updated_at: string
          employee: UserProfile
          rater: UserProfile
        }
        Insert: {
          id?: string
          employee_id: string
          rated_by: string
          performance_score: number
          technical_skills: number
          communication: number
          teamwork: number
          leadership: number
          comments?: string
          rating_period: string
          created_at?: string
          updated_at?: string
          employee?: UserProfile
          rater?: UserProfile
        }
        Update: {
          id?: string
          employee_id?: string
          rated_by?: string
          performance_score?: number
          technical_skills?: number
          communication?: number
          teamwork?: number
          leadership?: number
          comments?: string
          rating_period?: string
          created_at?: string
          updated_at?: string
          employee?: UserProfile
          rater?: UserProfile
        }
      }
    }
  }
}

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type Level = Database["public"]["Tables"]["levels"]["Row"]
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type AssessmentRating = Database["public"]["Tables"]["assessment_ratings"]["Row"]
export type PerformanceGoal = Database["public"]["Tables"]["performance_goals"]["Row"]
export type Rating = Database["public"]["Tables"]["ratings"]["Row"]
export type EmployeeRating = Database["public"]["Tables"]["employee_ratings"]["Row"]

export interface AssessmentQuestion {
  id: string
  assessment_id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  correct_answer: string
  points: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface AssessmentResponse {
  id: string
  assessment_id: string
  employee_id: string
  responses: Record<string, any>
  score?: number
  completed_at: string
}
