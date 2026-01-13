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
import { ToastProvider } from './components/Toast';
import { UpdateNotification } from './components/UpdateNotification';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
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