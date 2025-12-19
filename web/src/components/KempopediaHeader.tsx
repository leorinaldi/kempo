import Link from "next/link"

export function KempopediaHeader() {
  return (
    <header className="border-b border-wiki-border bg-wiki-background">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-2xl font-serif">
          <Link href="/kemponet/kempopedia" className="text-gray-900">Kempopedia</Link>
        </div>
      </div>
    </header>
  )
}
