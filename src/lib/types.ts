export type Problem = {
  id: number;
  title: string;
  slug: string;
  description: string;
  constraints: string;
  time_limit: number;
  memory_limit: number;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  is_published: boolean;
  created_at: string;
};

export type TestCase = {
  id: number;
  problem_id: number;
  input: string;
  expected_output: string;
  is_sample: boolean;
};

export type Profile = {
  id: string;
  username: string;
  total_score: number;
  solved_count: number;
  is_admin: boolean;
};

export type Submission = {
  id: number;
  user_id: string;
  problem_id: number;
  code: string;
  language_id: number;
  status: string;
  score: number;
  passed_count: number;
  total_count: number;
  execution_time: number | null;
  memory: number | null;
  created_at: string;
};
