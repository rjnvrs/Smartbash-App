"use client"

export default function Pagination() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span className="font-semibold">1</span> of <span className="font-semibold">12</span> reports
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
          Previous
        </button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
          3
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
}