import { NavLink, Outlet } from 'react-router-dom'

function AppShell() {
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
        </nav>
      </aside>

      <div className="ml-[240px] min-h-screen">
        <header className="sticky top-0 z-10 flex h-[58px] items-center border-b border-[#e9ecef] bg-white px-7">
          <h1 className="text-base font-semibold text-[#212529]">
            GroceryTrack
          </h1>
        </header>

        <main className="p-[24px_28px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell