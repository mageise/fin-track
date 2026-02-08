import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ToolTileProps {
  icon: ReactNode
  name: string
  path: string
  color?: string
  isPlaceholder?: boolean
}

export function ToolTile({ icon, name, path, color = 'blue', isPlaceholder = false }: ToolTileProps) {
  const navigate = useNavigate()

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red: 'bg-red-500 hover:bg-red-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    violet: 'bg-violet-500 hover:bg-violet-600',
    slate: 'bg-slate-500 hover:bg-slate-600',
    zinc: 'bg-zinc-500 hover:bg-zinc-600',
    stone: 'bg-stone-500 hover:bg-stone-600',
    rose: 'bg-rose-500 hover:bg-rose-600',
  }

  const bgClass = colorClasses[color] || colorClasses.blue

  return (
    <button
      onClick={() => !isPlaceholder && navigate(path)}
      disabled={isPlaceholder}
      className={`
        relative aspect-square w-full rounded-xl shadow-lg 
        transition-all duration-300 ease-out
        flex items-center justify-center
        overflow-hidden group
        ${isPlaceholder 
          ? 'bg-gray-300 cursor-not-allowed opacity-60' 
          : `${bgClass} cursor-pointer transform hover:scale-105 hover:shadow-2xl`
        }
      `}
    >
      {/* Icon Container */}
      <div className={`
        transition-all duration-300 ease-out
        ${isPlaceholder ? 'opacity-40' : 'group-hover:scale-90 group-hover:opacity-30'}
      `}>
        {icon}
      </div>

      {/* Tool Name - Shows on Hover */}
      <div className={`
        absolute inset-0 flex items-center justify-center
        transition-all duration-300 ease-out
        ${isPlaceholder 
          ? 'opacity-0' 
          : 'opacity-0 group-hover:opacity-100'
        }
      `}>
        <span className="text-white font-bold text-lg text-center px-2 drop-shadow-lg">
          {name}
        </span>
      </div>

      {/* Coming Soon Badge for Placeholders */}
      {isPlaceholder && (
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-xs font-semibold text-gray-500 bg-white/80 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
    </button>
  )
}
