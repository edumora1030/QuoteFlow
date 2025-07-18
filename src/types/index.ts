export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

export interface QuotationFile {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface Quotation {
  id: string;
  title: string;
  client: string;
  amount: number;
  date: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  purchaseOrderCreated: boolean;
  invoiceGenerated: boolean;
  invoicePaid: boolean;
  description: string;
  purchaseOrderFile?: QuotationFile;
  invoiceFile?: QuotationFile;
}

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

export type FilterType = 'all' | 'pendiente' | 'aprobada' | 'rechazada';