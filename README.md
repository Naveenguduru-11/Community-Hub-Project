# CommunityHub - Gated Community & Villa Management SaaS Platform

CommunityHub is a full-stack, real-time SaaS application built using React.js, Node.js, Express.js, MongoDB Atlas, Socket.IO, JWT Auth with RBAC, Razorpay Payment Gateway, and Cloudinary.

## 🚀 Key Features & User Roles

### 1. Super Admin
- Platform multi-tenant community onboarding.
- SaaS metrics & global user statistics.

### 2. Community Admin
- Villa & house occupancy management.
- Generate monthly maintenance bills & payment tracking.
- Assign staff & resolve helpdesk tickets.
- Broadcast real-time announcements & notices.

### 3. Resident
- Pre-approve guest passes with QR Code & 6-digit access code.
- Online Maintenance Bill Payment via Razorpay SDK (UPI, Cards, NetBanking).
- Raise & track complaint tickets with status timeline.
- RSVP for community events & register family members/vehicles.

### 4. Security Guard
- Verify 6-digit access codes or scan QR visitor passes.
- Quick Check-in & Check-out gate movement logs.
- Delivery entry tracking (Amazon, Swiggy, Zomato).
- Trigger Emergency SOS Broadcast alerts to all community users.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Socket.IO-Client, QRCode.react
- **Backend**: Node.js, Express.js, Mongoose, JWT, Socket.IO, Razorpay SDK, Multer, Cloudinary
- **Database**: MongoDB Atlas with validation schemas

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@communityhub.com` | `password123` |
| Community Admin | `admin@greenfield.com` | `password123` |
| Resident | `resident@greenfield.com` | `password123` |
| Security Guard | `guard@greenfield.com` | `password123` |

---

## 📦 Quick Start Guide

### 1. Setup & Start Backend Server
```bash
cd backend
npm install
npm run seed  # Populates demo accounts, villas, visitors & notices
npm run dev   # Starts API & Socket.IO server on http://localhost:5000
```

### 2. Setup & Start Frontend Application
```bash
cd frontend
npm install
npm run dev   # Starts Vite dev server on http://localhost:5173
```

---

## ☁️ Deployment Instructions

### Deploy Backend to Render
1. Create a Web Service on Render and connect your repository.
2. Set Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas Connection String
   - `JWT_SECRET`: Random 32-character string
   - `RAZORPAY_KEY_ID`: Your Razorpay Test Key
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret
3. Build Command: `npm install`
4. Start Command: `node server.js`

### Deploy Frontend to Vercel
1. Import the `frontend` folder into Vercel.
2. Output Directory: `dist`
3. Environment Variables:
   - `VITE_API_URL`: Your deployed Render API URL (e.g. `https://communityhub-api.onrender.com`)
