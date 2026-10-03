# VoltCart - Electrical & Plumbing Products Store

**VoltCart** is a modern, mobile-first e-commerce web application engineered specifically for **Electrical and Plumbing supplies** (wires & cables, modular switches, LED lighting, distribution boards, CPVC/UPVC pipes, forged brass valves, and heavy-duty contractor tools).

---

## 🌟 Key Features

1. **Mobile-First Experience**:
   - Touch-friendly layout with $\ge 44\text{px}$ targets.
   - Sticky header with instant search autocomplete and recent search chips.
   - Bottom navigation bar: **Home**, **Categories**, **Cart**, **Orders**, and **Account**.
   - 2-column mobile product cards with quick Add-to-Cart quantity steppers.
   - Bottom-sheet filter drawer for mobile viewports.

2. **Electrical & Plumbing Catalog**:
   - **Electrical**: Polycab & Finolex FR copper wires (1.0, 1.5, 2.5, 4.0 sq mm), Anchor Roma modular switches, Schneider MCBs, Havells & Philips LED lighting, Crompton 5-star BLDC fans, digital multimeters.
   - **Plumbing**: Astral CPVC Pro SDR 11 pipes & brass elbows, Supreme 110mm SWR drainage, Zoloto forged brass ball valves, Jaquar chrome bib taps, PTFE seal tapes, and Astral solvent cements.

3. **Ordering & Payments**:
   - **Cash on Delivery (COD)**: Doorstep verification and cash collection workflow.
   - **Online Payment**: Integrated Razorpay gateway modal with UPI (GPay, PhonePe, Paytm), Visa/RuPay Cards, and Net Banking with backend HMAC SHA-256 signature verification.
   - **Coupons**: `VOLT10` (10% off), `PLUMB50` (Flat ₹50 off), `FIRST100` (Flat ₹100 off).

4. **Real-Time Order Tracking**:
   - Visual step timeline: `Order Placed` $\to$ `Confirmed` $\to$ `Packed` $\to$ `Shipped` $\to$ `Out for Delivery` $\to$ `Delivered`.
   - Assigned delivery personnel details and direct phone call trigger.

5. **Multi-Role Portal**:
   - **Customer**: Browse, search, filter, saved addresses, wishlist, order tracking.
   - **Store Admin**: Sales KPI metrics, weekly revenue charts, product CRUD, inventory stock adjustments with audit logging, and order fulfillment.
   - **Delivery Agent**: Mobile delivery manifest, customer contact, and COD payment collection.

---

## 🔐 Default Demo Accounts

Use the top role switcher in the header or the credentials below:

| Role | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@voltcart.in` | Any | Browsing, Saved Addresses, Cart, Checkout, Order Tracking |
| **Store Owner / Admin** | `chethanchethu654321@gmail.com` | `Admin@123` | Full Power of Control: KPI Dashboard, Inventory, Products, Direct Payment Receiving, Delivery Dispatch |
| **Support (WhatsApp Only)** | `8431653614` | N/A | Dedicated WhatsApp Chat Link for Contractor & Customer Inquiries |

---

## 💻 Windows Setup & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3.10+](https://www.python.org/downloads/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) or XAMPP (Optional for local Flask backend)

### Step 1: Clone & Frontend Setup
Open PowerShell or Command Prompt:
```powershell
# Navigate to the project root
npm install

# Run the React/Vite development server (Port 3000)
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Step 2: Database Initialization (MySQL)
Open MySQL Workbench or MySQL CLI:
```sql
SOURCE database/schema.sql;
```

---

### Step 3: Python Flask Backend (Optional Full-Stack Mode)
In a separate terminal window:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run Flask backend on port 5000
python app.py
```

---

## 🐳 Docker Compose Quickstart
To run the entire stack (MySQL + Flask Backend + React Frontend):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MySQL: `localhost:3306`

---

## 🛠️ API Reference

- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer or admin
- `GET /api/products` - Filtered & sorted product catalog
- `GET /api/products/:id` - Full product specifications and reviews
- `POST /api/cart` - Add item to cart
- `POST /api/orders` - Place order and reserve inventory
- `POST /api/payment/create` - Create Razorpay order
- `POST /api/payment/verify` - Backend HMAC signature verification
- `GET /api/admin/dashboard` - Admin KPI metrics and revenue charts
- `POST /api/coupons/apply` - Validate and apply coupon code
