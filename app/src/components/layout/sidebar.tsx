'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Network,
  MessageSquare,
  FileText,
  TrendingUp,
  CheckSquare,
  Users,
  Calendar,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'
import { useFeatureAvailability } from '@/hooks/useFeatures'
import { SidebarItem } from '@/types'

function useSidebarItems(): SidebarItem[] {
  const nexusAvailable = useFeatureAvailability('nexus').enabled
  const pulseAvailable = useFeatureAvailability('pulse').enabled

  const baseItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      href: '/dashboard',
    },
    {
      id: 'company',
      label: 'Company',
      icon: 'Building2',
      href: '/company',
      children: [
        { id: 'company-profile', label: 'Profile', icon: 'Building2', href: '/company/profile' },
        { id: 'company-incorporation', label: 'Incorporation', icon: 'Building2', href: '/company/incorporation' },
        { id: 'company-settings', label: 'Settings', icon: 'Settings', href: '/company/settings' },
      ],
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: 'TrendingUp',
      href: '/financial',
      children: [
        { id: 'financial-overview', label: 'Overview', icon: 'TrendingUp', href: '/financial/overview' },
        { id: 'financial-projections', label: 'Projections', icon: 'TrendingUp', href: '/financial/projections' },
        { id: 'financial-transactions', label: 'Transactions', icon: 'TrendingUp', href: '/financial/transactions' },
      ],
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'FileText',
      href: '/documents',
    },
    {
      id: 'knowledge-graph',
      label: 'Knowledge Graph',
      icon: 'Network',
      href: '/knowledge-graph',
    },
    {
      id: 'api-docs',
      label: 'API Documentation',
      icon: 'Code',
      href: '/api-docs',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: 'CheckSquare',
      href: '/compliance',
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: 'Users',
      href: '/crm',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'Calendar',
      href: '/calendar',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: 'CreditCard',
      href: '/billing',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'CheckSquare',
      href: '/tasks',
    },
  ]

  // Conditionally add Nexus
  if (nexusAvailable) {
    baseItems.splice(4, 0, {
      id: 'nexus',
      label: 'The Nexus',
      icon: 'Network',
      href: '/nexus',
      children: [
        { id: 'nexus-network', label: 'Network', icon: 'Network', href: '/nexus/network' },
        { id: 'nexus-funding', label: 'Funding', icon: 'Network', href: '/nexus/funding' },
        { id: 'nexus-introductions', label: 'Introductions', icon: 'Network', href: '/nexus/introductions' },
      ],
    })
  }

  // Conditionally add Pulse
  if (pulseAvailable) {
    const pulseIndex = nexusAvailable ? 5 : 4
    baseItems.splice(pulseIndex, 0, {
      id: 'pulse',
      label: 'Pulse',
      icon: 'MessageSquare',
      href: '/pulse',
    })
  }

  return baseItems
}

const iconMap = {
  LayoutDashboard,
  Building2,
  Network,
  MessageSquare,
  FileText,
  TrendingUp,
  CheckSquare,
  Users,
  Calendar,
  CreditCard,
  Settings,
}

interface SidebarItemComponentProps {
  item: SidebarItem
  expandedItems: Set<string>
  onToggle: (id: string) => void
}

function SidebarItemComponent({ item, expandedItems, onToggle }: SidebarItemComponentProps) {
  const pathname = usePathname()
  const isActive = pathname && (pathname === item.href || pathname.startsWith(item.href + '/'))
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.has(item.id)

  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground'
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault()
            onToggle(item.id)
          }
        }}
      >
        <IconComponent className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        {hasChildren && (
          isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        )}
      </Link>

      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              expandedItems={expandedItems}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const sidebarItems = useSidebarItems()
  const nexusAvailable = useFeatureAvailability('nexus').enabled
  const pulseAvailable = useFeatureAvailability('pulse').enabled

  const defaultExpanded = new Set(['company', 'financial'])
  if (nexusAvailable) defaultExpanded.add('nexus')
  if (pulseAvailable) defaultExpanded.add('pulse')

  const [expandedItems, setExpandedItems] = useState<Set<string>>(defaultExpanded)

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out',
        !sidebarOpen && '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Network className="h-6 w-6" />
          <span>Genesis Engine</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              expandedItems={expandedItems}
              onToggle={toggleExpanded}
            />
          ))}
        </div>
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@genesis.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}