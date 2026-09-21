import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function AppShell() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand mb-0 h1">GroceryTrack</span>

        <button
          type="button"
          className="btn btn-outline-light"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      <div className="d-flex">
        <aside
          className="bg-white border-end p-3"
          style={{ width: '220px', minHeight: 'calc(100vh - 56px)' }}
        >
          <nav className="nav flex-column gap-2">
            <NavLink className="nav-link" to="/dashboard">
              Dashboard
            </NavLink>
          </nav>
        </aside>

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell