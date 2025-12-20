import Link from "next/link"

export function KempopediaHeader() {
  return (
    <header className="border-b border-orange-700" style={{ background: "#f97316" }}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-2xl font-serif">
          <Link href="/kemponet/kempopedia" className="text-white hover:opacity-80">Kempopedia</Link>
        </div>
      </div>
    </header>
  )
}
