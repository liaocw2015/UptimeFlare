import { MaintenanceConfig, MonitorState, MonitorTarget } from '@/types/config'
import { Collapse, Button } from '@mantine/core'
import { IconCheck, IconX, IconAlertCircle, IconActivity, IconHistory } from '@tabler/icons-react'
import { useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import IncidentsDrawer from './IncidentsDrawer'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: MonitorState
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')

  let statusString = ''
  let statusColor = 'gray'
  let StatusIcon = IconAlertCircle

  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    statusColor = 'text-gray-400'
  } else if (state.overallUp === 0) {
    statusString = t('All systems not operational')
    statusColor = 'text-red-500'
    StatusIcon = IconX
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    statusColor = 'text-emerald-500'
    StatusIcon = IconCheck
  } else {
    statusString = t('Some systems not operational', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
    statusColor = 'text-yellow-500'
  }

  const [expandUpcoming, setExpandUpcoming] = useState(false)
  const [drawerOpened, setDrawerOpened] = useState(false)

  const now = new Date()

  const activeMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: MonitorTarget[]
  })[] = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: (MonitorTarget | undefined)[]
  })[] = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  return (
    <div className="py-16 text-center">
      <div className="flex flex-col sm:flex-row sm:gap-4 justify-center items-center mb-4">
        <div className="flex flex-nowrap items-center gap-2">
          <Image
            src="/logo.png"
            className="w-8 h-8 md:w-14 md:h-14 mb-1"
            alt="Logo"
            width={64}
            height={64}
          />
          <h1 className="text-2xl md:text-4xl font-black text-emerald-500 tracking-tight">
            Atos
          </h1>
        </div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight dark:text-white">
          Services Status
        </h1>
      </div>
      <div className={`flex items-center justify-center gap-2 text-xl font-medium ${statusColor}`}>
        <StatusIcon stroke={3} size={28} />
        <span>{statusString}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <IconActivity size={14} />
          <span>
            {t('Last updated on', {
              date: new Date(state.lastUpdate * 1000).toLocaleString(),
            })}
          </span>
        </div>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconHistory size={14} />}
          onClick={() => setDrawerOpened(true)}
          color="gray"
          styles={{
            section: { marginRight: 4 },
          }}
        >
          {t('Incidents')}
        </Button>
      </div>

      {/* Upcoming Maintenance */}
      {upcomingMaintenances.length > 0 && (
        <div className="max-w-3xl mx-auto mb-8">
          <div
            className="text-gray-500 mb-2 cursor-pointer hover:underline"
            onClick={() => setExpandUpcoming(!expandUpcoming)}
          >
            {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
            <span>{expandUpcoming ? t('Hide') : t('Show')}</span>
          </div>

          <Collapse in={expandUpcoming}>
            {upcomingMaintenances.map((maintenance, idx) => (
              <MaintenanceAlert
                key={`upcoming-${idx}`}
                maintenance={maintenance}
                style={{ marginTop: 10 }}
                upcoming
              />
            ))}
          </Collapse>
        </div>
      )}

      {/* Active Maintenance */}
      <div className="max-w-3xl mx-auto">
        {activeMaintenances.map((maintenance, idx) => (
          <MaintenanceAlert
            key={`active-${idx}`}
            maintenance={maintenance}
            style={{ marginTop: 10 }}
          />
        ))}
      </div>

      {/* Incidents Drawer */}
      <IncidentsDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        state={state}
        monitors={monitors}
      />
    </div>
  )
}
