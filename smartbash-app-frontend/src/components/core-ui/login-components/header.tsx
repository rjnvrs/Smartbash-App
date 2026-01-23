"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-6 sm:px-12 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image src="/logo.png" alt="SMARTBASH Logo" width={48} height={48} />
          </div>
          <span className="font-semibold text-xl">SMARTBASH</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className={`${pathname === "/" ? "text-green-600 font-semibold" : "text-gray-700 hover:text-green-600"}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`${pathname === "/about" ? "text-green-600 font-semibold" : "text-gray-700 hover:text-green-600"}`}
          >
            About
          </Link>
          <Link
            href="/features"
            className={`${pathname === "/features" ? "text-green-600 font-semibold" : "text-gray-700 hover:text-green-600"}`}
          >
            Features
          </Link>
          <Link
            href="/contact"
            className={`${pathname === "/contact" ? "text-green-600 font-semibold" : "text-gray-700 hover:text-green-600"}`}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="px-5 py-2 bg-white text-black border border-gray-300 rounded-full hover:bg-green-600 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col px-6 py-6 gap-3">
            <Link href="/" className="py-3 text-gray-700 hover:text-green-600">Home</Link>
            <Link href="/about" className="py-3 text-gray-700 hover:text-green-600">About</Link>
            <Link href="/features" className="py-3 text-gray-700 hover:text-green-600">Features</Link>
            <Link href="/contact" className="py-3 text-gray-700 hover:text-green-600">Contact</Link>

            <Link href="/login" className="py-3 text-gray-700 hover:text-green-600">Login</Link>
            <Link href="/register" className="py-3 text-gray-700 hover:text-green-600">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}
