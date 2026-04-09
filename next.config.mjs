/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    /** @type {import('next').Redirect[]} */
    const redirects = [
      // Auth / entry
      { source: '/login', destination: '/auth/login', permanent: false },

      // Dashboard
      { source: '/dashboard/recap-ventes-achats', destination: '/recap-sales-purchases', permanent: false },

      // Customers / Sales
      { source: '/customers_list', destination: '/customers', permanent: false },
      { source: '/editcustomer/:id?', destination: '/customers', permanent: false },
      { source: '/dialogcard/Customer/:customerId', destination: '/customers', permanent: false },

      // NOTE: we now have real pages for these routes, so do not redirect them.
      // { source: '/invoices-advanced', destination: '/invoices', permanent: false },
      // { source: '/manage-invoice', destination: '/invoices', permanent: false },

      // Do NOT add self-redirects (same source + destination) — they cause ERR_TOO_MANY_REDIRECTS.

      { source: '/devis', destination: '/quotations', permanent: false },

      { source: '/avoirs', destination: '/credit-notes', permanent: false },
      { source: '/manage-avoirs', destination: '/manage-credit-notes', permanent: false },
      // TODO: once AddOrUpdateAvoir is implemented, route it here instead of /credit-notes
      { source: '/AddOrUpdateAvoir/:num?', destination: '/manage-credit-notes', permanent: false },

      { source: '/paiements-client', destination: '/customer-payments', permanent: false },
      { source: '/paiement-client/add', destination: '/customer-payments', permanent: false },
      { source: '/paiement-client/edit/:id', destination: '/customer-payments', permanent: false },

      { source: '/cloture-caisse', destination: '/cash-register', permanent: false },
      { source: '/soldes-client', destination: '/customer-balances', permanent: false },
      { source: '/soldes-clients-problemes', destination: '/client-balance-issues', permanent: false },

      // Providers / Purchasing
      { source: '/providers_list', destination: '/suppliers', permanent: false },
      { source: '/editprovider/:id?', destination: '/suppliers', permanent: false },
      { source: '/dialogcard/Provider/:providerId', destination: '/suppliers', permanent: false },
      { source: '/manage-providers-invoices', destination: '/supplier-invoices', permanent: false },

      { source: '/provider-invoices', destination: '/supplier-invoices', permanent: false },
      { source: '/provider-invoices-advanced', destination: '/supplier-invoices', permanent: false },

      { source: '/avoir-fournisseur', destination: '/supplier-credit-notes', permanent: false },
      { source: '/manage-avoir-fournisseur', destination: '/supplier-credit-notes', permanent: false },
      { source: '/AddOrUpdateAvoirFournisseur/:id?', destination: '/supplier-credit-notes', permanent: false },

      { source: '/facture-avoir-fournisseur', destination: '/supplier-credit-notes', permanent: false },
      { source: '/manage-facture-avoir-fournisseur', destination: '/supplier-credit-notes', permanent: false },

      { source: '/avoir-financier-fournisseurs', destination: '/supplier-financial-credit-notes', permanent: false },
      { source: '/AddOrUpdateAvoirFinancierFournisseurs/:num?', destination: '/supplier-financial-credit-notes', permanent: false },

      { source: '/orders', destination: '/purchase-orders', permanent: false },
      { source: '/commandes', destination: '/purchase-orders', permanent: false },
      { source: '/AddOrUpdateOrder/:num?', destination: '/purchase-order', permanent: false },
      { source: '/order/:orderId', destination: '/purchase-order', permanent: false },

      { source: '/reciption_notes', destination: '/receipt-notes', permanent: false },
      { source: '/add_or_update_reciption_notes/:num?', destination: '/receipt-notes', permanent: false },

      { source: '/retours-marchandise-fournisseur', destination: '/supplier-returns', permanent: false },
      { source: '/add_or_update_retour_marchandise_fournisseur/:num?', destination: '/supplier-returns', permanent: false },

      { source: '/paiements-fournisseur', destination: '/supplier-payments', permanent: false },
      { source: '/paiements-fournisseur/calendrier', destination: '/supplier-payments', permanent: false },
      { source: '/paiement-fournisseur/add', destination: '/supplier-payments', permanent: false },
      { source: '/paiement-fournisseur/edit/:id', destination: '/supplier-payments', permanent: false },

      { source: '/soldes-fournisseur', destination: '/supplier-balances', permanent: false },
      { source: '/soldes-fournisseurs-problemes', destination: '/supplier-balance-issues', permanent: false },

      // Expenses
      { source: '/tiers-depenses-fonctionnement', destination: '/expense-vendors', permanent: false },
      { source: '/tiers-depenses-fonctionnement/add', destination: '/expense-vendors', permanent: false },
      { source: '/tiers-depenses-fonctionnement/edit', destination: '/expense-vendors', permanent: false },
      { source: '/tiers-depenses-fonctionnement/edit/:id', destination: '/expense-vendors', permanent: false },

      { source: '/factures-depenses', destination: '/expense-invoices', permanent: false },
      { source: '/factures-depenses/add', destination: '/expense-invoices', permanent: false },
      { source: '/factures-depenses/edit/:id', destination: '/expense-invoices', permanent: false },

      { source: '/factures-tej', destination: '/expense-invoices', permanent: false },

      { source: '/paiements-tiers-depenses', destination: '/expense-payments', permanent: false },
      { source: '/paiements-tiers-depenses/add', destination: '/expense-payments', permanent: false },
      { source: '/paiements-tiers-depenses/edit/:id', destination: '/expense-payments', permanent: false },

      { source: '/soldes-tiers-depenses', destination: '/expense-balances', permanent: false },

      // Stock
      { source: '/products_list', destination: '/products', permanent: false },
      { source: '/products_list_view', destination: '/products', permanent: false },
      { source: '/editproduct/:id?', destination: '/products', permanent: false },

      { source: '/product-families/edit', destination: '/product-families', permanent: false },
      { source: '/product-families/edit/:id', destination: '/product-families', permanent: false },

      { source: '/product-subfamilies/edit', destination: '/product-subfamilies', permanent: false },
      { source: '/product-subfamilies/edit/:id', destination: '/product-subfamilies', permanent: false },

      { source: '/inventaires', destination: '/inventory', permanent: false },
      { source: '/inventaires/add', destination: '/inventory', permanent: false },
      { source: '/inventaires/edit/:id', destination: '/inventory', permanent: false },

      { source: '/tags', destination: '/products', permanent: false },

      // Technicians
      { source: '/installation-technicians', destination: '/technicians', permanent: false },
      { source: '/installation-technician/add', destination: '/technicians', permanent: false },
      { source: '/installation-technician/edit/:id', destination: '/technicians', permanent: false },

      // Banking
      { source: '/banques', destination: '/banks', permanent: false },
      { source: '/banque/add', destination: '/banks', permanent: false },
      { source: '/banque/edit/:id', destination: '/banks', permanent: false },

      { source: '/comptes-bancaires', destination: '/bank-accounts', permanent: false },
      { source: '/compte-bancaire/add', destination: '/bank-accounts', permanent: false },
      { source: '/compte-bancaire/edit/:id', destination: '/bank-accounts', permanent: false },

      { source: '/releves-bancaires', destination: '/bank-statements', permanent: false },

      // Administration
      { source: '/audit-logs', destination: '/admin/audit-log', permanent: false },
      { source: '/print-history', destination: '/admin/print-history', permanent: false },

      { source: '/accounting-years', destination: '/admin/accounting-years', permanent: false },
      { source: '/accounting-year/add', destination: '/admin/accounting-years', permanent: false },
      { source: '/accounting-year/edit/:id', destination: '/admin/accounting-years', permanent: false },

      { source: '/users', destination: '/admin/users', permanent: false },
      { source: '/users/new', destination: '/admin/users', permanent: false },
      { source: '/users/edit/:userId', destination: '/admin/users', permanent: false },

      { source: '/app_parameters', destination: '/admin/settings', permanent: false },
    ]

    return redirects
  },
}

export default nextConfig
