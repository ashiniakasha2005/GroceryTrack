import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function AppShell() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#212529] p-4 text-white">
        <div className="mb-8 text-lg font-bold">
          GroceryTrack
        </div>

        <nav>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-[#0d6efd] font-semibold text-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/staff"
            className={({ isActive }) =>
              `mt-1 block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-[#0d6efd] font-semibold text-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`
            }
          >
            Staff Management
          </NavLink>
        </nav>
      </aside>

      <div className="ml-[240px] min-h-screen">
        <header className="sticky top-0 z-10 flex h-[58px] items-center justify-between border-b border-[#e9ecef] bg-white px-7">
          <h1 className="text-base font-semibold text-[#212529]">
            GroceryTrack
          </h1>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[#dc3545] px-4 py-2 text-sm font-medium text-[#dc3545] hover:bg-[#dc3545] hover:text-white"
          >
            Logout
          </button>
        </header>

        <main className="p-[24px_28px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell