# 🍱 CanteenPOS
### School Canteen Management System
**IT15/L — Integrative Programming | Final Project**

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack & Libraries](#-tech-stack--libraries)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
   - [Backend (Laravel)](#-backend-setup-laravel)
   - [Frontend (React)](#-frontend-setup-react)
6. [Demo Credentials](#-demo-credentials)
7. [Project Structure](#-project-structure)
8. [Environment Variables](#-environment-variables)
9. [API Quick Reference](#-api-quick-reference)
10. [Troubleshooting](#-troubleshooting)
11. [Team & Credits](#-team--credits)

---

## 📖 Project Overview

**CanteenPOS** is a full-stack canteen management system designed for school and university canteens. Built with **React.js** on the frontend and **Laravel** on the backend, the system digitizes the entire canteen workflow — from customer ordering to admin reporting.

The system supports **three distinct user roles**, each with a dedicated interface and protected routes enforced by Laravel's role-based middleware:

| Role | Description |
|------|-------------|
| 👑 **Admin** | Full access — menu, inventory, orders, reports, user management |
| 🏪 **Cashier** | POS interface, order queue management |
| 🎓 **Customer** | Browse menu, place orders, track order status |

---

## ✨ Features

### 👑 Admin Panel
- **Dashboard** — sales summary cards, bar chart (daily revenue), pie chart (category breakdown), line chart (order trend)
- **Menu Management** — full CRUD, toggle availability, mark as featured, category assignment
- **Inventory Management** — stock tracking, bulk restock modal, single-item adjustments, full audit log
- **Sales Reports** — daily/weekly breakdown, top-selling items, category revenue
- **User Management** — create, edit, delete user accounts with role assignment; cannot delete own account

### 🏪 Cashier Panel
- **POS Interface** — searchable menu, cart builder, payment method selector, cash change calculator
- **Order Queue** — real-time Kanban board (Pending → Preparing → Ready), urgency indicator for orders waiting 10+ minutes
- **Order Management** — advance order status, view all orders with filters

### 🎓 Customer Panel
- **Personalized Menu** — time-based greeting (Good morning/afternoon/evening), meal hint, live stats strip
- **Today's Picks** — featured items horizontal carousel
- **✨ Recommended For You** — items from categories you've ordered before
- **❤️ Favorites** — heart any item; persisted per user in localStorage; dedicated Favorites view
- **Floating Cart Drawer** — slide-up tray with qty controls, payment selector (Cash/GCash/Maya/Card), cash change calculator
- **My Orders** — full order history with progress tracker bar
- **📡 Live Order Tracker** — real-time modal auto-polling every 5 seconds with animated status
- **🔁 Reorder** — one-tap repeat of any past completed order
- **🎟 Loyalty Stamp Card** — 1 stamp per completed order, 10 stamps = reward badge
- **📊 Personal Stats** — total orders, total spent, favorite item displayed in a stats card

---

## 🛠 Tech Stack & Libraries

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React.js | 18.x | UI framework (functional components + hooks) |
| React Router DOM | 6.x | Client-side routing, protected routes |
| Tailwind CSS | 3.x | Utility-first CSS styling |
| Axios | 1.x | HTTP client for API calls |
| Recharts | 2.x | Interactive charts (bar, pie, line) |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Laravel | 11.x | RESTful API framework |
| Laravel Sanctum | 4.x | Token-based API authentication |
| PHP | 8.2+ | Server-side language |
| Eloquent ORM | (Laravel) | Database models and relationships |

### Database & Dev Tools
| Tool | Version | Purpose |
|------|---------|---------|
| MySQL | 8.0+ | Relational database |
| Composer | 2.x | PHP dependency manager |
| Node.js | 20.x LTS | JavaScript runtime for frontend |
| npm | 10.x | Frontend package manager |
| Laragon | Latest | Local development environment (Windows) |

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

- **PHP** 8.2 or higher → [php.net/downloads](https://www.php.net/downloads)
- **Composer** 2.x → [getcomposer.org](https://getcomposer.org)
- **Node.js** 18+ and **npm** 9+ → [nodejs.org](https://nodejs.org)
- **MySQL** 8.0+ → included with Laragon or XAMPP
- **Laragon** (recommended for Windows) → [laragon.org](https://laragon.org) — bundles PHP, MySQL, and Apache

> **Tip:** If you're on Windows, Laragon is the easiest way to get everything running. It includes PHP, MySQL, Apache, and Composer in one installer.

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/canteen-pos.git
cd canteen-pos
```

The repository contains two folders:
```
canteen-pos/
├── canteen-backend/    ← Laravel API
└── canteen-frontend/   ← React app
```

---

### 🔧 Backend Setup (Laravel)

#### 1. Navigate to the backend folder

```bash
cd canteen-backend
```

#### 2. Install PHP dependencies

```bash
composer install
```

> This installs all packages listed in `composer.json` into the `vendor/` folder.

#### 3. Copy the environment file

```bash
cp .env.example .env
```

On **Windows** (Command Prompt):
```cmd
copy .env.example .env
```

#### 4. Generate the application key

```bash
php artisan key:generate
```

> This fills in `APP_KEY` in your `.env` file. Required for encryption to work.

#### 5. Configure your database

Open the `.env` file in a text editor and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=
```

> If you're using Laragon, the default MySQL username is `root` with no password.

#### 6. Create the database

Open **phpMyAdmin** (via Laragon) or your MySQL client and create a new database:

```sql
CREATE DATABASE canteen_db;
```

Or run via command line:
```bash
mysql -u root -e "CREATE DATABASE canteen_db;"
```

#### 7. Run migrations and seed demo data

```bash
php artisan migrate --seed
```

This will:
- Create all database tables (users, categories, menu_items, orders, order_items, inventory_logs)
- Seed **3 demo user accounts** (Admin, Cashier, Customer)
- Seed **6 menu categories** (Meals, Snacks, Beverages, Desserts, Combos, Breakfast)
- Seed **33 menu items** with prices, descriptions, and stock quantities
- Seed **200+ sample orders** with order items
- Seed inventory adjustment logs

> **Note:** If you encounter errors, run `php artisan migrate:fresh --seed` to drop all tables and start clean.

#### 8. Configure CORS

Open `config/cors.php` and verify:

```php
'allowed_origins' => ['http://localhost:3000'],
```

#### 9. Start the backend server

```bash
php artisan serve
```

✅ Backend is now running at: **http://localhost:8000**

You can verify by opening http://localhost:8000/api/menu in your browser — you should see JSON menu data.

---

### ⚛️ Frontend Setup (React)

> Open a **new terminal window** and keep the Laravel server running in the first one.

#### 1. Navigate to the frontend folder

```bash
cd canteen-frontend
```

#### 2. Install JavaScript dependencies

```bash
npm install
```

> This installs all packages from `package.json` into `node_modules/`. May take 1–2 minutes.

#### 3. Copy the environment file

```bash
cp .env.example .env
```

On **Windows**:
```cmd
copy .env.example .env
```

#### 4. Verify the API URL

Open `.env` and confirm:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

> Change this only if your Laravel server runs on a different port.

#### 5. Start the development server

```bash
npm start
```

✅ Frontend is now running at: **http://localhost:3000**

The browser should open automatically. If not, navigate to http://localhost:3000 manually.

---

### 🔄 Running Both Servers

You need **two terminal windows** running simultaneously:

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 | `cd canteen-backend && php artisan serve` | http://localhost:8000 |
| Terminal 2 | `cd canteen-frontend && npm start` | http://localhost:3000 |

---

## 🔑 Demo Credentials

Use these accounts to test the system immediately after seeding:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| 👑 Admin | admin@canteen.com | cipro123 | Full system access |
| 🏪 Cashier | cashier1@canteen.com | madjos123 | POS, Queue, Orders |
| 🎓 Customer | johnvincent@student.edu | password | Menu, My Orders |
| 🎓 Customer | Takeda@student.edu | password | Menu, My Orders |

> **Quick Demo buttons** on the login page auto-fill these credentials — just click Admin, Cashier, or Customer and hit Sign In.

---

## 📁 Project Structure

```
canteen-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php        ← login, register, logout, me, updateProfile
│   │   │   ├── MenuController.php        ← CRUD, toggle availability, categories
│   │   │   ├── OrderController.php       ← store, index, myOrders, queue, updateStatus
│   │   │   ├── InventoryController.php   ← index, adjust, bulkRestock, logs, lowStock
│   │   │   ├── ReportController.php      ← summary, daily, weekly, topItems, trend
│   │   │   └── UserController.php        ← index, store, update, destroy
│   │   └── Middleware/
│   │       └── RoleMiddleware.php        ← role:admin,cashier guards
│   └── Models/
│       ├── User.php
│       ├── MenuItem.php
│       ├── Category.php
│       ├── Order.php
│       ├── OrderItem.php
│       └── InventoryLog.php
├── database/
│   ├── migrations/                       ← table schemas
│   └── seeders/                          ← demo data
│       ├── UserSeeder.php
│       ├── CategorySeeder.php
│       ├── MenuItemSeeder.php
│       └── OrderSeeder.php
├── routes/
│   └── api.php                           ← all API route definitions
├── config/
│   └── cors.php                          ← CORS allowed origins
└── .env.example

canteen-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx                 ← login page with animated background
│   │   │   └── ProtectedRoute.jsx        ← role-based route guard
│   │   ├── common/
│   │   │   ├── Sidebar.jsx               ← navigation sidebar per role
│   │   │   └── CanteenLogo.jsx           ← SVG logo component
│   │   ├── dashboard/
│   │   │   └── AdminDashboard.jsx        ← charts, summary cards
│   │   ├── menu/
│   │   │   └── MenuList.jsx              ← menu grid + floating cart
│   │   ├── orders/
│   │   │   ├── POSInterface.jsx          ← cashier point-of-sale
│   │   │   ├── OrderQueue.jsx            ← Kanban order board
│   │   │   └── OrderReceipt.jsx          ← receipt modal
│   │   └── inventory/
│   │       └── InventoryTable.jsx        ← stock management table
│   ├── pages/
│   │   ├── OrdersPage.jsx                ← customer My Orders + All Orders
│   │   ├── ReportsPage.jsx               ← admin sales reports
│   │   └── UsersPage.jsx                 ← admin user management
│   ├── context/
│   │   ├── AuthContext.jsx               ← global auth state, login/logout
│   │   └── CartContext.jsx               ← global cart state
│   ├── services/
│   │   ├── api.js                        ← Axios instance + interceptors
│   │   ├── authService.js                ← auth API calls
│   │   └── orderService.js               ← order API calls
│   └── App.jsx                           ← routes + layout
├── public/
└── .env.example
```

---

## 🔐 Environment Variables

### Backend — `canteen-backend/.env`

```env
APP_NAME=CanteenPOS
APP_ENV=local
APP_KEY=                          # Auto-generated by php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=                      # Leave blank if using Laragon default

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### Frontend — `canteen-frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 📡 API Quick Reference

**Base URL:** `http://localhost:8000/api`

All protected endpoints require:
```
Authorization: Bearer {token}
```

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | Public | Authenticate, returns token |
| POST | `/register` | Public | Register new customer |
| POST | `/logout` | 🔒 Any | Invalidate token |
| GET | `/me` | 🔒 Any | Get current user profile |
| GET | `/menu` | Public | List menu items |
| GET | `/categories` | Public | List categories |
| POST | `/orders` | 🔒 Any | Place a new order |
| GET | `/my-orders` | 🔒 Any | Customer's own orders |
| GET | `/orders` | 🏪 Cashier+ | All orders |
| GET | `/orders/queue` | 🏪 Cashier+ | Active orders (Kanban) |
| PATCH | `/orders/{id}/status` | 🏪 Cashier+ | Advance order status |
| POST | `/menu` | 👑 Admin | Create menu item |
| PUT | `/menu/{id}` | 👑 Admin | Update menu item |
| DELETE | `/menu/{id}` | 👑 Admin | Delete menu item |
| GET | `/inventory` | 👑 Admin | Stock levels |
| PATCH | `/inventory/{id}/adjust` | 👑 Admin | Adjust stock |
| POST | `/inventory/bulk-restock` | 👑 Admin | Restock multiple items |
| GET | `/reports/summary` | 👑 Admin | Sales summary |
| GET | `/reports/top-items` | 👑 Admin | Best-selling items |
| GET | `/users` | 👑 Admin | List all users |
| POST | `/users` | 👑 Admin | Create user |
| PUT | `/users/{id}` | 👑 Admin | Update user |
| DELETE | `/users/{id}` | 👑 Admin | Delete user |

> See `API_Documentation.docx` for full request/response examples.

---

## 🔧 Troubleshooting

### ❌ `php artisan migrate` fails
- Make sure the `canteen_db` database exists in MySQL
- Check `DB_USERNAME` and `DB_PASSWORD` in your `.env` file
- Try: `php artisan config:clear` then retry

### ❌ CORS error in browser console
- Verify `config/cors.php` has `'allowed_origins' => ['http://localhost:3000']`
- Run: `php artisan config:clear && php artisan cache:clear`
- Make sure the Laravel server is running on port 8000

### ❌ `npm start` fails
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure Node.js version is 18 or higher: `node --version`

### ❌ Login returns 401 / "Unauthenticated"
- Clear browser localStorage: open DevTools → Console → type `localStorage.clear()`
- Make sure you ran `php artisan migrate --seed` to create the demo users
- Check that `REACT_APP_API_URL` in frontend `.env` matches the Laravel server URL

### ❌ Build cache issues
```bash
# Clear React build cache (Windows)
rmdir /s /q node_modules\.cache

# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### ❌ "No query results for model" on inventory
- Run `php artisan migrate:fresh --seed` to reseed all data

---

## 👥 Team & Credits

**Course:** IT15/L — Integrative Programming
**Project:** Canteen Management System — Final Project

| Name | Role |
|------|------|
| John Vincent Ruado | Developer |

**Built with:**
- [Laravel](https://laravel.com) — The PHP Framework for Web Artisans
- [React](https://react.dev) — The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com) — A utility-first CSS framework
- [Recharts](https://recharts.org) — A composable charting library for React
- [Laravel Sanctum](https://laravel.com/docs/sanctum) — Lightweight API authentication

---

*© 2026 CanteenPOS — IT15/L Integrative Programming Final Project*
