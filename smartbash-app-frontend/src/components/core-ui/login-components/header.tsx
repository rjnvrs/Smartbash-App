// components/Header.js - Updated version
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo with Image */}
          <Link href="/" className="flex items-center gap-3">
            {/* Option 1: If you have a logo image in public folder */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="SMARTBASH Logo"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className={`${
                pathname === "/"
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600"
              } font-medium transition ml-20`}
            >
              Home
            </Link>

            <span className="text-gray-300">•</span>
            <Link
              href="/about"
              className={`${
                pathname === "/about"
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600"
              } font-medium transition`}
            >
              About
            </Link>

            <span className="text-gray-300">•</span>

            <Link
              href="/features"
              className={`${
                pathname === "/features"
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600"
              } font-medium transition`}
            >
              Features
            </Link>

            <span className="text-gray-300">•</span>

            <Link
              href="/contact"
              className={`${
                pathname === "/contact"
                  ? "text-green-600 font-semibold"
                  : "text-gray-700 hover:text-green-600"
              } font-medium transition`}
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-white text-black border border-gray-300 rounded-full hover:bg-green-600 hover:text-white transition flex items-center gap-2 font-medium"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition flex items-center gap-2 font-medium radius-2lg"
          >
            Register
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
