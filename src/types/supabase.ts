
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

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  items: any[];
  subtotal_ht: number;
  tva: number;
  timbre_fiscal: number;
  total_ttc: number;
  created_at: string;
  created_by: string;
}
