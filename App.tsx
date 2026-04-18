import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tracking } from './pages/Tracking';
import { ClientsList } from './pages/clients/ClientsList';
import { ClientForm } from './pages/clients/ClientForm';
import { InventoryList } from './pages/inventory/InventoryList';
import { ProductForm } from './pages/inventory/ProductForm';
import { ProductDetails } from './pages/inventory/ProductDetails';
import { CategoriesList } from './pages/inventory/CategoriesList';
import { OrdersList } from './pages/orders/OrdersList';
import { OrderDetails } from './pages/orders/OrderDetails';
import { OrderForm } from './pages/orders/OrderForm';
import { Reports } from './pages/Reports';
import { SalesPoint } from './pages/sales/SalesPoint';
import { Settings } from './pages/Settings';
import { LogoStudio } from './pages/LogoStudio';
import { ToastProvider } from './components/Toast';
import { UpdateNotification } from './components/UpdateNotification';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
    <div className="relative z-10 flex flex-col items-center gap-6 p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary rounded-full absolute top-0 left-0 border-t-transparent animate-spin"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Carregando Sistema</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Verificando sua sessão...</p>
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authChecked } = useApp();

  // Show the full-screen loader ONLY while we don't yet know if the user is signed in.
  // This is a very fast check (< 1s). Once authChecked=true, we let pages render
  // and use their own skeleton components while data loads in the background.
  if (!authChecked) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/tracking" element={<Tracking />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/clients" element={<ProtectedRoute><ClientsList /></ProtectedRoute>} />
      <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
      <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />

      <Route path="/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
      <Route path="/inventory/categories" element={<ProtectedRoute><CategoriesList /></ProtectedRoute>} />
      <Route path="/inventory/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
      <Route path="/inventory/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
      <Route path="/inventory/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

      <Route path="/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      <Route path="/orders/:id/edit" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />

      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><SalesPoint /></ProtectedRoute>} />

      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/logo-studio" element={<LogoStudio />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <UpdateNotification />
          <AppRoutes />
        </Router>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;