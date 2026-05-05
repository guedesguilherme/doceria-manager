import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { PWARegister } from '@/components/pwa-register'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#4A8C8C',
}

export const metadata: Metadata = {
  title: 'MM Bolos',
  description: 'Sistema de gestão para confeitaria',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MM Bolos',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo-selo.png" />
      </head>
      <body className="min-h-screen bg-chantilly font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
            <MobileHeader />
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
        <PWARegister />
      </body>
    </html>
  )
}
