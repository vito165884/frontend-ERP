# Silk Road ERP - Professional Enterprise Management System

A comprehensive, enterprise-grade Sales ERP (Enterprise Resource Planning) system built with modern web technologies for managing customers, suppliers, products, and business operations.

## 🎯 Overview

Silk Road ERP is a professional business management platform designed for companies that need to manage:
- **Customer Relationships** - Track accounts, invoices, delivery notes, and credit notes
- **Supplier Management** - Manage purchase orders, receipt notes, and supplier payments
- **Inventory Control** - Monitor product stock levels and product families
- **Administration** - User management, role-based access, accounting years, and system settings
- **Analytics & Reporting** - Dashboard with KPIs, sales/purchase trends, and business insights

## ✨ Key Features

### Professional Design System
- **Dark Enterprise Theme** - Modern dark color scheme optimized for long work sessions
- **Consistent UI Components** - Professional cards, tables, modals, and forms
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Accessible Components** - WCAG-compliant with proper ARIA labels and keyboard navigation

### Authentication & Security
- Login page with email/password authentication
- Session management with JWT tokens
- Role-based access control (Admin, Manager, User, etc.)
- User profile management
- Secure password handling

### Dashboard & Analytics
- KPI cards showing revenue, purchases, customers, and inventory metrics
- Interactive charts:
  - Sales vs. Purchases trends (Area chart)
  - Revenue analysis (Line chart)
  - Product distribution (Pie chart)
  - Customer segments (Bar chart)
- Sales & Purchases Recap page with detailed analytics
- Recent transactions table with filtering

### Customers Module
- Customer account management
- Invoice tracking and management
- Delivery notes for shipments
- Credit notes for returns/adjustments
- Quick statistics on customer lifetime value

### Suppliers/Providers Module
- Supplier account management
- Purchase order creation and tracking
- Receipt note management
- Payment tracking
- Supplier performance metrics

### Inventory & Stock
- Product catalog with SKU tracking
- Product families for organization
- Stock level monitoring
- Low stock and out-of-stock alerts
- Inventory valuation

### Administration
- **User Management** - Create, edit, and manage system users
- **Role Management** - Define roles with specific permissions
- **Accounting Years** - Configure fiscal periods and lock/unlock years
- **System Settings** - Company info, document formatting, tax rates, backup settings

### Navigation & Layout
- **Responsive Sidebar** - Hierarchical menu organized by module
- **Professional Header** - Company branding, accounting year selector, theme toggle, user menu
- **Smart Navigation** - Collapsible sidebar on mobile, expandable sections
- **Active Route Highlighting** - Always know where you are in the system

## 🛠 Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts with responsive containers
- **Forms**: React Hook Form (ready for implementation)
- **Validation**: Zod (ready for implementation)
- **Notifications**: Sonner for toast notifications
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API / useEffect hooks

## 📁 Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                 # Root layout with dark theme
│   ├── page.tsx                   # Redirect to auth or dashboard
│   ├── globals.css                # Global styles & theme variables
│   ├── auth/
│   │   ├── layout.tsx            # Auth wrapper
│   │   └── login/
│   │       └── page.tsx          # Login page
│   └── (main)/                   # Protected routes
│       ├── layout.tsx            # Main app layout
│       ├── dashboard/
│       │   └── page.tsx          # Dashboard with KPIs and charts
│       ├── recap-sales-purchases/
│       │   └── page.tsx          # Sales & Purchases analytics
│       ├── customers/
│       │   └── page.tsx          # Customer list
│       ├── invoices/
│       │   └── page.tsx          # Invoice management
│       ├── delivery-notes/
│       │   └── page.tsx          # Delivery tracking
│       ├── credit-notes/
│       │   └── page.tsx          # Credit notes
│       ├── suppliers/
│       │   └── page.tsx          # Supplier list
│       ├── purchase-orders/
│       │   └── page.tsx          # Purchase orders
│       ├── receipt-notes/
│       │   └── page.tsx          # Receipt notes
│       ├── supplier-payments/
│       │   └── page.tsx          # Supplier payments
│       ├── products/
│       │   └── page.tsx          # Product catalog
│       ├── product-families/
│       │   └── page.tsx          # Product categories
│       ├── inventory/
│       │   └── page.tsx          # Inventory tracking
│       └── admin/
│           ├── users/page.tsx    # User management
│           ├── roles/page.tsx    # Role management
│           ├── accounting-years/page.tsx
│           └── settings/page.tsx # System settings
├── components/
│   ├── layout/
│   │   ├── header.tsx            # Top navigation bar
│   │   ├── sidebar.tsx           # Side navigation menu
│   │   └── main-layout.tsx       # Main app wrapper
│   ├── dashboard/
│   │   ├── kpi-card.tsx          # KPI metric card
│   │   └── chart-card.tsx        # Chart container
│   └── ui/
│       ├── data-table.tsx        # Reusable data table
│       └── [shadcn components]
├── lib/
│   ├── auth.ts                   # Authentication service
│   ├── utils.ts                  # Utility functions
│   └── [other utilities]
└── package.json
```

## 🚀 Quick Start

### Demo Credentials
- Email: `demo@silkroad.com`
- Password: `demo123`

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
pnpm build
pnpm start
```

## 🎨 Design Features

### Color Palette
- **Primary**: Blue (#3b82f6) - Main actions and accents
- **Success**: Green (#10b981) - Positive indicators
- **Warning**: Amber (#f59e0b) - Caution states
- **Error**: Red (#ef4444) - Destructive actions
- **Background**: Dark slate (#0f172a) - Main background
- **Surface**: Darker slate (#1e293b) - Card backgrounds
- **Text**: Light slate (#f1f5f9) - Primary text

### Component Patterns
- **Cards**: Subtle borders with hover effects
- **Tables**: Alternating rows, sortable headers, inline actions
- **Forms**: Consistent spacing with labels and validation
- **Modals**: Backdrop blur with proper sizing
- **Buttons**: Multiple variants (primary, outline, ghost) with consistent sizing

## 📊 Data Models

### Key Entities

**Customer**
- ID, Name, Email, Phone
- City, Country
- Status (active/inactive/pending)
- Total Orders, Total Spent

**Invoice**
- ID, Customer, Amount
- Issue Date, Due Date
- Status (paid/pending/overdue/draft)

**Supplier**
- ID, Name, Email, Phone
- Country, Payment Terms
- Total Orders, Total Purchased

**Product**
- ID, Name, SKU, Family
- Quantity, Price
- Status (in-stock/low-stock/out-of-stock)

**User**
- ID, Name, Email, Role
- Status, Last Login
- Permissions (role-based)

## 🔐 Authentication & Authorization

The system uses JWT tokens for authentication with the following role levels:
- **Administrator** - Full system access
- **Manager** - Can manage departments and users
- **Sales Representative** - Can manage customers and invoices
- **Analyst** - Can view reports and analytics
- **Operator** - Can perform basic operations

## 📈 Dashboard Analytics

The dashboard displays:
- **KPI Cards** - Revenue, purchases, customers, inventory, growth metrics
- **Area Chart** - Sales vs. Purchases trends with target line
- **Pie Chart** - Product distribution
- **Line Chart** - Revenue trend with target comparison
- **Bar Chart** - Customer segment distribution
- **Recent Transactions** - Latest invoices with status

## 🔧 Development

### Adding New Pages
1. Create page file in appropriate route folder
2. Use `DataTable` component for list pages
3. Import and use layout components
4. Follow the established color and component patterns

### Customizing Theme
Edit `/app/globals.css` to modify:
- Color variables (OKLch format)
- Typography scales
- Spacing and borders
- Dark mode overrides

### Form Validation
Ready to integrate React Hook Form and Zod:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

## 📱 Responsive Design

- **Mobile** - Single column layout, hamburger sidebar menu
- **Tablet** - Collapsed sidebar by default, touch-friendly spacing
- **Desktop** - Full sidebar visible, optimized for productivity

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly tables
- Focus indicators on all interactive elements

## 🚀 Future Enhancements

- Real backend API integration
- Database connectivity (Supabase, Neon, etc.)
- Advanced reporting and exports (PDF, Excel)
- Email notifications
- Multi-language support (i18n)
- Advanced permission system
- Audit logging
- Real-time updates with WebSockets
- Mobile app with React Native
- API documentation (OpenAPI/Swagger)

## 📝 License

This is a demonstration ERP system built for educational and commercial purposes.

## 🤝 Support

For issues or questions, please contact: support@silkroad.com

---

**Built with ❤️ using modern web technologies**
