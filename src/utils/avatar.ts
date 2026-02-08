import { TrendingUp, Shield, Layers, Box, CircleDollarSign, Home, Database, Briefcase, type LucideIcon } from 'lucide-react'
import type { InvestmentType } from '../types/financial'

// Avatar color palette (avoiding too similar colors)
const AVATAR_COLORS = [
  { bg: '#3b82f6', text: '#ffffff' }, // blue
  { bg: '#10b981', text: '#ffffff' }, // emerald
  { bg: '#f59e0b', text: '#ffffff' }, // amber
  { bg: '#ef4444', text: '#ffffff' }, // red
  { bg: '#8b5cf6', text: '#ffffff' }, // violet
  { bg: '#ec4899', text: '#ffffff' }, // pink
  { bg: '#06b6d4', text: '#ffffff' }, // cyan
  { bg: '#84cc16', text: '#ffffff' }, // lime
  { bg: '#14b8a6', text: '#ffffff' }, // teal
  { bg: '#f97316', text: '#ffffff' }, // orange
  { bg: '#6366f1', text: '#ffffff' }, // indigo
  { bg: '#a855f7', text: '#ffffff' }, // purple
]

// Investment type icons
export const INVESTMENT_TYPE_ICONS: Record<InvestmentType, LucideIcon> = {
  stock: TrendingUp,
  bond: Shield,
  etf: Layers,
  mutual_fund: Briefcase,
  crypto: CircleDollarSign,
  commodity: Box,
  reit: Home,
  cash: Database,
}

/**
 * Generate a hash from a string for consistent color assignment
 */
function stringToHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Get avatar style (color and text) for a ticker symbol
 */
export function getAvatarStyle(symbol: string): { bg: string; text: string; initials: string } {
  const normalizedSymbol = symbol.toUpperCase().trim()
  const hash = stringToHash(normalizedSymbol)
  const colorIndex = hash % AVATAR_COLORS.length
  const color = AVATAR_COLORS[colorIndex]
  
  // Get first 1-2 letters
  let initials = normalizedSymbol.substring(0, 2)
  if (initials.length === 1) {
    initials = normalizedSymbol.substring(0, 1)
  }
  
  return {
    bg: color.bg,
    text: color.text,
    initials,
  }
}

/**
 * Generate SVG avatar data URL
 */
export function generateAvatarSVG(symbol: string): string {
  const { bg, text, initials } = getAvatarStyle(symbol)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="${bg}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            fill="${text}" font-family="system-ui, -apple-system, sans-serif" 
            font-size="${initials.length === 1 ? '18' : '14'}" font-weight="600">
        ${initials}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg.trim())}`
}