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

// Supporter（支援者）の型定義
export interface Supporter {
  id: string;
  name: string;
  role: string; // 家族、医師、看護師、ケアマネージャー、法定代理人など
  email: string;
  phone?: string;
  organization?: string;
  accessLevel: number; // 1-5
  verificationStatus: 'unverified' | 'verified';
  verifiedAt?: string;
  createdAt: string;
}

// LifeEvent（人生の出来事）の型定義
export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventType: '誕生' | '卒業' | '結婚' | '仕事' | '趣味' | '病気' | 'その他';
  location?: string;
  photos?: string[];
  emotionalValue?: number; // 1-10
  createdAt: string;
  createdBy: string;
}

// Decision（意思決定）の型定義
export interface Decision {
  id: string;
  category: '医療' | '財産' | '生活' | 'その他';
  title: string;
  description: string;
  decisionDate: string;
  context?: string;
  reasoning?: string;
  witnesses?: string[];
  documentUrl?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

// Preference（好み・価値観）の型定義
export interface Preference {
  id: string;
  category: '食事' | '趣味' | '生活様式' | '医療' | 'その他';
  item: string;
  preference: string;
  importance: number; // 1-5
  notes?: string;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// Document（文書）の型定義
export interface Document {
  id: string;
  title: string;
  documentType: '遺言書' | '委任状' | '診断書' | '契約書' | 'その他';
  fileUrl: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
  expirationDate?: string;
  tags?: string[];
}

// EmergencyInfo（緊急時情報）の型定義
export interface EmergencyInfo {
  id: string;
  infoType: '医療' | '連絡先' | 'その他';
  title: string;
  content: string;
  priority: number; // 1-3
  lastUpdated: string;
}

// AIInteraction（AI対話記録）の型定義
export interface AIInteraction {
  id: string;
  sessionId: string;
  query: string;
  response: string;
  confidence: number; // 0-1
  usedData?: string[];
  timestamp: string;
  requestedBy: string;
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
