"use client"

import { SessionProvider } from "next-auth/react"
import { KYDateProvider } from "@/context/KYDateContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <KYDateProvider>
        {children}
      </KYDateProvider>
    </SessionProvider>
  )
}
