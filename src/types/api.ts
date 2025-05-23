export interface AuthRequest {
	phone_number: string;
	code?: string;
	password?: string;
}

export interface AuthResponse {
	access_token?: string;
	access_expire?: number;
	refresh_after?: number;
	is_new_user?: boolean;
}

export interface EditPasswordRequest {
	password?: string;
	confirmation?: string;
}

export interface EditPasswordResponse {
}

export interface EditUserRequest {
	username?: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	birth?: number;
	gender?: string;
	email?: string;
}

export interface EditUserResponse {
	user_id?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	profile_photo_url?: string;
	phone_number?: string;
	email?: string;
	birth?: number;
	gender?: string;
}

export interface GetConfigResponse {
	goal_creation_fee?: number;
	min_goal_hours?: number;
	max_goal_hours?: number;
	min_goal_value?: number;
	max_goal_value?: number;
	otp_timeout?: number;
	supervision_timeout_hours?: number;
}

export interface GetGoalsRequest {
	page: number;
}

export interface GetGoalsResponse {
	page: number;
	goals: Array<Goal>;
}

export interface GetMeResponse {
	user_id?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	profile_photo_url?: string;
	phone_number?: string;
	email?: string;
	birth?: number;
	gender?: string;
}

export interface GetPaymentRequest {
	payment_id: number;
}

export interface GetPaymentResponse {
	goal_id: number;
	amount: number;
	pgp_name: string;
	tracing_code: string;
}

export interface GetSupervisionsRequest {
	page: number;
}

export interface GetSupervisionsResponse {
	page?: number;
	goals?: Array<Goal>;
}

export interface Goal {
	goal_id?: number;
	goal?: string;
	description?: string;
	value?: number;
	deadline?: number;
	phone_number?: string;
	creator_first_name?: string;
	creator_last_name?: string;
	email?: string;
	supervisor_phone_number?: string;
	supervisor_email?: string;
	supervisor_description?: string;
	status?: number;
	donated_to?: string;
	done: boolean;
	created_at?: number;
	supervised_at?: number;
}

export interface JudgeGoalRequest {
	goal_id?: number;
	done?: boolean;
	status?: number;
	description?: string;
}

export interface JudgeGoalResponse {
	goal_id?: number;
	goal?: string;
	description?: string;
	value?: number;
	deadline?: number;
	phone_number?: string;
	creator_first_name?: string;
	creator_last_name?: string;
	email?: string;
	supervisor_phone_number?: string;
	supervisor_email?: string;
	supervisor_description?: string;
	status?: number;
	donated_to?: string;
	done: boolean;
	created_at?: number;
	supervised_at?: number;
}

export interface RefreshTokenResponse {
	access_token?: string;
	access_expire?: number;
	refresh_after?: number;
	is_new_user?: boolean;
}

export interface SendCodeRequest {
	phone_number?: string;
}

export interface SendCodeResponse {
	phone_number?: string;
	sent_at?: number;
	timeout?: number;
}

export interface SetGoalRequest {
	goal?: string;
	value?: number;
	deadline?: number;
	supervisor_phone_number?: string;
	supervisor_email?: string;
	description?: string;
}

export interface SetGoalResponse {
	payment_url?: string;
}

export interface SuperviseGoalRequest {
	goal_id?: number;
	done?: boolean;
	description?: string;
}

export interface SuperviseGoalResponse {
	goal_id?: number;
	goal?: string;
	description?: string;
	value?: number;
	deadline?: number;
	phone_number?: string;
	creator_first_name?: string;
	creator_last_name?: string;
	email?: string;
	supervisor_phone_number?: string;
	supervisor_email?: string;
	supervisor_description?: string;
	status?: number;
	donated_to?: string;
	done: boolean;
	created_at?: number;
	supervised_at?: number;
}

export interface User {
	user_id?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	profile_photo_url?: string;
	phone_number?: string;
	email?: string;
	birth?: number;
	gender?: string;
}

export interface UserDO {
	id: number;
	user_type: number;
	first_name: string;
	last_name: string;
	username: string;
	password: string;
	phone: string;
	email: string;
	photo_id: string;
	banned: boolean;
	ban_reason: string;
	deleted: boolean;
}

export interface VerifyPaymentRequest {
}
export interface VerifyPaymentRequestParams {
	Authority: string;
	Status: string;
}

export interface VerifyPaymentResponse {
}
export interface VerifyPaymentResponseParams {
}

export interface ViewGoalRequest {
	goal_id: number;
}

export interface ViewGoalResponse {
	goal_id?: number;
	goal?: string;
	description?: string;
	value?: number;
	deadline?: number;
	phone_number?: string;
	creator_first_name?: string;
	creator_last_name?: string;
	email?: string;
	supervisor_phone_number?: string;
	supervisor_email?: string;
	supervisor_description?: string;
	status?: number;
	donated_to?: string;
	done: boolean;
	created_at?: number;
	supervised_at?: number;
}
