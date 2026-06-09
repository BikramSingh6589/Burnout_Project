export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
}

export interface EnvironmentConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  emailUser: string;
  emailPassword: string;
  env: string;
}
