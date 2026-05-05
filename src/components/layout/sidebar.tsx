"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  ShoppingCart,
  FlaskConical,
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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-mint-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-6 border-b border-mint-100">
        <Image
          src="/logo-horizontal.png"
          alt="MM Bolos"
          width={160}
          height={56}
          priority
          className="object-contain mix-blend-multiply"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-mint-50 text-mint-700 border border-mint-200 shadow-sm'
                  : 'text-cocoa/70 hover:bg-mint-50 hover:text-mint-600'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-mint-100">
        <p className="text-xs text-cocoa/30">v1.0.0</p>
      </div>
    </aside>
  )
}
