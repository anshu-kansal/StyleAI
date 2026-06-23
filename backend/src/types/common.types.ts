import { UserRole } from '../constants/enums';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortQuery {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface UserTokenPayload {
  id: string;
  email: string;
  roles: UserRole[];
  name: string;
}

export interface ApiResponseType<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
