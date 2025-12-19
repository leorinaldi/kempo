import { Suspense } from "react"
import { KempoNetBridge } from "@/components/KempoNetBridge"

export default function KempleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <KempoNetBridge />
      </Suspense>
      {children}
    </>
  )
}
