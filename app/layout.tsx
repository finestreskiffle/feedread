import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My RSS Reader',
  description: 'Personal RSS feed reader',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {children}
      </body>
    </html>
  )
}
