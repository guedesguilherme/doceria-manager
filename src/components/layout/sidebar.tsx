"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  ShoppingCart,
  FlaskConical,
  DollarSign,
  TrendingUp,
  Wheat,
  Cake,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Agenda', icon: CalendarDays },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/receitas', label: 'Receitas', icon: Cake },
  { href: '/ingredientes', label: 'Ingredientes', icon: Wheat },
  { href: '/custos', label: 'Custos Indiretos', icon: FlaskConical },
  { href: '/precificacao', label: 'Precificação', icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-blue-100 shadow-sm">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-blue-100">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Cake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">MM Bolos</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-blue-100">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  )
}
