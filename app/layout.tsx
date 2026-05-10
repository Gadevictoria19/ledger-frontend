import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'General Ledger Engine',
  description: 'Autonomous multi-agent bank reconciliation with Chain-of-Verification and penny-exact double-entry validation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
