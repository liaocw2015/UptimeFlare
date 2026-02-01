import { Drawer, Group, Select, Button, Stack, Card, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight, IconCalendar, IconFilter } from '@tabler/icons-react'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { maintenances, workerConfig } from '@/uptime.config'
import { useState, useEffect } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import NoIncidentsAlert from './NoIncidents'
import { useTranslation } from 'react-i18next'

function getSelectedMonth() {
  const now = new Date()
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

function filterIncidentsByMonth(
  incidents: MaintenanceConfig[],
  monthStr: string
): (Omit<MaintenanceConfig, 'monitors'> & { monitors: MonitorTarget[] })[] {
  return incidents
    .filter((incident) => {
      const d = new Date(incident.start)
      const incidentMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      return incidentMonth === monthStr
    })
    .map((e) => ({
      ...e,
      monitors: (e.monitors || []).map((e) => workerConfig.monitors.find((mon) => mon.id === e)!),
    }))
    .sort((a, b) => (new Date(a.start) > new Date(b.start) ? -1 : 1))
}

function getPrevNextMonth(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1)
  const prev = new Date(date)
  prev.setMonth(prev.getMonth() - 1)
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return {
    prev: prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0'),
    next: next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0'),
  }
}

export default function IncidentsDrawer({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('common')
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>('')
  const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth())

  const filteredIncidents = filterIncidentsByMonth(maintenances, selectedMonth)
  const monitorFilteredIncidents = selectedMonitor
    ? filteredIncidents.filter((i) => i.monitors.find((e) => e.id === selectedMonitor))
    : filteredIncidents

  const { prev, next } = getPrevNextMonth(selectedMonth)

  const monitorOptions = [
    { value: '', label: t('All') },
    ...workerConfig.monitors.map((monitor) => ({
      value: monitor.id,
      label: monitor.name,
    })),
  ]

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      title={
        <Text size="xl" fw={800}>
          {t('Incidents')}
        </Text>
      }
      padding="xl"
    >
      <Stack gap="lg">
        <Select
          placeholder={t('Select monitor')}
          data={monitorOptions}
          value={selectedMonitor}
          onChange={setSelectedMonitor}
          clearable
          leftSection={<IconFilter size={16} />}
          radius="md"
        />

        <Card padding="lg" radius="lg" withBorder>
          <Group justify="space-between" mb="xl">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={18} />}
              onClick={() => setSelectedMonth(prev)}
              color="gray"
            >
              {t('Backwards')}
            </Button>

            <Group gap="xs">
              <IconCalendar size={20} style={{ opacity: 0.5 }} />
              <Text fw={700} size="xl">
                {selectedMonth}
              </Text>
            </Group>

            <Button
              variant="subtle"
              rightSection={<IconChevronRight size={18} />}
              onClick={() => setSelectedMonth(next)}
              color="gray"
            >
              {t('Forward')}
            </Button>
          </Group>

          <Stack gap="md">
            {monitorFilteredIncidents.length === 0 ? (
              <NoIncidentsAlert />
            ) : (
              monitorFilteredIncidents.map((incident, i) => (
                <MaintenanceAlert key={i} maintenance={incident} />
              ))
            )}
          </Stack>
        </Card>
      </Stack>
    </Drawer>
  )
}
