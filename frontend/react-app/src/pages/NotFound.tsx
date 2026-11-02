import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f2f5] px-6 text-center">
      <h1 className="text-[48px] font-bold text-[#212529]">
        404
      </h1>

      <h2 className="mt-2 text-[18px] font-bold text-[#212529]">
        Page Not Found
      </h2>

      <p className="mt-2 text-[13px] text-[#495057]">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/dashboard"
        className="mt-5 rounded-[6px] bg-[#0d6efd] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#0b5ed7]"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

export default NotFound