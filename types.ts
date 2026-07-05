
export interface OrderItem {
  id: string;
  description: string;
  details: string[];
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  address: string[];
  email: string;
  phone: string;
  avatarUrl: string;
}

export interface CompanyInfo {
  name: string;
  contact: string;
  address: string[];
  regNo: string;
  email: string;
  website: string;
  terms: string;
  paymentInstructions: string;
  logoUrl?: string;
  bankName?: string;
  sortCode?: string;
  accountNo?: string;
  accountHolder?: string;
  routingNo?: string;
  swift?: string;
  iban?: string;
  showIban?: boolean;
  showRoutingNo?: boolean;
  vatNo?: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  description: string;
  date: string;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
}

export interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isIncoming: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  date: string;
  type: 'production' | 'capture';
}

export interface SavedDocument {
  id: string;
  documentNumber: string;
  title: string;
  type: 'invoice' | 'receipt' | 'confirmation' | 'quote' | 'custom';
  createdDate: string;
  amount: number;
  customerName: string;
  itemsCount: number;
  tags?: string[];
  notes?: string;
  snapshotData?: {
    order: Order;
    customer: Customer;
    companyInfo: CompanyInfo;
  };
}

export interface BusinessProfile {
  id: string;
  name: string;
  companyInfo: CompanyInfo;
  customer: Customer;
  order: Order;
  gallery: GalleryItem[];
  recentOrders: RecentOrder[];
  savedDocuments: SavedDocument[];
  lastUpdated: string;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  CONFIRMATION = 'CONFIRMATION',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  DOCUMENTS = 'DOCUMENTS',
  EMAIL = 'EMAIL',
  GALLERY = 'GALLERY',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS'
}