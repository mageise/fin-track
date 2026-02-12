import { X, Trophy, Lock } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameStats } from '../../types/games'
import { ACHIEVEMENTS } from '../../utils/games/achievements'

interface AchievementsProps {
  gameStats: GameStats
  onClose: () => void
}

export function Achievements({ gameStats, onClose }: AchievementsProps) {
  const { t } = useTranslation()
  const isUnlocked = (achievementId: string) => {
    return gameStats.achievementsUnlocked.includes(achievementId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">{t('achievements_title')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-pink-100 mt-2">
            {gameStats.achievementsUnlocked.length} {t('achievements_progress')} / {ACHIEVEMENTS.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
              style={{
                width: `${(gameStats.achievementsUnlocked.length / ACHIEVEMENTS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = isUnlocked(achievement.id)
              return (
                <div
                  key={achievement.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${unlocked
                      ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300'
                      : 'bg-gray-50 border-gray-200 opacity-70'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        ${unlocked ? 'bg-pink-100' : 'bg-gray-200'}
                      `}
                    >
                      {unlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold ${
                          unlocked ? 'text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {/* @ts-expect-error - achievement keys are dynamically typed */}
                        {t(achievement.nameKey)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {/* @ts-expect-error - achievement keys are dynamically typed */}
                        {t(achievement.descriptionKey)}
                      </p>
                      {unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-pink-600 mt-2">
                          {t('achievements_progress')}: {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
