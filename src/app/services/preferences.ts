// src/app/services/preferences.ts
import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type BilankoLanguage = 'fr' | 'en' | 'es';
export type BilankoCurrency = 'XAF' | 'EUR' | 'USD' | 'GBP';

export interface TranslationSet {
  dashboard: string; catalogue: string; sales: string; charges: string;
  documents: string; settings: string; logout: string; soon: string;
  main: string; finances: string; system: string; brandTagline: string;
  searchPlaceholder: string; noResults: string; noResultsHint: string;
  notifications: string; clearAll: string; noNotifications: string;
  profile: string; administrator: string;
  dashboardEyebrow: string; dashboardTitle: string; dashboardSubtitle: string;
  addSale: string; addSaleDesc: string; addCharge: string; addChargeDesc: string;
  productManagement: string; productManagementDesc: string; documentsDesc: string;
  revenue: string; activity: string; expenses: string; simplifiedMargin: string;
  result: string; transactions: string; salesCount: string; recentSales: string;
  recentCharges: string; seeAll: string; noSalesYet: string; noChargesYet: string;
  product: string; client: string; quantity: string; amount: string; comptantClient: string;
  salesManagement: string; salesManagementDesc: string; filter: string; add: string;
  date: string; unitPrice: string; totalAmount: string; actions: string;
  noSalesRecorded: string; addASale: string; filterSales: string; search: string;
  period: string; today: string; thisWeek: string; thisMonth: string;
  reset: string; apply: string; cancel: string; close: string; confirmDeleteSale: string;
  chargesManagement: string; chargesManagementDesc: string; label: string;
  supplier: string; noChargesFound: string; addACharge: string; confirmDeleteCharge: string;
  catalogueTitle: string; catalogueSubtitle: string; export: string;
  productAndRef: string; category: string; stockQty: string; alertThreshold: string;
  unitMargin: string; ref: string; outOfStock: string; lowStock: string;
  noProductsFound: string; totalStockValue: string; showing: string; of: string;
  products: string; newProduct: string; editProduct: string; reference: string;
  productName: string; purchasePrice: string; sellingPrice: string; stockQuantity: string;
  save: string; confirmDeleteProduct: string;
  productPlaceholder: string; requiredField: string; invalidQuantity: string;
  invalidAmount: string; optional: string; notes: string; chargeLabelPlaceholder: string;
  clientCashIfEmpty: string;
  welcomeBack: string; loginSubtitle: string; createAccount: string;
  registerSubtitle: string; forgotPassword: string; forgotPasswordSubtitle: string;
  email: string; password: string; confirmPassword: string; firstName: string;
  lastName: string; login: string; register: string; sendLink: string;
  backToLogin: string; noAccount: string; alreadyAccount: string; rememberMe: string;
  emailRequired: string; emailInvalid: string; passwordRequired: string;
  loggingIn: string; registering: string; sending: string; emailSent: string;
  emailSentDesc: string; resendLink: string; slogan: string; sloganDesc: string;
  featureStock: string; featureMargins: string; featurePdf: string;
  settingsTitle: string; settingsSubtitle: string; general: string;
  accountSecurity: string; appearance: string; generalInfo: string;
  generalInfoDesc: string; phone: string; company: string; saveChanges: string;
  accountStats: string; totalProducts: string; memberSince: string;
  changePassword: string; currentPassword: string; newPassword: string;
  session: string; sessionDesc: string; notificationsDesc: string;
  theme: string; themeDesc: string; dark: string; light: string;
  language: string; languageDesc: string; dateFormat: string; dateFormatDesc: string;
  currency: string; currencyDesc: string; compactMode: string; compactModeDesc: string;
  saveButton: string;
  or: string; enableLightMode: string; enableDarkMode: string; enableSystemMode: string;
  lightMode: string; darkMode: string; systemMode: string; searchHint: string;
  clearSearch: string; invalidEmail: string; invalidPassword: string; yourPassword: string;
  view: string; edit: string; delete: string;
  fcfa: string; loginWithGoogle: string; orLoginWith: string; orRegisterWith: string;
  passwordMismatch: string;   confirmYourPassword: string;
  // --- Nouvelles clés ---
  notifStockTitle: string; notifStockDetail: string;
  notifSaleTitle: string; notifSaleDetail: string;
  notifUpdateTitle: string; notifUpdateDetail: string;
  hoursAgo: string; yesterday: string;
  evolutionTitle: string; chartMargin: string;
  notifStockAlertTitle: string; notifStockAlertDesc: string;
  notifNewSalesTitle: string; notifNewSalesDesc: string;
  notifMonthlyReportTitle: string; notifMonthlyReportDesc: string;
  notifUpdatesTitle: string; notifUpdatesDesc: string;
  profileSaved: string; passwordChanged: string; notificationsUpdated: string;
  languageChanged: string; dateFormatChanged: string; currencyChanged: string;
  compactModeOn: string; compactModeOff: string; preferencesSaved: string;

}

const TRANSLATIONS: Record<BilankoLanguage, TranslationSet> = {
  fr: {
    dashboard: 'Accueil', catalogue: 'Catalogue', sales: 'Ventes', charges: 'Charges',
    documents: 'Documents', settings: 'Paramètres', logout: 'Déconnexion', soon: 'Bientôt',
    main: 'Principal', finances: 'Finances', system: 'Système', brandTagline: 'Gestion financière',
    searchPlaceholder: 'Rechercher dans Bilanko...', noResults: 'Aucun résultat',
    noResultsHint: 'Essayez un nom, une référence ou un client.', notifications: 'Notifications',
    clearAll: 'Tout effacer', noNotifications: 'Aucune notification pour le moment.',
    profile: 'Profil', administrator: 'Administrateur',
    dashboardEyebrow: 'BILANKO • ACTIVITÉ', dashboardTitle: 'Tableau de bord',
    dashboardSubtitle: 'Une vue simple et rapide de votre activité.',
    addSale: 'Ajouter une vente', addSaleDesc: 'Enregistrer une transaction',
    addCharge: 'Ajouter une charge', addChargeDesc: 'Enregistrer une dépense',
    productManagement: 'Gestion des produits', productManagementDesc: 'Catalogue & stock',
    documentsDesc: 'Banque & fiscalité',
    revenue: "Chiffre d'affaires", activity: 'Activité', expenses: 'Dépenses',
    simplifiedMargin: 'Marge simplifiée', result: 'Résultat', transactions: 'Transactions',
    salesCount: 'Nombre de ventes', recentSales: 'Ventes récentes', recentCharges: 'Charges récentes',
    seeAll: 'Voir tout', noSalesYet: 'Aucune vente pour le moment.', noChargesYet: 'Aucune charge enregistrée.',
    product: 'Produit', client: 'Client', quantity: 'Qté', amount: 'Montant',
    comptantClient: 'Client comptant',
    salesManagement: 'Gestion des ventes',
    salesManagementDesc: "Consultez, recherchez et gérez l'ensemble de vos ventes.",
    filter: 'Filtre', add: 'Ajouter', date: 'Date', unitPrice: 'Prix unitaire',
    totalAmount: 'Montant total', actions: 'Actions',
    noSalesRecorded: 'Aucune vente enregistrée ce mois — ajoutez votre première vente.',
    addASale: 'Ajouter une vente', filterSales: 'Filtrer les ventes', search: 'Recherche',
    period: 'Période', today: "Aujourd'hui", thisWeek: 'Cette semaine', thisMonth: 'Ce mois-ci',
    reset: 'Réinitialiser', apply: 'Appliquer', cancel: 'Annuler', close: 'Fermer',
    confirmDeleteSale: 'Voulez-vous vraiment supprimer cette vente ? Le stock sera recrédité.',
    chargesManagement: 'Gestion des charges',
    chargesManagementDesc: "Consultez, recherchez et gérez l'ensemble de vos charges.",
    label: 'Libellé', supplier: 'Fournisseur', noChargesFound: 'Aucune charge trouvée.',
    addACharge: 'Ajouter une charge', confirmDeleteCharge: 'Voulez-vous vraiment supprimer cette charge ?',
    catalogueTitle: 'Catalogue & Stocks',
    catalogueSubtitle: "Gestion détaillée de l'inventaire et des valorisations.",
    export: 'Exporter', productAndRef: 'Nom du produit & réf.', category: 'Catégorie',
    stockQty: 'Qté en stock', alertThreshold: 'Seuil alerte', unitMargin: 'Marge unitaire (FCFA)',
    ref: 'RÉF', outOfStock: 'rupture', lowStock: 'warning',
    noProductsFound: 'Aucun produit ne correspond à votre recherche.',
    totalStockValue: 'Valorisation totale du stock (marge)', showing: 'Affichage de', of: 'sur',
    products: 'produits', newProduct: 'Nouveau produit', editProduct: 'Modifier le produit',
    reference: 'Référence', productName: 'Nom du produit', purchasePrice: "Prix d'achat (FCFA)",
    sellingPrice: 'Prix de vente (FCFA)', stockQuantity: 'Quantité en stock', save: 'Enregistrer',
    confirmDeleteProduct: 'Supprimer ce produit ?',
    productPlaceholder: 'Ex : Sac de riz 25kg', requiredField: 'est requis.',
    invalidQuantity: 'Quantité invalide.', invalidAmount: 'Montant invalide.', optional: 'Optionnel',
    notes: 'Notes', chargeLabelPlaceholder: 'Ex : Transport, Électricité...',
    clientCashIfEmpty: 'Client comptant si vide',
    welcomeBack: 'Bon retour !', loginSubtitle: 'Connectez-vous pour accéder à votre tableau de bord',
    createAccount: 'Créer un compte', registerSubtitle: 'Rejoignez Bilanko et pilotez votre activité',
    forgotPassword: 'Mot de passe oublié', forgotPasswordSubtitle: 'Entrez votre email, on vous envoie un lien de réinitialisation',
    email: 'Email', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom', lastName: 'Nom', login: 'Se connecter', register: 'Créer mon compte',
    sendLink: 'Envoyer le lien', backToLogin: '← Retour à la connexion',
    noAccount: 'Pas encore de compte ?', alreadyAccount: 'Déjà un compte ?',
    rememberMe: 'Se souvenir de moi', emailRequired: "L'email est requis.",
    emailInvalid: "Format d'email invalide.", passwordRequired: 'Le mot de passe est requis.',
    loggingIn: 'Connexion...', registering: 'Inscription...', sending: 'Envoi en cours...',
    emailSent: 'Email envoyé !',
    emailSentDesc: 'Un lien de réinitialisation a été envoyé à votre adresse email si elle existe dans notre système.',
    resendLink: 'Renvoyer le lien', slogan: 'Votre commerce, suivi comme un vrai registre',
    sloganDesc: 'Stock, ventes, charges et marges au quotidien — et un dossier prêt pour votre banque en quelques clics.',
    featureStock: 'Suivi du stock et des ventes', featureMargins: 'Calcul automatique des marges',
    featurePdf: 'Relevé et bilan générés en PDF',
    settingsTitle: 'Paramètres', settingsSubtitle: 'Gérez vos préférences et les paramètres de votre compte',
    general: 'Général', accountSecurity: 'Compte & Sécurité', appearance: 'Apparence',
    generalInfo: 'Informations générales', generalInfoDesc: 'Modifiez les informations de base de votre profil',
    phone: 'Téléphone', company: "Nom de l'entreprise", saveChanges: 'Enregistrer les modifications',
    accountStats: 'Statistiques du compte', totalProducts: 'Produits', memberSince: 'Membre depuis',
    changePassword: 'Changer le mot de passe', currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe', session: 'Session',
    sessionDesc: 'Déconnectez-vous de votre compte sur tous les appareils',
    notificationsDesc: 'Gérez les notifications que vous recevez',
    theme: 'Thème', themeDesc: 'Basculer entre le mode clair et sombre',
    dark: 'Sombre', light: 'Clair', language: 'Langue', languageDesc: 'Choisissez votre langue préférée',
    dateFormat: 'Format de date', dateFormatDesc: "Choisissez le format d'affichage des dates",
    currency: 'Devise', currencyDesc: 'Choisissez la devise par défaut',
    compactMode: 'Mode compact', compactModeDesc: "Réduire les espaces et afficher plus de contenu",
    saveButton: 'Sauvegarder', or: 'ou',
    enableLightMode: 'Activer le mode clair', enableDarkMode: 'Activer le mode sombre',
    enableSystemMode: 'Mode système', lightMode: 'Mode clair', darkMode: 'Mode sombre',
    systemMode: 'Système', searchHint: 'Essayez un nom, une référence ou un client.',
    clearSearch: 'Effacer la recherche', invalidEmail: "Format d'email invalide.",
    invalidPassword: 'Mot de passe invalide.', yourPassword: 'Votre mot de passe',
    view: 'Voir', edit: 'Modifier', delete: 'Supprimer',
    fcfa: 'FCFA', loginWithGoogle: 'Continuer avec Google', orLoginWith: 'ou connectez-vous',
    orRegisterWith: 'ou créez votre compte', passwordMismatch: 'Les mots de passe ne correspondent pas.',
      confirmYourPassword: 'Confirmez votre mot de passe',
    notifStockTitle: 'Stock faible', notifStockDetail: "Sucre 1kg atteint le seuil d'alerte",
    notifSaleTitle: 'Nouvelle vente', notifSaleDetail: 'Vente enregistrée pour Restaurant Le Palo',
    notifUpdateTitle: 'Mise à jour', notifUpdateDetail: 'Le catalogue a été synchronisé',
    hoursAgo: 'Il y a {n}h', yesterday: 'Hier',
    evolutionTitle: "Évolution de l'activité", chartMargin: 'Marge',
    notifStockAlertTitle: 'Alertes de stock', notifStockAlertDesc: "Recevoir une notification quand un produit atteint son seuil d'alerte",
    notifNewSalesTitle: 'Nouvelles ventes', notifNewSalesDesc: 'Être informé des nouvelles ventes enregistrées',
    notifMonthlyReportTitle: 'Rapports mensuels', notifMonthlyReportDesc: 'Recevoir le résumé mensuel de votre activité',
    notifUpdatesTitle: 'Mises à jour', notifUpdatesDesc: 'Notifications sur les nouvelles fonctionnalités',
    profileSaved: 'Profil sauvegardé avec succès !', passwordChanged: 'Mot de passe modifié avec succès !',
    notificationsUpdated: 'Notifications mises à jour', languageChanged: 'Langue modifiée avec succès',
    dateFormatChanged: 'Format de date modifié avec succès', currencyChanged: 'Devise modifiée avec succès',
    compactModeOn: 'Mode compact activé', compactModeOff: 'Mode compact désactivé',
    preferencesSaved: 'Préférences sauvegardées avec succès !',
  },
  en: {
    dashboard: 'Home', catalogue: 'Catalog', sales: 'Sales', charges: 'Expenses',
    documents: 'Documents', settings: 'Settings', logout: 'Log out', soon: 'Soon',
    main: 'Main', finances: 'Finances', system: 'System', brandTagline: 'Financial management',
    searchPlaceholder: 'Search Bilanko...', noResults: 'No results',
    noResultsHint: 'Try a name, reference or client.', notifications: 'Notifications',
    clearAll: 'Clear all', noNotifications: 'No notifications yet.',
    profile: 'Profile', administrator: 'Administrator',
    dashboardEyebrow: 'BILANKO • ACTIVITY', dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'A simple, quick view of your activity.',
    addSale: 'Add a sale', addSaleDesc: 'Record a transaction',
    addCharge: 'Add an expense', addChargeDesc: 'Record an expense',
    productManagement: 'Product management', productManagementDesc: 'Catalog & stock',
    documentsDesc: 'Banking & tax',
    revenue: 'Revenue', activity: 'Activity', expenses: 'Expenses',
    simplifiedMargin: 'Simplified margin', result: 'Result', transactions: 'Transactions',
    salesCount: 'Number of sales', recentSales: 'Recent sales', recentCharges: 'Recent expenses',
    seeAll: 'See all', noSalesYet: 'No sales yet.', noChargesYet: 'No expenses recorded.',
    product: 'Product', client: 'Client', quantity: 'Qty', amount: 'Amount',
    comptantClient: 'Cash client',
    salesManagement: 'Sales management',
    salesManagementDesc: 'View, search and manage all your sales.',
    filter: 'Filter', add: 'Add', date: 'Date', unitPrice: 'Unit price',
    totalAmount: 'Total amount', actions: 'Actions',
    noSalesRecorded: 'No sales recorded this month — add your first sale.',
    addASale: 'Add a sale', filterSales: 'Filter sales', search: 'Search',
    period: 'Period', today: 'Today', thisWeek: 'This week', thisMonth: 'This month',
    reset: 'Reset', apply: 'Apply', cancel: 'Cancel', close: 'Close',
    confirmDeleteSale: 'Are you sure you want to delete this sale? Stock will be restored.',
    chargesManagement: 'Expense management',
    chargesManagementDesc: 'View, search and manage all your expenses.',
    label: 'Label', supplier: 'Supplier', noChargesFound: 'No expenses found.',
    addACharge: 'Add an expense', confirmDeleteCharge: 'Are you sure you want to delete this expense?',
    catalogueTitle: 'Catalog & Stock',
    catalogueSubtitle: 'Detailed inventory management and valuation.',
    export: 'Export', productAndRef: 'Product name & ref.', category: 'Category',
    stockQty: 'Stock qty', alertThreshold: 'Alert threshold', unitMargin: 'Unit margin (FCFA)',
    ref: 'REF', outOfStock: 'out of stock', lowStock: 'low stock',
    noProductsFound: 'No product matches your search.',
    totalStockValue: 'Total stock value (margin)', showing: 'Showing', of: 'of',
    products: 'products', newProduct: 'New product', editProduct: 'Edit product',
    reference: 'Reference', productName: 'Product name', purchasePrice: 'Purchase price (FCFA)',
    sellingPrice: 'Selling price (FCFA)', stockQuantity: 'Stock quantity', save: 'Save',
    confirmDeleteProduct: 'Delete this product?',
    productPlaceholder: 'E.g.: 25kg rice bag', requiredField: 'is required.',
    invalidQuantity: 'Invalid quantity.', invalidAmount: 'Invalid amount.', optional: 'Optional',
    notes: 'Notes', chargeLabelPlaceholder: 'E.g.: Transport, Electricity...',
    clientCashIfEmpty: 'Cash client if empty',
    welcomeBack: 'Welcome back!', loginSubtitle: 'Log in to access your dashboard',
    createAccount: 'Create an account', registerSubtitle: 'Join Bilanko and run your business',
    forgotPassword: 'Forgot password', forgotPasswordSubtitle: "Enter your email, we'll send you a reset link",
    email: 'Email', password: 'Password', confirmPassword: 'Confirm password',
    firstName: 'First name', lastName: 'Last name', login: 'Log in', register: 'Create my account',
    sendLink: 'Send link', backToLogin: '← Back to login',
    noAccount: "Don't have an account yet?", alreadyAccount: 'Already have an account?',
    rememberMe: 'Remember me', emailRequired: 'Email is required.',
    emailInvalid: 'Invalid email format.', passwordRequired: 'Password is required.',
    loggingIn: 'Logging in...', registering: 'Registering...', sending: 'Sending...',
    emailSent: 'Email sent!',
    emailSentDesc: 'A reset link has been sent to your email address if it exists in our system.',
    resendLink: 'Resend link', slogan: 'Your business, tracked like a real ledger',
    sloganDesc: 'Stock, sales, expenses and margins every day — and a file ready for your bank in a few clicks.',
    featureStock: 'Stock and sales tracking', featureMargins: 'Automatic margin calculation',
    featurePdf: 'Statements and balance sheets generated as PDF',
    settingsTitle: 'Settings', settingsSubtitle: 'Manage your preferences and account settings',
    general: 'General', accountSecurity: 'Account & Security', appearance: 'Appearance',
    generalInfo: 'General information', generalInfoDesc: 'Edit your basic profile information',
    phone: 'Phone', company: 'Company name', saveChanges: 'Save changes',
    accountStats: 'Account statistics', totalProducts: 'Products', memberSince: 'Member since',
    changePassword: 'Change password', currentPassword: 'Current password',
    newPassword: 'New password', session: 'Session',
    sessionDesc: 'Log out of your account on all devices',
    notificationsDesc: 'Manage the notifications you receive',
    theme: 'Theme', themeDesc: 'Switch between light and dark mode',
    dark: 'Dark', light: 'Light', language: 'Language', languageDesc: 'Choose your preferred language',
    dateFormat: 'Date format', dateFormatDesc: 'Choose how dates are displayed',
    currency: 'Currency', currencyDesc: 'Choose the default currency',
    compactMode: 'Compact mode', compactModeDesc: 'Reduce spacing and show more content',
    saveButton: 'Save', or: 'or',
    enableLightMode: 'Enable light mode', enableDarkMode: 'Enable dark mode',
    enableSystemMode: 'System mode', lightMode: 'Light mode', darkMode: 'Dark mode',
    systemMode: 'System', searchHint: 'Try a name, reference or client.',
    clearSearch: 'Clear search', invalidEmail: 'Invalid email format.',
    invalidPassword: 'Invalid password.', yourPassword: 'Your password',
    view: 'View', edit: 'Edit', delete: 'Delete',
    fcfa: 'FCFA', loginWithGoogle: 'Continue with Google', orLoginWith: 'or log in with',
    orRegisterWith: 'or sign up with', passwordMismatch: 'Passwords do not match.',
       confirmYourPassword: 'Confirm your password',
    notifStockTitle: 'Low stock', notifStockDetail: 'Sugar 1kg has reached the alert threshold',
    notifSaleTitle: 'New sale', notifSaleDetail: 'Sale recorded for Restaurant Le Palo',
    notifUpdateTitle: 'Update', notifUpdateDetail: 'The catalog has been synced',
    hoursAgo: '{n}h ago', yesterday: 'Yesterday',
    evolutionTitle: 'Activity trend', chartMargin: 'Margin',
    notifStockAlertTitle: 'Stock alerts', notifStockAlertDesc: 'Get notified when a product reaches its alert threshold',
    notifNewSalesTitle: 'New sales', notifNewSalesDesc: 'Be notified of new recorded sales',
    notifMonthlyReportTitle: 'Monthly reports', notifMonthlyReportDesc: 'Receive your monthly activity summary',
    notifUpdatesTitle: 'Updates', notifUpdatesDesc: 'Notifications about new features',
    profileSaved: 'Profile saved successfully!', passwordChanged: 'Password changed successfully!',
    notificationsUpdated: 'Notifications updated', languageChanged: 'Language changed successfully',
    dateFormatChanged: 'Date format changed successfully', currencyChanged: 'Currency changed successfully',
    compactModeOn: 'Compact mode enabled', compactModeOff: 'Compact mode disabled',
    preferencesSaved: 'Preferences saved successfully!'
  },
  es: {
    dashboard: 'Inicio', catalogue: 'Catálogo', sales: 'Ventas', charges: 'Gastos',
    documents: 'Documentos', settings: 'Configuración', logout: 'Cerrar sesión', soon: 'Próximamente',
    main: 'Principal', finances: 'Finanzas', system: 'Sistema', brandTagline: 'Gestión financiera',
    searchPlaceholder: 'Buscar en Bilanko...', noResults: 'Sin resultados',
    noResultsHint: 'Prueba un nombre, referencia o cliente.', notifications: 'Notificaciones',
    clearAll: 'Borrar todo', noNotifications: 'No hay notificaciones por ahora.',
    profile: 'Perfil', administrator: 'Administrador',
    dashboardEyebrow: 'BILANKO • ACTIVIDAD', dashboardTitle: 'Panel de control',
    dashboardSubtitle: 'Una vista simple y rápida de tu actividad.',
    addSale: 'Añadir una venta', addSaleDesc: 'Registrar una transacción',
    addCharge: 'Añadir un gasto', addChargeDesc: 'Registrar un gasto',
    productManagement: 'Gestión de productos', productManagementDesc: 'Catálogo y stock',
    documentsDesc: 'Banca y fiscalidad',
    revenue: 'Ingresos', activity: 'Actividad', expenses: 'Gastos',
    simplifiedMargin: 'Margen simplificado', result: 'Resultado', transactions: 'Transacciones',
    salesCount: 'Número de ventas', recentSales: 'Ventas recientes', recentCharges: 'Gastos recientes',
    seeAll: 'Ver todo', noSalesYet: 'Aún no hay ventas.', noChargesYet: 'No hay gastos registrados.',
    product: 'Producto', client: 'Cliente', quantity: 'Cant.', amount: 'Importe',
    comptantClient: 'Cliente al contado',
    salesManagement: 'Gestión de ventas',
    salesManagementDesc: 'Consulta, busca y gestiona todas tus ventas.',
    filter: 'Filtro', add: 'Añadir', date: 'Fecha', unitPrice: 'Precio unitario',
    totalAmount: 'Importe total', actions: 'Acciones',
    noSalesRecorded: 'No hay ventas registradas este mes — añade tu primera venta.',
    addASale: 'Añadir una venta', filterSales: 'Filtrar ventas', search: 'Buscar',
    period: 'Periodo', today: 'Hoy', thisWeek: 'Esta semana', thisMonth: 'Este mes',
    reset: 'Restablecer', apply: 'Aplicar', cancel: 'Cancelar', close: 'Cerrar',
    confirmDeleteSale: '¿Seguro que quieres eliminar esta venta? Se restaurará el stock.',
    chargesManagement: 'Gestión de gastos',
    chargesManagementDesc: 'Consulta, busca y gestiona todos tus gastos.',
    label: 'Concepto', supplier: 'Proveedor', noChargesFound: 'No se encontraron gastos.',
    addACharge: 'Añadir un gasto', confirmDeleteCharge: '¿Seguro que quieres eliminar este gasto?',
    catalogueTitle: 'Catálogo y Stock',
    catalogueSubtitle: 'Gestión detallada del inventario y valorización.',
    export: 'Exportar', productAndRef: 'Nombre del producto y ref.', category: 'Categoría',
    stockQty: 'Cant. en stock', alertThreshold: 'Umbral de alerta', unitMargin: 'Margen unitario (FCFA)',
    ref: 'REF', outOfStock: 'agotado', lowStock: 'bajo',
    noProductsFound: 'Ningún producto coincide con tu búsqueda.',
    totalStockValue: 'Valorización total del stock (margen)', showing: 'Mostrando', of: 'de',
    products: 'productos', newProduct: 'Nuevo producto', editProduct: 'Editar producto',
    reference: 'Referencia', productName: 'Nombre del producto', purchasePrice: 'Precio de compra (FCFA)',
    sellingPrice: 'Precio de venta (FCFA)', stockQuantity: 'Cantidad en stock', save: 'Guardar',
    confirmDeleteProduct: '¿Eliminar este producto?',
    productPlaceholder: 'Ej.: Saco de arroz 25kg', requiredField: 'es obligatorio.',
    invalidQuantity: 'Cantidad inválida.', invalidAmount: 'Importe inválido.', optional: 'Opcional',
    notes: 'Notas', chargeLabelPlaceholder: 'Ej.: Transporte, Electricidad...',
    clientCashIfEmpty: 'Cliente al contado si está vacío',
    welcomeBack: '¡Bienvenido de nuevo!', loginSubtitle: 'Inicia sesión para acceder a tu panel',
    createAccount: 'Crear una cuenta', registerSubtitle: 'Únete a Bilanko y gestiona tu negocio',
    forgotPassword: 'Contraseña olvidada', forgotPasswordSubtitle: 'Introduce tu email, te enviaremos un enlace de restablecimiento',
    email: 'Email', password: 'Contraseña', confirmPassword: 'Confirmar contraseña',
    firstName: 'Nombre', lastName: 'Apellido', login: 'Iniciar sesión', register: 'Crear mi cuenta',
    sendLink: 'Enviar enlace', backToLogin: '← Volver al inicio de sesión',
    noAccount: '¿Aún no tienes cuenta?', alreadyAccount: '¿Ya tienes una cuenta?',
    rememberMe: 'Recordarme', emailRequired: 'El email es obligatorio.',
    emailInvalid: 'Formato de email inválido.', passwordRequired: 'La contraseña es obligatoria.',
    loggingIn: 'Iniciando sesión...', registering: 'Registrando...', sending: 'Enviando...',
    emailSent: '¡Email enviado!',
    emailSentDesc: 'Se ha enviado un enlace de restablecimiento a tu email si existe en nuestro sistema.',
    resendLink: 'Reenviar enlace', slogan: 'Tu negocio, registrado como un verdadero libro contable',
    sloganDesc: 'Stock, ventas, gastos y márgenes cada día — y un expediente listo para tu banco en unos clics.',
    featureStock: 'Seguimiento de stock y ventas', featureMargins: 'Cálculo automático de márgenes',
    featurePdf: 'Estados y balances generados en PDF',
    settingsTitle: 'Configuración', settingsSubtitle: 'Gestiona tus preferencias y ajustes de cuenta',
    general: 'General', accountSecurity: 'Cuenta y Seguridad', appearance: 'Apariencia',
    generalInfo: 'Información general', generalInfoDesc: 'Edita la información básica de tu perfil',
    phone: 'Teléfono', company: 'Nombre de la empresa', saveChanges: 'Guardar cambios',
    accountStats: 'Estadísticas de la cuenta', totalProducts: 'Productos', memberSince: 'Miembro desde',
    changePassword: 'Cambiar contraseña', currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña', session: 'Sesión',
    sessionDesc: 'Cerrar sesión en todos los dispositivos',
    notificationsDesc: 'Gestiona las notificaciones que recibes',
    theme: 'Tema', themeDesc: 'Cambiar entre modo claro y oscuro',
    dark: 'Oscuro', light: 'Claro', language: 'Idioma', languageDesc: 'Elige tu idioma preferido',
    dateFormat: 'Formato de fecha', dateFormatDesc: 'Elige cómo se muestran las fechas',
    currency: 'Moneda', currencyDesc: 'Elige la moneda por defecto',
    compactMode: 'Modo compacto', compactModeDesc: 'Reducir espacios y mostrar más contenido',
    saveButton: 'Guardar', or: 'o',
    enableLightMode: 'Activar modo claro', enableDarkMode: 'Activar modo oscuro',
    enableSystemMode: 'Modo sistema', lightMode: 'Modo claro', darkMode: 'Modo oscuro',
    systemMode: 'Sistema', searchHint: 'Prueba un nombre, referencia o cliente.',
    clearSearch: 'Borrar búsqueda', invalidEmail: 'Formato de email inválido.',
    invalidPassword: 'Contraseña inválida.', yourPassword: 'Tu contraseña',
    view: 'Ver', edit: 'Editar', delete: 'Eliminar',
    fcfa: 'FCFA', loginWithGoogle: 'Continuar con Google', orLoginWith: 'o inicia sesión con',
    orRegisterWith: 'o regístrate con', passwordMismatch: 'Las contraseñas no coinciden.',
     confirmYourPassword: 'Confirma tu contraseña',
    notifStockTitle: 'Stock bajo', notifStockDetail: 'El azúcar 1kg alcanzó el umbral de alerta',
    notifSaleTitle: 'Nueva venta', notifSaleDetail: 'Venta registrada para Restaurant Le Palo',
    notifUpdateTitle: 'Actualización', notifUpdateDetail: 'El catálogo ha sido sincronizado',
    hoursAgo: 'Hace {n}h', yesterday: 'Ayer',
    evolutionTitle: 'Evolución de la actividad', chartMargin: 'Margen',
    notifStockAlertTitle: 'Alertas de stock', notifStockAlertDesc: 'Recibir una notificación cuando un producto alcanza su umbral de alerta',
    notifNewSalesTitle: 'Nuevas ventas', notifNewSalesDesc: 'Ser informado de las nuevas ventas registradas',
    notifMonthlyReportTitle: 'Informes mensuales', notifMonthlyReportDesc: 'Recibir el resumen mensual de tu actividad',
    notifUpdatesTitle: 'Actualizaciones', notifUpdatesDesc: 'Notificaciones sobre nuevas funciones',
    profileSaved: '¡Perfil guardado con éxito!', passwordChanged: '¡Contraseña cambiada con éxito!',
    notificationsUpdated: 'Notificaciones actualizadas', languageChanged: 'Idioma cambiado con éxito',
    dateFormatChanged: 'Formato de fecha cambiado con éxito', currencyChanged: 'Moneda cambiada con éxito',
    compactModeOn: 'Modo compacto activado', compactModeOff: 'Modo compacto desactivado',
    preferencesSaved: '¡Preferencias guardadas con éxito!',
    
  }
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'bilanko_preferences';

  readonly language = signal<BilankoLanguage>('fr');
  readonly dateFormat = signal<string>('DD/MM/YYYY');
  readonly currency = signal<BilankoCurrency>('XAF');
  readonly compactMode = signal<boolean>(false);

  readonly t = computed(() => TRANSLATIONS[this.language()]);

  readonly angularDateFormat = computed(() => {
    switch (this.dateFormat()) {
      case 'MM/DD/YYYY': return 'MM/dd/yyyy';
      case 'YYYY-MM-DD': return 'yyyy-MM-dd';
      default: return 'dd/MM/yyyy';
    }
  });

  constructor() {
    this.load();
    effect(() => {
      this.save();
      this.applyDom();
    });
  }

  private load(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw);
      if (prefs.language) this.language.set(prefs.language);
      if (prefs.dateFormat) this.dateFormat.set(prefs.dateFormat);
      if (prefs.currency) this.currency.set(prefs.currency);
      if (prefs.compactMode !== undefined) this.compactMode.set(prefs.compactMode);
    } catch {}
  }

  private save(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        language: this.language(),
        dateFormat: this.dateFormat(),
        currency: this.currency(),
        compactMode: this.compactMode(),
      }));
    } catch {}
  }

  private applyDom(): void {
    if (!this.isBrowser) return;
    const html = document.documentElement;
    html.setAttribute('lang', this.language());
    html.setAttribute('data-compact', this.compactMode() ? 'true' : 'false');
  }
}