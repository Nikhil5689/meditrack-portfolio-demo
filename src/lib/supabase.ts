import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { initializeDemoData } from './demoData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  !supabaseUrl.includes('placeholder-project')
);

// Under the hood, keep the real client
const realSupabase = createClient<Database>(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);

const DEMO_USER_ID = 'demo-user-id';
const DEMO_SESSION = {
  user: {
    id: DEMO_USER_ID,
    email: 'demo@meditrack.app',
    user_metadata: {
      display_name: 'Sales Rep: Rajesh Kumar'
    }
  },
  access_token: 'demo-token'
};

// Check if a demo session is currently active
export function isDemoSessionActive(): boolean {
  return localStorage.getItem('meditrack_session') !== null;
}

// Clear demo data and re-initialize it
export function refreshDemoData() {
  localStorage.removeItem('meditrack_demo_doctors');
  localStorage.removeItem('meditrack_demo_medicines');
  localStorage.removeItem('meditrack_demo_orders');
  localStorage.removeItem('meditrack_demo_order_items');
  localStorage.removeItem('meditrack_demo_seeded');
  initializeDemoData();
}

// Mock Query Builder mimicking Supabase chainable API
class MockQueryBuilder {
  private table: string;
  private filters: { col: string; op: string; val: any }[] = [];
  private orderCol: string = '';
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private updatePayload: any = null;
  private insertPayload: any = null;
  private isDeleteOp: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, op: 'eq', val });
    return this;
  }

  neq(col: string, val: any) {
    this.filters.push({ col, op: 'neq', val });
    return this;
  }

  gte(col: string, val: any) {
    this.filters.push({ col, op: 'gte', val });
    return this;
  }

  lte(col: string, val: any) {
    this.filters.push({ col, op: 'lte', val });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(data: any) {
    this.insertPayload = data;
    return this;
  }

  update(data: any) {
    this.updatePayload = data;
    return this;
  }

  delete() {
    this.isDeleteOp = true;
    return this;
  }

  // Thenable implementation to support await/promises
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : result;
    } catch (error) {
      if (onrejected) return onrejected(error);
      throw error;
    }
  }

  private getList(key: string): any[] {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : [];
  }

  private setList(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private async execute() {
    const key = `meditrack_demo_${this.table}`;
    if (!localStorage.getItem('meditrack_demo_seeded')) {
      initializeDemoData();
    }

    let list = this.getList(key);

    // INSERT
    if (this.insertPayload) {
      const items = Array.isArray(this.insertPayload) ? this.insertPayload : [this.insertPayload];
      const newItems = items.map((item: any) => ({
        id: item.id || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        ...item
      }));
      this.setList(key, [...list, ...newItems]);
      return { data: Array.isArray(this.insertPayload) ? newItems : newItems[0], error: null };
    }

    // UPDATE
    if (this.updatePayload) {
      let updated = false;
      const updatedList = list.map((item: any) => {
        const matches = this.filters.every(f => {
          if (f.op === 'eq') return item[f.col] === f.val;
          return true;
        });
        if (matches) {
          updated = true;
          return { ...item, ...this.updatePayload };
        }
        return item;
      });
      this.setList(key, updatedList);
      return { data: this.updatePayload, error: null };
    }

    // DELETE
    if (this.isDeleteOp) {
      const filteredList = list.filter((item: any) => {
        const matches = this.filters.every(f => {
          if (f.op === 'eq') return item[f.col] === f.val;
          return true;
        });
        return !matches;
      });
      this.setList(key, filteredList);
      return { data: null, error: null };
    }

    // SELECT (Filter, Order, Limit)
    let result = list.filter((item: any) => {
      return this.filters.every(f => {
        const itemVal = item[f.col];
        if (f.op === 'eq') return itemVal === f.val;
        if (f.op === 'neq') return itemVal !== f.val;
        if (f.op === 'gte') return itemVal >= f.val;
        if (f.op === 'lte') return itemVal <= f.val;
        return true;
      });
    });

    if (this.orderCol) {
      result.sort((a, b) => {
        const valA = a[this.orderCol];
        const valB = b[this.orderCol];
        if (typeof valA === 'string') {
          return this.orderAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.orderAsc ? valA - valB : valB - valA;
      });
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    // Enrich joins
    if (this.table === 'orders') {
      const doctorsList = this.getList('meditrack_demo_doctors');
      const itemsList = this.getList('meditrack_demo_order_items');
      const medicinesList = this.getList('meditrack_demo_medicines');

      result = result.map((order: any) => {
        const doc = doctorsList.find(d => d.id === order.doctor_id);
        const orderItems = itemsList
          .filter(oi => oi.order_id === order.id)
          .map(oi => {
            const med = medicinesList.find(m => m.id === oi.medicine_id);
            return {
              ...oi,
              medicines: med || null
            };
          });

        return {
          ...order,
          doctors: doc || null,
          order_items: orderItems
        };
      });
    } else if (this.table === 'order_items') {
      const medicinesList = this.getList('meditrack_demo_medicines');
      result = result.map((item: any) => {
        const med = medicinesList.find(m => m.id === item.medicine_id);
        return {
          ...item,
          medicines: med || null
        };
      });
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: result[0] ? null : new Error('No records found') };
    }
    if (this.isMaybeSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }
}

// Authentication Wrapper Interceptor
const auth = {
  async getSession() {
    const sessionStr = localStorage.getItem('meditrack_session');
    if (sessionStr) {
      return { data: { session: JSON.parse(sessionStr) }, error: null };
    }
    if (isSupabaseConfigured) {
      return realSupabase.auth.getSession();
    }
    return { data: { session: null }, error: null };
  },

  onAuthStateChange(callback: (event: any, session: any) => void) {
    const handleAuthChange = () => {
      const s = localStorage.getItem('meditrack_session');
      callback('SIGNED_IN', s ? JSON.parse(s) : null);
    };
    window.addEventListener('meditrack_auth_change', handleAuthChange);

    let realUnsub: (() => void) | null = null;
    if (isSupabaseConfigured) {
      const { data: { subscription } } = realSupabase.auth.onAuthStateChange((event: any, session: any) => {
        if (localStorage.getItem('meditrack_session') === null) {
          callback(event, session);
        }
      });
      realUnsub = () => subscription.unsubscribe();
    }

    return {
      data: {
        subscription: {
          unsubscribe() {
            window.removeEventListener('meditrack_auth_change', handleAuthChange);
            if (realUnsub) {
              realUnsub();
            }
          }
        }
      }
    };
  },

  async signInWithPassword(credentials: any) {
    const { email } = credentials;
    if (email === 'demo@meditrack.app') {
      const session = DEMO_SESSION;
      localStorage.setItem('meditrack_session', JSON.stringify(session));
      // Trigger a clean initialization of data
      if (!localStorage.getItem('meditrack_demo_seeded')) {
        initializeDemoData();
      }
      window.dispatchEvent(new Event('meditrack_auth_change'));
      return { data: { session }, error: null };
    }

    if (isSupabaseConfigured) {
      return realSupabase.auth.signInWithPassword(credentials);
    }
    
    return { 
      data: { session: null }, 
      error: new Error('Supabase is not configured. Please use "Demo Login".') 
    };
  },

  async signOut() {
    if (localStorage.getItem('meditrack_session') !== null) {
      localStorage.removeItem('meditrack_session');
      window.dispatchEvent(new Event('meditrack_auth_change'));
      return { error: null };
    }
    if (isSupabaseConfigured) {
      return realSupabase.auth.signOut();
    }
    return { error: null };
  }
};

// Main Wrapped Supabase Client
export const supabase = {
  auth,
  from(table: string) {
    const isDemo = localStorage.getItem('meditrack_session') !== null;
    if (isDemo || !isSupabaseConfigured) {
      return new MockQueryBuilder(table) as any;
    }
    return realSupabase.from(table);
  }
};
