/*
  # MediTrack MR - Complete Database Schema

  ## Overview
  Full schema for a Medical Representative order tracking system.

  ## New Tables

  ### doctors
  - id: UUID primary key
  - name: Doctor's full name
  - clinic: Clinic/Hospital name
  - phone: Contact number
  - area: Geographic area/location
  - is_active: Soft delete flag (1=active, 0=deleted)
  - created_at: Record creation timestamp

  ### medicines
  - id: UUID primary key
  - name: Medicine name
  - default_price: Default selling price
  - is_active: Soft delete flag
  - created_at: Record creation timestamp

  ### orders
  - id: UUID primary key
  - doctor_id: FK to doctors
  - order_date: Date of order
  - total_amount: Total order value
  - payment_status: 'paid' or 'pending'
  - invoice_number: Invoice reference (when paid)
  - notes: Optional notes
  - created_at: Record creation timestamp

  ### order_items
  - id: UUID primary key
  - order_id: FK to orders
  - medicine_id: FK to medicines
  - quantity: Number of units
  - price: Price per unit (editable from default)
  - total: quantity * price

  ## Security
  - RLS enabled on all tables
  - Public read/write access (single-user MR app, no auth required)

  ## Notes
  - No hard deletes; use is_active = false
  - Orders use transactions for data integrity
*/

CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  clinic text DEFAULT '',
  phone text DEFAULT '',
  area text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  default_price numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
  invoice_number text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_doctor_id ON orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_medicine_id ON order_items(medicine_id);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select on doctors"
  ON doctors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on doctors"
  ON doctors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on doctors"
  ON doctors FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon select on medicines"
  ON medicines FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on medicines"
  ON medicines FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on medicines"
  ON medicines FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon select on orders"
  ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on orders"
  ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on orders"
  ON orders FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon select on order_items"
  ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on order_items"
  ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on order_items"
  ON order_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete on order_items"
  ON order_items FOR DELETE TO anon USING (true);

INSERT INTO doctors (name, clinic, phone, area) VALUES
  ('Dr. Sharma', 'Sharma Clinic', '9876543210', 'Andheri'),
  ('Dr. Patel', 'City Hospital', '9876543211', 'Borivali'),
  ('Dr. Mehta', 'Mehta Health Center', '9876543212', 'Malad')
ON CONFLICT DO NOTHING;

INSERT INTO medicines (name, default_price) VALUES
  ('Paracetamol 500mg', 50.00),
  ('Amoxicillin 250mg', 120.00),
  ('Omeprazole 20mg', 80.00),
  ('Metformin 500mg', 60.00),
  ('Atorvastatin 10mg', 150.00)
ON CONFLICT DO NOTHING;
