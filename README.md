# Virtual Stock Exchange & Trading System
### A Complete College Project for Software Engineering and System Design (SESD)

![System Status](https://img.shields.io/badge/System_Status-Healthy-10b981?style=for-the-badge)
![Currency](https://img.shields.io/badge/Trading_Currency-Virtual_Money_Only_(₹10,00,000)-3b82f6?style=for-the-badge)
![Matching Engine](https://img.shields.io/badge/Order_Matching-Price--Time_Priority-f59e0b?style=for-the-badge)
![License](https://img.shields.io/badge/License-Academic_Use-8b5cf6?style=for-the-badge)

---

## 1. Project Description

The **Virtual Stock Exchange and Trading System** is a full-stack financial simulation platform developed as a capstone college project for **Software Engineering and System Design (SESD)**. 

The system simulates a realistic stock exchange using **virtual money only** (every newly registered user receives ₹10,00,000 virtual balance). It contains a genuine **Order Book and Order Matching Engine** implementing strict **Price-Time Priority**, backed by **ACID transactional atomicity** in PostgreSQL.

---

## 2. Key Features

* **Investor Experience:**
  * User Registration with automated ₹10,00,000 virtual cash grant.
  * Secure login with bcrypt password hashing and stateless JWT authentication.
  * Live Market Stock view with search and 24-hour price change percentage.
  * Interactive **Chart.js** candlestick/line charts with 1D, 1W, and 1M timeframe selections.
  * Live **Order Book Depth** showing the top 5 Bids (BUY) and Asks (SELL).
  * Limit BUY and Limit SELL order placement with real-time balance and share reservation.
  * Instant Order Matching against compatible counterparty orders (`BUY price >= SELL price`).
  * Order Cancellation with instant refunds of reserved balance or reserved shares.
  * Comprehensive **Portfolio Dashboard** tracking holdings, weighted average cost basis, current valuations, and unrealized Profit & Loss (P&L).
  * Personal Stock Watchlist with one-click bookmarking.
  * Immutable **Transaction Ledger** auditing every cash credit and debit.

* **Autonomous Order Matching Engine:**
  * Strict **Price-Time Priority (FIFO)**:
    * BUY orders: Highest price first, earliest order breaks ties.
    * SELL orders: Lowest price first, earliest order breaks ties.
  * Handles **Partial Fills** (`PARTIALLY_FILLED`) and **Complete Fills** (`FILLED`).
  * Price discovery: maker order price priority.
  * Atomic settlement: Money deduction, stock transfer, portfolio weighted average update, and transaction ledger insertion in a single atomic database transaction.

* **Autonomous Price Simulator:**
  * Simulates realistic market fluctuations (±0.2% to ±1.5%) using a random-walk / Geometric Brownian Motion model.
  * Updates demo stocks continuously in the background without depending on external broker APIs.

* **Administrative Control Center:**
  * System-wide trading telemetry (total users, active traders, order count, executed trades, traded volume, total liquidity).
  * User Management: Inspect balances and toggle user statuses (`ACTIVE` vs. `DEACTIVATED`).
  * Stock Catalog: List new equities, update existing instruments, or delist stocks.
  * Monitor all active limit orders and executed trades across all traders.

---

## 3. Technology Stack

### Frontend
* **React.js 18** (Vite Single Page Application)
* **React Router DOM v7** (Protected and Admin Route Guards)
* **Chart.js & react-chartjs-2** (Interactive Price Charts)
* **Axios** (REST API client with JWT Bearer Interceptors)
* **Lucide React** (Fintech Icons)
* **Custom Responsive Modern CSS** (Dark fintech theme)

### Backend
* **Node.js & Express.js** (REST API Architecture)
* **JWT (jsonwebtoken)** (Stateless Authentication)
* **bcryptjs** (Salted Password Hashing)
* **Decoupled Order Matching Engine**

### Database
* **PostgreSQL** (`pg` connection pool with explicit `BEGIN`, `COMMIT`, `ROLLBACK` transactions and row-level locking)
* *Automatic Relational Failover*: If PostgreSQL is not running locally, the backend automatically boots an embedded SQLite relational database with identical tables and constraints so the app runs immediately out of the box!

---

## 4. Folder Structure

```
SSED/
├── package.json                   # Root orchestrator scripts
├── .gitignore
├── .env.example                   # Master environment template
├── README.md                      # Complete system guide
│
├── backend/                       # Node.js + Express REST API
│   ├── package.json
│   ├── .env.example
│   ├── server.js                  # Server startup with seed & price simulator
│   ├── src/
│   │   ├── app.js                 # Express app & route mounting
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL pool & SQLite fallback
│   │   │   └── constants.js       # Constants & ₹10,00,000 initial balance
│   │   ├── database/
│   │   │   ├── schema.sql         # PostgreSQL DDL table definitions
│   │   │   ├── seed.sql           # Initial stocks DDL
│   │   │   ├── seed.js            # Seed runner (demo users, admin, orders)
│   │   │   └── sqliteMigrate.js   # Embedded relational schema
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── role.js            # Admin role guard
│   │   │   └── errorHandler.js    # Centralized error handler
│   │   ├── controllers/           # Auth, Stock, Order, Portfolio, Transaction, Admin
│   │   ├── routes/                # Modular REST route handlers
│   │   ├── services/              # Business logic & Price Simulator
│   │   ├── matching-engine/       # Order book, price-time priority, atomic trade executor
│   │   └── utils/                 # API response formatters & math
│   └── tests/
│       └── exchange.test.js       # Comprehensive automated test suite
│
├── frontend/                      # React 18+ Single Page Application (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                # Router & layout
│   │   ├── context/               # AuthContext & state
│   │   ├── services/              # Axios API client
│   │   ├── components/            # Navbar, PriceChart, OrderForm, etc.
│   │   ├── pages/                 # Login, Register, Dashboard, Stocks, Orders, Portfolio, Admin
│   │   └── styles/                # Modern fintech stylesheet
│
└── docs/                          # SESD Academic Deliverables
    ├── SESD_Report.md             # Complete 22-Chapter SESD Academic Report
    └── diagrams/                  # Mermaid UML Diagrams
        ├── use_case.md
        ├── sequence_diagram.md
        ├── activity_diagram.md
        ├── class_diagram.md
        └── er_diagram.md
```

---

## 5. Demo Credentials

Quick-fill demo buttons are built right into the Login page for convenience:

| Role | Email | Password | Starting Assets |
|---|---|---|---|
| **Demo Investor** | `investor@exchange.com` | `User@123` | ₹10,00,000 Virtual Cash |
| **Demo Trader 2** | `trader2@exchange.com` | `Trader@123` | ₹10,00,000 Cash + 100 TCS + 50 RELIANCE |
| **System Admin** | `admin@exchange.com` | `Admin@123` | Administrator Privileges |

*Or register a new investor account to instantly receive ₹10,00,000 demo funds!*

---

## 6. How to Run the Application

### Prerequisites
* **Node.js**: v18 or higher (v24 supported)
* **PowerShell Tip (Windows)**: If PowerShell displays a script policy warning, use `npm.cmd` instead of `npm`.

### Step 1: Run the Backend
Open a terminal and run:
```powershell
cd "backend"
npm.cmd start
```
*(The backend will seed initial stocks and demo accounts automatically, start the price ticker, and listen on port 5000).*

Verify in browser: **http://localhost:5000/api/health**

### Step 2: Run the Frontend
Open a **second** terminal and run:
```powershell
cd "frontend"
npm.cmd run dev
```
Open in browser: **http://localhost:5173**

---

## 7. Running Automated Tests

The backend includes a comprehensive test suite validating registration invariants, overdraft guards, short-selling prevention, order cancellation refunds, and the matching engine:

```powershell
cd "backend"
npm.cmd test
```

Expected result:
```
✔ 1. User Registration & ₹10,00,000 Starting Virtual Balance
✔ 2. Duplicate Email Registration Prevention
✔ 3. Stocks Fetching & Format
✔ 4. Buy Order Validation - Insufficient Balance Protection
✔ 5. Sell Order Validation - Cannot Sell Shares Not Owned
✔ 6. Order Cancellation & Fund Refund
✔ 7. Order Matching Engine - Compatible Match & Atomic Execution
✔ 8. Watchlist Add & Remove
✔ 9. Admin System Statistics
✔ Virtual Stock Exchange Test Suite (10/10 passed)
```

---

## 8. API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register investor (grants ₹10,00,000 demo cash)
* `POST /api/auth/login` — Authenticate and issue JWT
* `GET /api/auth/me` — Retrieve active session profile

### Stocks (`/api/stocks`)
* `GET /api/stocks` — List all equities with price & 24h change
* `GET /api/stocks/:id` — Stock details with market depth & recent trades
* `POST /api/stocks` — *(Admin)* List new equity
* `PUT /api/stocks/:id` — *(Admin)* Update stock name or price
* `DELETE /api/stocks/:id` — *(Admin)* Delist stock

### Orders (`/api/orders`)
* `POST /api/orders/buy` — Place limit BUY order (locks balance)
* `POST /api/orders/sell` — Place limit SELL order (locks shares)
* `GET /api/orders` — List current user orders
* `GET /api/orders/open` — List active resting orders
* `GET /api/orders/history` — List completed/cancelled orders
* `DELETE /api/orders/:id` — Cancel order & claim refund

### Portfolio (`/api/portfolio`)
* `GET /api/portfolio` — Fetch user holdings, valuations, and net P&L
* `GET /api/portfolio/:stockId` — Fetch position in a specific stock

### Watchlist (`/api/watchlist`)
* `GET /api/watchlist` — View user's watched stocks
* `POST /api/watchlist/:stockId` — Add stock to watchlist
* `DELETE /api/watchlist/:stockId` — Remove stock from watchlist

### Transactions (`/api/transactions`)
* `GET /api/transactions` — View financial audit ledger

### Admin (`/api/admin`)
* `GET /api/admin/stats` — Overall trading volume and telemetry
* `GET /api/admin/users` — List all users and balances
* `PUT /api/admin/users/:id/status` — Activate/deactivate user
* `GET /api/admin/orders` — Inspect system-wide orders
* `GET /api/admin/trades` — Inspect all executed trades

---

## 9. SESD College Documentation
Full academic documentation with all 22 required chapters and diagrams is available in:
* **Academic Report:** [docs/SESD_Report.md](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/SESD_Report.md)
* **UML Diagrams:** [docs/diagrams/](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/)
  * [Use Case Diagram](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/use_case.md)
  * [Sequence Diagram](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/sequence_diagram.md)
  * [Activity Diagram](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/activity_diagram.md)
  * [Class Diagram](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/class_diagram.md)
  * [Entity-Relationship Diagram](file:///c:/Users/Hrishikesh%20sharma/OneDrive/Desktop/SSED/docs/diagrams/er_diagram.md)

---

## 10. Academic Disclaimer
This project was designed and implemented strictly for educational purposes as part of a Software Engineering and System Design (SESD) curriculum. It uses **simulated virtual money only** and does not interact with any real-world banking, brokerage, or monetary systems.
