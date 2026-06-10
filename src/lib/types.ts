export interface Doctor {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  area: string;
  is_active: boolean;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  default_price: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  doctor_id: string;
  order_date: string;
  total_amount: number;
  payment_status: 'paid' | 'pending';
  invoice_number: string;
  notes: string;
  created_at: string;
  doctors?: Doctor;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  medicines?: Medicine;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface DashboardStats {
  totalSalesMonth: number;
  totalOrders: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  doctorId: string;
  month: string;
}

export type Page =
  | 'dashboard'
  | 'doctors'
  | 'medicines'
  | 'add-order'
  | 'all-orders'
  | 'daily-entry'
  | 'reports'
  | 'doctor-details';

export interface NavParams {
  doctorId?: string;
  editOrderId?: string;
}

export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: Doctor;
        Insert: Omit<Doctor, 'id' | 'created_at'>;
        Update: Partial<Omit<Doctor, 'id' | 'created_at'>>;
      };
      medicines: {
        Row: Medicine;
        Insert: Omit<Medicine, 'id' | 'created_at'>;
        Update: Partial<Omit<Medicine, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
    };
  };
}
