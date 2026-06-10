# MediTrack MR — Medical Representative Order & Sales Tracker (Portfolio Demo Version)

MediTrack MR is a premium, visual-first sales tracking and doctor relationship portal designed specifically for Medical Representatives (MRs). It allows sales representatives to manage doctor profiles, keep track of medicine catalogs, log customer orders, monitor payment settlements, and analyze key performance metrics through a sleek, responsive dashboard.

## 🚀 Live Demo & Deployment
- **Live Vercel URL**: `https://meditrack-portfolio-demo.vercel.app` (Substitute with your live Vercel URL once deployed)
- **GitHub Repository**: `https://github.com/Nikhil5689/meditrack-portfolio-demo.git`

---

## 🌟 Key Features

1. **Analytical Dashboard**: Overview of total monthly sales, total order count, received payments, and pending payments, with quick action links to key pages.
2. **Doctor Directory**: Detailed profiles of medical contacts, hospital locations, and contact info, coupled with lifetime transaction KPIs.
3. **Product Catalog**: Dynamic list of available medicines and default MSRP pricing.
4. **Order Entry Form**: Sleek, multi-item order builder that computes totals, links to doctors/products, and generates formatted order summaries ready to copy and send over WhatsApp.
5. **Daily visitation tracker**: Bulk daily checklist showing A-Z doctor listings and order entry shortcuts to easily record daily representative activity.
6. **Detailed Reports & Excel Export**: Filter orders by date range, doctor, or status, and export structured Excel spreadsheets (`xlsx`) with a single click.
7. **Premium UI/UX**: Designed with rich gradients, micro-animations, glassmorphism, responsive navigation drawers, and dark-mode elements.

---

## 🔑 One-Click Demo Mode

To make this application instantly shareable and interactive in your developer portfolio, a custom **Demo Mode** has been implemented:
- **No Setup Required**: If Supabase credentials are not provided in the environment variables, the app automatically runs in a local storage-backed sandbox.
- **Demo Login**: Click the prominent **Try Demo Version** button on the sign-in page to log in instantly.
- **Realistic Data Seeding**: Automatically generates a full set of realistic Indian pharmaceutical medicines, medical representative contacts, and past transaction records spanning the last 90 days.
- **Refresh Demo Data**: A header banner allows visitors to instantly wipe local state and re-seed clean, realistic records to test the system fresh.
- **Persistent Local Sandbox**: Any additions, edits, or order deletions made by the user will persist in their browser's LocalStorage.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18 (TypeScript)
- **Tooling/Bundler**: Vite 5
- **Styling**: TailwindCSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Database/Auth (Real Mode)**: Supabase JS Client
- **Database/Auth (Demo Mode)**: Custom LocalStorage Mock Database Interceptor client
- **Reports**: SheetJS (XLSX)

---

## 💻 Local Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nikhil5689/meditrack-portfolio-demo.git
   cd meditrack-portfolio-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   If you want to connect to a real Supabase database, create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *If `.env` is omitted, the app will default to the fully interactive Local Storage Demo Mode.*

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## ⚡ Deployment to Vercel

This repository is optimized for quick, zero-config deployment to Vercel:

1. Push your code to GitHub.
2. Open the **Vercel Dashboard** and click **Add New Project**.
3. Import this repository.
4. (Optional) Configure environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using Supabase. Otherwise, leave empty to run in Demo Mode.
5. Click **Deploy**. Your live site will be ready in under a minute!