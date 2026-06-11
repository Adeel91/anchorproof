export function RecentVerifications() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-white font-semibold">Recent Verifications</h2>
      </div>
      <div className="p-6 text-center py-12">
        <p className="text-gray-500 text-sm mb-2">No verifications yet</p>
        <p className="text-gray-600 text-xs">
          Anchored conversations will appear here
        </p>
      </div>
    </div>
  );
}
