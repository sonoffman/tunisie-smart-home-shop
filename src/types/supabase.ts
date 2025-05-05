
// Add custom type definitions for tables not yet in the generated types

export interface TrainingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  position: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'confirmed' | 'cancelled';
  created_at: string;
}
