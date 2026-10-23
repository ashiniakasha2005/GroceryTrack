import { useState, type ReactNode } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  icon: ReactNode
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// Sidebar menu – same items and order as the UI design
const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/sales',
    label: 'Sales / POS',
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
        <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6" />
      </svg>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <circle cx="7" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="7" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="7" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/staff',
    label: 'Staff Management',
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
        <path d="M16 6.5a2.5 2.5 0 1 1 0 5" />
        <path d="M16 14c2.1.2 3.7 1.7 4.3 4" />
      </svg>
    ),
  },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sales': 'Sales / POS',
  '/inventory': 'Inventory Management',
  '/staff': 'Staff Management',
  '/products': 'Product Management',
  '/categories': 'Category Management',
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  // The account that is currently logged in (saved by the login page)
  const [currentUser] = useState<{ name?: string; role?: string } | null>(
    () => {
      try {
        return JSON.parse(localStorage.getItem('user') ?? 'null')
      } catch {
        return null
      }
    },
  )

  const userName = currentUser?.name ?? ''
  const userRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : ''
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const handleLogout = async () => {
    const token = localStorage.getItem('token')

    try {
      if (token) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  const pageTitle = pageTitles[location.pathname] ?? 'GroceryTrack'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
      isActive
        ? 'bg-[#0d6efd] font-semibold text-white'
        : 'text-[#adb5bd] hover:bg-[#343a40] hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col bg-[#212529] px-4 py-4 text-white">
        {/* Logo */}
        <div className="border-b border-[#343a40] pb-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/grocerytrack-logo.png.jpeg"
              alt="GroceryTrack Logo"
              className="h-10 w-10 rounded-lg object-cover"
            />

            <div>
              <div className="text-sm font-bold leading-tight">
                GroceryTrack
              </div>

              <div className="mt-1 text-[10px] text-[#adb5bd]">
                Store Management
              </div>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <div className="mt-6">
          <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c757d]">
            Main Menu
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User + Logout */}
        <div className="mt-auto border-t border-[#343a40] pt-4">
          {/* Logged-in user */}
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d6efd] text-[10px] font-bold text-white">
              {userInitials}
            </div>

            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">
                {userName}
              </div>

              <div className="mt-0.5 text-[10px] text-[#adb5bd]">
                {userRole}
              </div>
            </div>
          </div>

          {/* Sidebar Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md border border-[#495057] px-3 py-2 text-left text-xs text-[#adb5bd] transition hover:bg-[#343a40] hover:text-white"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 4v16" />
            </svg>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="ml-[240px] min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[58px] items-center justify-between border-b border-[#e9ecef] bg-white px-7">
          {/* Page title + date */}
          <div>
            <h1 className="text-sm font-semibold leading-tight text-[#212529]">
              {pageTitle}
            </h1>

            <div className="mt-1 text-[10px] text-[#adb5bd]">{today}</div>
          </div>

          {/* Right side */}
          <div className="relative flex items-center gap-4">
            {/* Notification Area */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((current) => !current)
                  setShowAccountMenu(false)
                }}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#6c757d] transition hover:bg-[#f8f9fa] hover:text-[#212529]"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {/* Notification dot */}
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#dc3545] ring-2 ring-white" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-[42px] z-50 w-[280px] overflow-hidden rounded-lg border border-[#e9ecef] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-[#e9ecef] px-4 py-3">
                    <div className="text-xs font-semibold text-[#212529]">
                      Notifications
                    </div>

                    <div className="mt-1 text-[10px] text-[#adb5bd]">
                      Recent system notifications
                    </div>
                  </div>

                  <div className="px-4 py-4">
                    <div className="flex items-center gap-3 rounded-md bg-[#f8f9fa] p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cfe2ff] text-[#0d6efd]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 8v4l2.5 2.5" />
                          <circle cx="12" cy="12" r="8.5" />
                        </svg>
                      </div>

                      <div>
                        <div className="text-[11px] font-medium text-[#495057]">
                          No new notifications
                        </div>

                        <div className="mt-1 text-[10px] text-[#adb5bd]">
                          You are all caught up.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Area */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                onClick={() => {
                  setShowAccountMenu((current) => !current)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 rounded-md border-none bg-transparent p-0 text-left transition hover:bg-[#f8f9fa]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d6efd] text-[10px] font-bold text-white">
                  {userInitials}
                </div>

                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#343a40]">
                    {userName}
                  </div>

                  <div className="mt-0.5 text-[10px] text-[#adb5bd]">
                    {userRole}
                  </div>
                </div>
              </button>

              {/* Account Dropdown */}
              {showAccountMenu && (
                <div className="absolute right-0 top-[42px] z-50 w-[220px] overflow-hidden rounded-lg border border-[#e9ecef] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  {/* Account header */}
                  <div className="border-b border-[#e9ecef] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d6efd] text-[10px] font-bold text-white">
                        {userInitials}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-[#343a40]">
                          {userName}
                        </div>

                        <div className="mt-1 text-[10px] text-[#adb5bd]">
                          {userRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account options */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountMenu(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs text-[#495057] transition hover:bg-[#f8f9fa]"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="3" />
                        <path d="M5 20c.8-3.3 3-5 7-5s6.2 1.7 7 5" />
                      </svg>
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs text-[#dc3545] transition hover:bg-[#fff5f5]"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 17l5-5-5-5" />
                        <path d="M15 12H3" />
                        <path d="M21 4v16" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell