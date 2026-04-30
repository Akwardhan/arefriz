export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <span className="text-sm font-semibold tracking-tight text-gray-900">
          Arefriz
        </span>
        <nav className="flex items-center gap-6">
          <a
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
