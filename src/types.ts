export type ApplicationStatus = 'Pendente' | 'Em Análise' | 'Aprovado' | 'Rejeitado';

export interface Question {
  id: number;
  title: string;
  subtitle?: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface StaffApplication {
  id: string;
  discordUsername: string;
  age: number;
  submittedAt: string;
  status: ApplicationStatus;
  answers: Record<number, string>;
  adminNotes: string;
  reviewedBy?: string;
  reviewedAt?: string;
  authToken?: string;
}

export interface UserSession {
  discordUsername: string;
  isAdmin: boolean;
  token: string;
}
