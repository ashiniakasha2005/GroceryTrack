import { NavLink, Outlet } from 'react-router-dom'

function AppShell() {
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark px-4">
        <span className="navbar-brand mb-0 h1">GroceryTrack</span>
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