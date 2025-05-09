import toast from 'react-hot-toast';

const API_BASE_URL = 'https://imotiv.ir/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  if (!data.ok && data.error) {
    toast.error(data.error);
  }
  return data;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API Error:', error);
    toast.error('خطا در برقراری ارتباط با سرور');
    return { ok: false, error: 'خطا در برقراری ارتباط با سرور' };
  }
}

export interface AuthResponse {
  access_token: string;
  access_expire: number;
  refresh_after: number;
  is_new_user?: boolean;
}

export interface UserResponse {
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface GoalResponse {
  goal_id: number;
  goal: string;
  description: string;
  value: number;
  deadline: number;
  supervisor_phone_number: string;
  supervisor_email: string;
  done: boolean;
}

export interface PaymentResponse {
  goal_id: number;
  amount: number;
  pgp_name: string;
  tracing_code: string;
}

export const api = {
  auth: {
    login: (data: { phone_number: string; password?: string; code?: string }) =>
      apiRequest<AuthResponse>('/auth', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    sendCode: (phone_number: string) =>
      apiRequest('/sendCode', {
        method: 'POST',
        body: JSON.stringify({ phone_number }),
      }),
  },

  user: {
    getMe: () =>
      apiRequest<UserResponse>('/getMe', {
        method: 'POST',
      }),

    editUser: (data: Partial<UserResponse>) =>
      apiRequest<UserResponse>('/editUser', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    editPassword: (password: string, confirmation: string) =>
      apiRequest('/editPassword', {
        method: 'POST',
        body: JSON.stringify({ password, confirmation }),
      }),
  },

  goals: {
    create: (data: {
      goal: string;
      description?: string;
      value: number;
      deadline: number;
      supervisor_phone_number: string;
    }) =>
      apiRequest<{ payment_url: string }>('/setGoal', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAll: (page: number = 0) =>
      apiRequest<{ page: number; goals: GoalResponse[] }>('/getGoals', {
        method: 'POST',
        body: JSON.stringify({ page }),
      }),

    getSupervisions: (page: number = 0) =>
      apiRequest<{ page: number; goals: GoalResponse[] }>('/getSupervisions', {
        method: 'POST',
        body: JSON.stringify({ page }),
      }),

    view: (goal_id: number) =>
      apiRequest<GoalResponse>('/viewGoal', {
        method: 'POST',
        body: JSON.stringify({ goal_id }),
      }),

    supervise: (goal_id: number, done: boolean, description?: string) =>
      apiRequest<GoalResponse>('/superviseGoal', {
        method: 'POST',
        body: JSON.stringify({ goal_id, done, description }),
      }),
  },

  payments: {
    getStatus: (payment_id: number) =>
      apiRequest<PaymentResponse>('/getPayment', {
        method: 'POST',
        body: JSON.stringify({ payment_id }),
      }),
  },
};