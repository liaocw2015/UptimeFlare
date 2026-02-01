import { IconAlertTriangle, IconCalendar, IconClock, IconInfoCircle } from '@tabler/icons-react'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { useTranslation } from 'react-i18next'

export default function MaintenanceAlert({
  maintenance,
  style,
  upcoming = false,
}: {
  maintenance: Omit<MaintenanceConfig, 'monitors'> & { monitors?: (MonitorTarget | undefined)[] }
  style?: React.CSSProperties
  upcoming?: boolean
}) {
  const { t } = useTranslation('common')

  // Use original color config system
  const color = upcoming ? 'blue' : maintenance.color || 'yellow'

  // Color scheme mapping
  const colorMap: Record<
    string,
    {
      bg: string
      border: string
      icon: string
      text: string
      badge: string
    }
  > = {
    yellow: {
      bg: 'bg-amber-50',
      border: 'border-l-amber-500',
      icon: 'text-amber-500',
      text: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-l-blue-500',
      icon: 'text-blue-500',
      text: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-500',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-l-red-500',
      icon: 'text-red-500',
      text: 'text-red-500',
      badge: 'bg-red-100 text-red-500',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-l-gray-500',
      icon: 'text-gray-500',
      text: 'text-gray-500',
      badge: 'bg-gray-100 text-gray-500',
    },
  }

  const scheme = {
    ...(colorMap[color] || colorMap.yellow),
    Icon: IconAlertTriangle,
  }

  return (
    <div
      className={`
        ${scheme.bg} ${scheme.border}
        border-l-4 rounded-lg shadow-sm
        shadow-slate-200 border border-slate-200
        px-4 py-3 my-4 mx-auto
      `}
      style={style}
    >
      <div className="flex items-center justify-start gap-4 flex-wrap">
        {/* Left: Icon + Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
          {/* Icon */}
          <scheme.Icon className={`${scheme.icon} shrink-0`} size={20} strokeWidth={2} />

          {/* Title */}
          <span className={`${scheme.text} font-semibold text-sm shrink-0`}>
            {(upcoming ? t('Upcoming') + ' ' : '') +
              (maintenance.title || t('Scheduled Maintenance'))}
          </span>

          {/* Time Range */}
          <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <IconCalendar size={14} className={scheme.icon} />
              <span>
                {new Date(maintenance.start).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {maintenance.end && (
              <>
                <span className="text-gray-400">-</span>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <IconClock size={14} className={scheme.icon} />
                  <span>
                    {new Date(maintenance.end).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <span className="text-xs text-gray-600 truncate flex-1 min-w-[200px]">
            {maintenance.body}
          </span>

          {/* Affected Components */}
          {maintenance.monitors && maintenance.monitors.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {maintenance.monitors.map((comp, idx) => (
                <span
                  key={idx}
                  className={`
                    ${scheme.badge}
                    px-2 py-0.5 rounded text-xs font-medium
                    inline-flex items-center gap-1
                  `}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {comp?.name ?? t('MONITOR ID NOT FOUND')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
