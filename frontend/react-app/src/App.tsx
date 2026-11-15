import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import StaffManagement from './pages/StaffManagement'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import CategoryManagement from './pages/CategoryManagement'
import InventoryList from './components/InventoryList'


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
        <Route path="/sales" element={<SalesPage />} />
                <Route
          path="/staff"
          element={
            (() => {
              try {
                const user = JSON.parse(localStorage.getItem('user') ?? 'null')
                return user?.role?.toLowerCase() === 'admin'
                  ? <StaffManagement />
                  : <Navigate to="/dashboard" replace />
              } catch {
                return <Navigate to="/dashboard" replace />
              }
            })()
          }
        />
                <Route
          path="/categories"
          element={
            (() => {
              try {
                const user = JSON.parse(localStorage.getItem('user') ?? 'null')
                const role = user?.role?.toLowerCase()
                
                // ALLOW BOTH ADMIN AND STAFF
                return role === 'admin' || role === 'staff'
                  ? <CategoryManagement />
                  : <Navigate to="/dashboard" replace />
              } catch {
                return <Navigate to="/dashboard" replace />
              }
            })()
          }
        />
        <Route path="/stock" element={<InventoryList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App