import toast from 'react-hot-toast';
import { errorTranslations } from './errors';
import {
  AuthRequest,
  AuthResponse,
  EditPasswordRequest,
  EditPasswordResponse,
  EditUserRequest,
  EditUserResponse,
  GetConfigResponse,
  GetGoalsRequest,
  GetGoalsResponse,
  GetMeResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  GetSupervisionsRequest,
  GetSupervisionsResponse,
  GetCharitiesRequest,
  GetCharitiesResponse,
  Goal,
  JudgeGoalRequest,
  JudgeGoalResponse,
  RefreshTokenResponse,
  SendCodeRequest,
  SendCodeResponse,
  SetGoalRequest,
  SetGoalResponse,
  SuperviseGoalRequest,
  SuperviseGoalResponse,
  VerifyPaymentRequest,
  VerifyPaymentRequestParams,
  VerifyPaymentResponse,
  VerifyPaymentResponseParams,
  ViewGoalRequest,
  ViewGoalResponse,
  User,
  UserDO,
  GetCharitiesResponse, // Added
} from '../types/api';

const API_BASE_URL = 'https://imotiv.ir/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number; // Add status code
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  if (!data.ok && data.error) {
    const translatedError = errorTranslations[data.error] || data.error;
    toast.error(translatedError);
  }
  return { ...data, status: response.status }; // Include status
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
    // For network errors, return a distinct status code like 0
    return { ok: false, error: 'خطا در برقراری ارتباط با سرور', status: 0 };
  }
}

export const api = {
  auth: {
    login: (data: AuthRequest) =>
      apiRequest<AuthResponse>('/auth', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    sendCode: (data: SendCodeRequest) =>
      apiRequest<SendCodeResponse>('/sendCode', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refreshToken: () =>
      apiRequest<RefreshTokenResponse>('/refreshToken', {
        method: 'POST',
      }),
  },

  user: {
    getMe: () =>
      apiRequest<GetMeResponse>('/getMe', {
        method: 'POST',
      }),

    editUser: (data: EditUserRequest) =>
      apiRequest<EditUserResponse>('/editUser', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    editPassword: (data: EditPasswordRequest) =>
      apiRequest<EditPasswordResponse>('/editPassword', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  goals: {
    create: (data: SetGoalRequest) =>
      apiRequest<SetGoalResponse>('/setGoal', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAll: (data: GetGoalsRequest) =>
      apiRequest<GetGoalsResponse>('/getGoals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getSupervisions: (data: GetSupervisionsRequest) =>
      apiRequest<GetSupervisionsResponse>('/getSupervisions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    view: (data: ViewGoalRequest) =>
      apiRequest<ViewGoalResponse>('/viewGoal', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    supervise: (data: SuperviseGoalRequest) =>
      apiRequest<SuperviseGoalResponse>('/superviseGoal', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  config: {
    get: () =>
      apiRequest<GetConfigResponse>('/getConfig', {
        method: 'POST',
      }),
  },

  payments: {
    getStatus: (data: GetPaymentRequest) =>
      apiRequest<GetPaymentResponse>('/getPayment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  charities: {
    getAll: () =>
      apiRequest<GetCharitiesResponse>('/getCharities', {
        method: 'GET',
      }),
  },
};
