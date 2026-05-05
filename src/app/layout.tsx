import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { PWARegister } from '@/components/pwa-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MM Bolos',
  description: 'Sistema de gestão para confeitaria',
  manifest: '/manifest.json',
  themeColor: '#60a5fa',
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
    <html lang="pt-BR" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-blue-50/30">
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
