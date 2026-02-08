import { useState } from 'react'
import { ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle: string
  icon: LucideIcon
  iconColor?: string
  initiallyExpanded?: boolean
  rightContent?: React.ReactNode
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-purple-600',
  initiallyExpanded = false,
  rightContent,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${iconColor}`} />
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 p-0 m-0 text-left leading-tight">
              {title}
            </h2>
            <p className="text-sm text-gray-600 p-0 m-0 text-left leading-tight">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {rightContent}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  )
}
