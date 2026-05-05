"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, CalendarDays, ShoppingCart, FlaskConical, TrendingUp, Wheat, Cake } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Agenda', icon: CalendarDays },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/receitas', label: 'Receitas', icon: Cake },
  { href: '/ingredientes', label: 'Ingredientes', icon: Wheat },
  { href: '/custos', label: 'Custos Indiretos', icon: FlaskConical },
  { href: '/precificacao', label: 'Precificação', icon: TrendingUp },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const currentPage = navItems.find(item =>
    item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href))
  )

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-mint-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-selo.png"
            alt="MM Bolos"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-semibold text-cocoa text-sm">
            {currentPage?.label ?? 'MM Bolos'}
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg text-cocoa/60 hover:bg-mint-50 hover:text-mint-600 transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-mint-100 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-mint-50 text-mint-700'
                        : 'text-cocoa/70 hover:bg-mint-50 hover:text-mint-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
