"use client";

import Link from "next/link";

export default function ServicesMapPlaceholderPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold mb-3">Services Map</h1>
        <p className="text-gray-600 mb-6">
          The Services map UI is still in progress. Routing is already set:
          SMS link to Login, then Login to Services Map.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}
