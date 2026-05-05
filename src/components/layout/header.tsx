"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, CakeSlice, CalendarDays, ShoppingCart, FlaskConical, TrendingUp, Wheat } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Agenda', icon: CalendarDays },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/receitas', label: 'Receitas', icon: CakeSlice },
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
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-pink-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-pink-600 rounded-md flex items-center justify-center">
            <CakeSlice className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            {currentPage?.label ?? 'Doceria Manager'}
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md text-gray-600 hover:bg-pink-50 hover:text-pink-700 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-pink-100 shadow-lg"
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-pink-50 text-pink-700'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-700'
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
