export interface Goal {
  goal_id: number;
  goal: string;
  description: string;
  value: number;
  deadline: number;
  supervisor_phone_number: string;
  supervisor_email: string;
  done: boolean;
  created_at: number;
  supervised_at?: number;
  creator_phone_number: string;
  creator_first_name: string;
  creator_last_name: string;
  creator_email: string;
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  birth?: number;
  gender?: 'M' | 'F';
}
