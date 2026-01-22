'use client'

import Link from "next/link"
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"
import { usePathname, useRouter } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/") // redirect on logout
  }

  const tabClass = (active: boolean) =>
    `pb-2 font-medium ${
      active
        ? "border-b-2 border-green-600 text-green-700"
        : "text-gray-600 hover:text-black transition"
    }`

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-3">

        {/* ROW 1 — Avatar + email (left), Logout (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-3xl text-gray-700" />
            <span className="text-sm text-gray-700">
              mikaylgoan@gmail.com
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {/* ROW 2 — Navigation Tabs */}
        <nav className="flex gap-10 mt-6">

          {/* Report Incidents */}
          <Link
            href="/dashboards/residents"
            className={tabClass(
              pathname === "/dashboards/residents"
            )}
          >
            Report Incidents
          </Link>

          {/* Reports */}
          <Link
            href="/dashboards/residents/reports"
            className={tabClass(
              pathname.startsWith("/dashboards/residents/reports")
            )}
          >
            Reports
          </Link>

          {/* News Feed */}
          <Link
            href="/dashboards/residents/news-feed"
            className={tabClass(
              pathname.startsWith("/dashboards/residents/news-feed")
            )}
          >
            News Feed
          </Link>

        </nav>
      </div>
    </header>
  )
}
