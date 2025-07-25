// Person（本人）の型定義
export interface Person {
  id: string;
  name: string;
  birthDate: string;
  profileImageUrl?: string;
  medicalHistory?: string;
  currentHealthStatus?: string;
  livingEnvironment?: string;
  familyStructure?: string;
  communicationAbility?: string;
  cognitiveStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーションの型定義
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
