# Silk Road ERP - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Application
```bash
pnpm dev
```
Open http://localhost:3000 in your browser.

### Step 2: Login
You'll be redirected to the login page. Use these credentials:
- **Email:** `demo@silkroad.com`
- **Password:** `demo123`

### Step 3: Explore the Dashboard
After login, you'll see the Dashboard with:
- KPI metrics (Revenue, Purchases, Customers, Products, Growth)
- Sales vs. Purchases chart
- Product distribution pie chart
- Revenue trend line chart
- Customer segment distribution
- Recent transactions table

---

## 📍 Navigation Guide

### Main Sidebar Menu
The left sidebar contains all modules:

#### Overview
- **Dashboard** - Main KPI dashboard
- **Recap Sales & Purchases** - Detailed analytics

#### Clients
- **Accounts** - Customer list and management
- **Invoices** - Invoice tracking and management
- **Delivery Notes** - Shipment tracking
- **Credit Notes** - Return and adjustment notes

#### Providers
- **Accounts** - Supplier list and management
- **Purchase Orders** - PO creation and tracking
- **Receipt Notes** - Incoming shipment tracking
- **Supplier Payments** - Payment management

#### Stock
- **Articles** - Product catalog
- **Product Families** - Product categories
- **Inventories** - Stock level monitoring

#### Administration
- **Users** - User account management
- **Roles** - Role and permission management
- **Accounting Years** - Fiscal period configuration
- **Parameters** - System settings

---

## 🎨 UI Features

### Header Controls
- **Company Logo & Name** - Click to return to dashboard
- **Accounting Year Dropdown** - Select fiscal year (2024, 2023, 2022)
- **Theme Toggle** - Switch between dark and light themes
- **User Profile Menu** - Profile, settings, and logout

### Sidebar Navigation
- Click module names to expand/collapse
- Active page is highlighted in blue
- Submenu items show current location
- Mobile: Hamburger menu available

### Data Tables
- **Search** - Real-time filtering at the top
- **Sorting** - Click column headers to sort
- **Pagination** - View multiple records
- **Status Badges** - Color-coded status indicators
- **Add New** - Button to create new records

### Dashboard Charts
- **Hover** - See detailed values on chart hover
- **Interactive** - Some charts show legends you can toggle
- **Responsive** - Charts adapt to screen size

---

## 🔍 How to Use Each Module

### Dashboard
1. View all KPI metrics at a glance
2. Monitor sales and purchase trends
3. Check recent transactions
4. Click "View All" for detailed lists

### Customers (Clients)
1. **View List** - See all customers with stats
2. **Search** - Find customers by name, email, or city
3. **Add New** - Create new customer account
4. **Statistics** - Total customers, active, and lifetime value

### Invoices
1. **View All Invoices** - See sales invoices
2. **Filter by Status** - Paid, pending, overdue, draft
3. **Track Amounts** - Total, paid, and overdue amounts
4. **Create** - Generate new invoice

### Suppliers (Providers)
1. **View List** - See all suppliers with payment terms
2. **Track Orders** - Number of orders and total purchased
3. **Manage** - Edit supplier information
4. **Payment Terms** - View net terms (Net 30/45/60)

### Purchase Orders
1. **Create** - Generate new purchase order
2. **Track Status** - Draft, sent, received, cancelled
3. **Monitor Delivery** - Expected delivery dates
4. **View Items** - Number of items per order

### Stock & Inventory
1. **Product Catalog** - All products with prices and suppliers
2. **Low Stock Alerts** - See products needing reorder
3. **Categories** - Organize by product families
4. **Valuation** - Total inventory value

### Administration

#### Users
- View all system users
- See roles and status
- Track last login
- Manage permissions

#### Roles
- View role definitions
- See assigned users
- Manage permissions
- Active/inactive status

#### Accounting Years
- Configure fiscal periods
- Lock/unlock years
- View transaction counts
- Archive old years

#### Settings
- Company information
- Document numbering
- Tax rates
- Security settings
- Backup configuration

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- **Tab** - Navigate between form fields
- **Enter** - Submit forms or expand menus
- **Escape** - Close menus or dialogs

### Search Tips
- Search is case-insensitive
- Partial matching works (e.g., "tech" finds "Tech Solutions")
- Multiple fields are searched simultaneously

### Filtering & Sorting
1. Type in the search box for real-time filtering
2. Click column headers to sort A-Z or Z-A
3. Click again to reverse sort direction
4. Table data updates instantly

### Mobile Usage
- Hamburger menu (☰) on top left opens/closes sidebar
- Swipe left to access sidebar
- Single column layout on small screens
- Touch-friendly button sizing

### Theme Switching
- Click the sun/moon icon in the header
- Theme preference is saved
- Applies instantly across all pages

---

## 📊 Understanding the Data

### Status Indicators
- **Green** - Active, positive, completed
- **Yellow** - Pending, warning, in progress
- **Red** - Overdue, error, inactive
- **Blue** - New, in transit, draft
- **Gray** - Archived, inactive, locked

### Metrics Explained
- **Total Revenue** - Sum of all sales
- **Total Purchases** - Sum of supplier costs
- **Profit Margin** - Revenue minus expenses
- **Active Customers** - Currently engaged accounts
- **In Stock** - Available products at full stock

---

## 🔐 Security Notes

### Session Management
- You're logged in after entering credentials
- Session persists until logout
- Closing the browser logs you out automatically
- Each user has role-based access

### Password Protection
- Demo account is for testing only
- Change password in User Profile menu
- Keep credentials confidential
- Two-factor authentication available in settings

### Data Privacy
- All data is demo/mock data
- No real customer information
- Safe for testing and demonstration
- Ready for real database connection

---

## 🐛 Troubleshooting

### Login Issues
- Verify email: `demo@silkroad.com`
- Verify password: `demo123`
- Clear browser cache if needed
- Refresh the page and try again

### Display Issues
- Check browser zoom level (should be 100%)
- Try a different browser if needed
- Clear browser cache
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Performance Issues
- Close unused browser tabs
- Check internet connection
- Reduce chart refresh rate
- Disable browser extensions

### Mobile Issues
- Rotate device for better layout
- Use Chrome or Safari for best compatibility
- Pinch-zoom to adjust sizes
- Portrait mode for navigation

---

## 🎯 Next Steps

### Customization
1. Change company name in settings
2. Adjust accounting year
3. Configure tax rates
4. Set backup frequency

### Data Management
1. Add new customers in Customers module
2. Create suppliers in Providers module
3. Add products to catalog
4. Manage users in Administration

### Integration Ready
- Ready for backend API connection
- Database integration points prepared
- Authentication ready for upgrade
- Form validation ready for implementation

---

## 📞 Support Resources

### Getting Help
1. Check the README.md for detailed features
2. Review IMPLEMENTATION_SUMMARY.md for architecture
3. Explore admin settings for configuration
4. Check console for error messages

### Common Questions
- **How to change theme?** Click sun/moon in header
- **How to change year?** Select from dropdown in header
- **How to logout?** Click user profile → Logout
- **How to add records?** Click "Add New" button on list pages

---

## ✅ Your First 10 Minutes

1. **Minutes 0-1** - Start app and login
2. **Minutes 1-2** - Explore dashboard and charts
3. **Minutes 2-4** - Visit Customers module
4. **Minutes 4-6** - Check Suppliers and Products
5. **Minutes 6-8** - Visit Administration section
6. **Minutes 8-9** - Customize theme and settings
7. **Minutes 9-10** - Explore sidebar navigation

---

## 🎉 You're Ready!

The Silk Road ERP system is now ready for exploration and customization. All features are functional with demo data to help you understand the system capabilities.

**Happy exploring! 🚀**

---

*For detailed information, see README.md and IMPLEMENTATION_SUMMARY.md*
