import type { Doctor, Medicine, Order, OrderItem } from './types';

// Helper to generate UUIDs
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get past dates
function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEMO_USER_ID = 'demo-user-id';

export function getInitialDemoMedicines(): Medicine[] {
  const medicinesData = [
    { name: 'Paracetamol 650mg', price: 45.00 },
    { name: 'Amoxicillin 500mg', price: 120.00 },
    { name: 'Omeprazole 20mg', price: 75.00 },
    { name: 'Metformin 500mg', price: 55.00 },
    { name: 'Atorvastatin 10mg', price: 140.00 },
    { name: 'Ibuprofen 400mg', price: 65.00 },
    { name: 'Azithromycin 500mg', price: 165.00 },
    { name: 'Pantoprazole 40mg', price: 90.00 },
    { name: 'Amlodipine 5mg', price: 38.00 },
    { name: 'Losartan 50mg', price: 85.00 },
    { name: 'Clopidogrel 75mg', price: 110.00 },
    { name: 'Gabapentin 300mg', price: 195.00 }
  ];

  return medicinesData.map(m => ({
    id: uuid(),
    name: m.name,
    default_price: m.price,
    is_active: true,
    created_at: new Date(getPastDate(90)).toISOString(),
    user_id: DEMO_USER_ID
  } as any));
}

export function getInitialDemoDoctors(): Doctor[] {
  const doctorsData = [
    { name: 'Dr. Ramesh Patel', clinic: 'Patel Cardiology Care', phone: '+91 98200 12345', area: 'Borivali' },
    { name: 'Dr. Sunita Sharma', clinic: 'Sharma Pediatric Hospital', phone: '+91 98199 54321', area: 'Andheri' },
    { name: 'Dr. Amit Mehta', clinic: 'Mehta Health & Wellness', phone: '+91 98765 43212', area: 'Malad' },
    { name: 'Dr. Priya Nair', clinic: 'Nair Care & Gynaec Center', phone: '+91 98330 98765', area: 'Bandra' },
    { name: 'Dr. Vikram Malhotra', clinic: 'Malhotra Ortho Clinic', phone: '+91 98210 65432', area: 'Thane' },
    { name: 'Dr. Sanjay Gupta', clinic: 'Gupta Diabetes Care', phone: '+91 98205 33333', area: 'Chembur' },
    { name: 'Dr. Anjali Desai', clinic: 'Desai Childrens Hospital', phone: '+91 98190 44444', area: 'Vashi' },
    { name: 'Dr. Rajesh Kulkarni', clinic: 'Kulkarni Spine & Neuro', phone: '+91 98922 11111', area: 'Dadar' }
  ];

  return doctorsData.map(d => ({
    id: uuid(),
    name: d.name,
    clinic: d.clinic,
    phone: d.phone,
    area: d.area,
    is_active: true,
    created_at: new Date(getPastDate(90)).toISOString(),
    user_id: DEMO_USER_ID
  } as any));
}

export function generateDemoOrdersAndItems(doctors: Doctor[], medicines: Medicine[]) {
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];

  const notesList = [
    'Leave samples on next visit',
    'Requested morning delivery',
    'Follow up on payment status next week',
    'Interested in new product launch details',
    'Urgent stock required',
    'Stock cleared, payment pending verification',
    'Dr. requested next quote via WhatsApp',
    'Special price match applied for bulk order'
  ];

  // We want to generate orders spread over 90 days.
  // Generate 25 orders in total.
  const numOrders = 28;

  for (let i = 0; i < numOrders; i++) {
    // Determine date
    let orderDateStr: string;
    if (i === 0) {
      // Ensure at least one order is dated today (for Ramesh Patel)
      orderDateStr = getPastDate(0);
    } else if (i === 1) {
      // Ensure another order is dated today (for Sunita Sharma)
      orderDateStr = getPastDate(0);
    } else {
      // Random past date
      const daysAgo = Math.floor(Math.random() * 60) + 1; // 1 to 60 days ago
      orderDateStr = getPastDate(daysAgo);
    }

    // Pick a doctor
    const doctor = doctors[i % doctors.length];
    
    // Pick 1-4 random medicines
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    const selectedMeds: Medicine[] = [];
    const availableMeds = [...medicines];
    for (let j = 0; j < numItems; j++) {
      const idx = Math.floor(Math.random() * availableMeds.length);
      selectedMeds.push(availableMeds.splice(idx, 1)[0]);
    }

    const orderId = uuid();
    let totalAmount = 0;

    // Generate order items
    selectedMeds.forEach(med => {
      const quantity = Math.floor(Math.random() * 15) + 5; // 5 to 20 units
      const price = med.default_price;
      const total = price * quantity;
      totalAmount += total;

      orderItems.push({
        id: uuid(),
        order_id: orderId,
        medicine_id: med.id,
        quantity,
        price,
        total,
        created_at: new Date(orderDateStr + 'T12:00:00Z').toISOString(),
        user_id: DEMO_USER_ID
      } as any);
    });

    // Payment status: 70% paid, 30% pending
    const paymentStatus = Math.random() > 0.3 ? 'paid' : 'pending';
    const invoiceNumber = paymentStatus === 'paid' ? `INV-${Math.floor(Math.random() * 900000) + 100000}` : '';
    const notes = Math.random() > 0.4 ? notesList[Math.floor(Math.random() * notesList.length)] : '';

    orders.push({
      id: orderId,
      doctor_id: doctor.id,
      order_date: orderDateStr,
      total_amount: totalAmount,
      payment_status: paymentStatus as any,
      invoice_number: invoiceNumber,
      notes,
      created_at: new Date(orderDateStr + 'T12:00:00Z').toISOString(),
      user_id: DEMO_USER_ID
    } as any);
  }

  return { orders, orderItems };
}

export function initializeDemoData() {
  const doctors = getInitialDemoDoctors();
  const medicines = getInitialDemoMedicines();
  const { orders, orderItems } = generateDemoOrdersAndItems(doctors, medicines);

  localStorage.setItem('meditrack_demo_doctors', JSON.stringify(doctors));
  localStorage.setItem('meditrack_demo_medicines', JSON.stringify(medicines));
  localStorage.setItem('meditrack_demo_orders', JSON.stringify(orders));
  localStorage.setItem('meditrack_demo_order_items', JSON.stringify(orderItems));
  localStorage.setItem('meditrack_demo_seeded', 'true');
}
