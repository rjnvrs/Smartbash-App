import Link from "next/link";
import Header from "../components/core-ui/login-components/header";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img
                src="/logo.png"
                alt="SMARTBASH Logo"
                className="w-30 h-30 md:w-20 md:h-30 object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              SMARTBASH
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing barangay management with{" "}
            <span className="font-semibold text-green-600">
              smart technology
            </span>{" "}
            and{" "}
            <span className="font-semibold text-blue-600">
              modern solutions
            </span>
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-2xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-500">Active Barangays</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-2xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-gray-500">Residents Served</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-2xl font-bold text-green-600">99%</div>
              <div className="text-sm text-gray-500">Satisfaction Rate</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Sign In to Dashboard</span>
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-green-600 bg-white border-2 border-green-600 hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Create New Account</span>
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8">
            <p className="text-gray-500 text-sm mb-4">
              Trusted by barangays across the country
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              <div className="text-gray-400 font-semibold">
                🏆 Award Winning
              </div>
              <div className="text-gray-400 font-semibold">
                🔒 Secure & Compliant
              </div>
              <div className="text-gray-400 font-semibold">
                ⚡ Fast & Reliable
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
