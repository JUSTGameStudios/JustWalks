export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>© 2024 JustWalks</span>
            <span>•</span>
            <span>Fresh walking routes by duration</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-xs">Maps by OpenStreetMap</span>
            <span className="text-xs">•</span>
            <span className="text-xs">Privacy-first design</span>
          </div>
        </div>
      </div>
    </footer>
  )
}