import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import StaffManagement from './pages/StaffManagement'
import ProductManagement from './pages/ProductManagement'
import ProductsPage from './pages/ProductsPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import CategoryManagement from './pages/CategoryManagement'
import ProductManagement from './pages/ProductManagement'

function ProtectedRoute() {
  const token = localStorage.getItem('token')

  return token ? <AppShell /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<ProductsPage />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/products" element={<ProductManagement />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App