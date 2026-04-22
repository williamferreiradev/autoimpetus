<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { 
  CalendarDays, ChevronLeft, ChevronRight, Clock, User
} from 'lucide-vue-next'

const { mainMargin } = useSidebarState()

// Brokers (Corretores)
// Appointment Statuses
const statuses = [
  { id: 'agendado', label: 'Agendado', color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
  { id: 'concluido', label: 'Concluído', color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' },
  { id: 'cancelado', label: 'Cancelado', color: 'bg-red-500', light: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20' },
  { id: 'falta', label: 'Faltou', color: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/20' },
]

// State
const currentDate = ref(new Date())
const viewMode = ref<'week' | 'day'>('week')

// Modal State
const isModalOpen = ref(false)
const selectedAppointment = ref<any>(null)
const updatingStatus = ref(false)

// Current week days
const weekDays = computed(() => {
  const d = new Date(currentDate.value)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push(date)
  }
  return days
})

const weekLabel = computed(() => {
  const first = weekDays.value[0]
  const last = weekDays.value[6]
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  if (first!.getMonth() === last!.getMonth()) {
    return `${first!.getDate()} – ${last!.getDate()} ${months[first!.getMonth()]} ${first!.getFullYear()}`
  }
  return `${first!.getDate()} ${months[first!.getMonth()]} – ${last!.getDate()} ${months[last!.getMonth()]} ${last!.getFullYear()}`
})

const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

// Navigate
const prevWeek = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 7)
  currentDate.value = d
}
const nextWeek = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 7)
  currentDate.value = d
}
const goToday = () => {
  currentDate.value = new Date()
}

// Check if date is today
const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

const supabase = useSupabaseClient()
const dbAppointments = ref<any[]>([])

const fetchAppointments = async () => {
  try {
    const { data: aps, error } = await supabase.from('appointments').select(`
      *,
      leads(name),
      procedures(name)
    `)
    if (error) throw error
    dbAppointments.value = aps || []
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

let realtimeChannel: any

const setupRealtime = () => {
  realtimeChannel = supabase.channel('agenda_appointments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      () => {
        fetchAppointments()
      }
    )
    .subscribe()
}

onMounted(() => {
  fetchAppointments()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

// Get appointments for a specific day/hour
const getAppointments = (dayDate: Date, hour: string) => {
  const year = dayDate.getFullYear()
  const month = String(dayDate.getMonth() + 1).padStart(2, '0')
  const dateStr = String(dayDate.getDate()).padStart(2, '0')
  const localDateStr = `${year}-${month}-${dateStr}`

  return dbAppointments.value.filter(a => {
    if (a.appointment_date !== localDateStr) return false
    const aptHour = a.start_time ? a.start_time.substring(0, 5) : ''
    if (aptHour !== hour) return false
    return true
  }).map(a => {
    let duration = 1
    if (a.start_time && a.end_time) {
      const start = new Date(`1970-01-01T${a.start_time}`)
      const end = new Date(`1970-01-01T${a.end_time}`)
      duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }
    
    return {
      id: a.id,
      patient: a.leads?.name || 'Interessado Desconhecido',
      procedure: a.procedures?.name || a.about || 'Contato ou Consulta',
      hour: a.start_time ? a.start_time.substring(0, 5) : hour,
      duration: Math.max(1, duration),
      status: a.status || 'agendado'
    }
  })
}

// Get status info
const getStatusTheme = (statusStr: string) => statuses.find(s => s.id === statusStr) || statuses[0]

// Modal Actions
const openAppointmentModal = (apt: any) => {
  // Pass a cloned object to model so it doesn't mutably break UI until confirmed via DB 
  selectedAppointment.value = { ...apt }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => { selectedAppointment.value = null }, 300)
}

const updateAppointmentMode = async () => {
  if (!selectedAppointment.value) return
  updatingStatus.value = true
  try {
    const { error } = await supabase.from('appointments').update({ status: selectedAppointment.value.status }).eq('id', selectedAppointment.value.id)
    if (error) throw error
    // Automatically picked up by setupRealtime -> fetchAppointments!
    closeModal()
  } catch (e) {
    console.error('Error updating status', e)
  } finally {
    updatingStatus.value = false
  }
}

// Stats
const todayCount = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const dateStr = String(today.getDate()).padStart(2, '0')
  const localDateStr = `${year}-${month}-${dateStr}`

  return dbAppointments.value.filter(a => a.appointment_date === localDateStr).length
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-8 transition-all duration-300']">
      <!-- Header -->
      <header class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
            <CalendarDays class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Agenda</h1>
            <p class="text-gray-400 dark:text-dark-muted text-sm mt-0.5">{{ todayCount }} agendamentos hoje</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Status Legend -->
          <div class="flex items-center gap-3 mr-4">
            <div v-for="st in statuses" :key="st.id" class="flex items-center gap-1.5">
              <div :class="['w-2.5 h-2.5 rounded-full', st.color]"></div>
              <span class="text-[11px] font-medium text-gray-500 dark:text-dark-muted">{{ st.label }}</span>
            </div>
          </div>

          <!-- Navigation -->
          <button @click="goToday" class="px-3 py-1.5 text-xs font-semibold text-primary-500 bg-primary-50 dark:bg-primary-500/10 rounded-lg border border-primary-200 dark:border-primary-500/20 hover:bg-primary-100 transition-colors">
            Hoje
          </button>
          <div class="flex items-center gap-1">
            <button @click="prevWeek" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[200px] text-center">{{ weekLabel }}</span>
            <button @click="nextWeek" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <!-- Calendar Grid -->
      <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
        <!-- Day Headers -->
        <div class="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 dark:border-dark-border">
          <div class="p-2"></div>
          <div 
            v-for="(day, idx) in weekDays" 
            :key="idx"
            :class="[
              'py-3 px-2 text-center border-l border-gray-100 dark:border-dark-border',
              isToday(day) ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''
            ]"
          >
            <span class="text-[10px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{{ dayLabels[idx] }}</span>
            <p :class="[
              'text-lg font-bold mt-0.5',
              isToday(day) ? 'text-primary-500' : 'text-gray-900 dark:text-white'
            ]">
              {{ day.getDate() }}
            </p>
          </div>
        </div>

        <!-- Time Slots -->
        <div class="max-h-[calc(100vh-260px)] overflow-y-auto">
          <div v-for="hour in hours" :key="hour" class="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-50 dark:border-dark-border/50 min-h-[70px]">
            <!-- Hour Label -->
            <div class="p-2 text-[11px] font-medium text-gray-400 dark:text-dark-muted text-right pr-3 pt-1">
              {{ hour }}
            </div>

            <!-- Day Cells -->
            <div 
              v-for="(day, dayIdx) in weekDays" 
              :key="dayIdx"
              :class="[
                'border-l border-gray-50 dark:border-dark-border/50 p-0.5 relative min-w-0',
                isToday(day) ? 'bg-primary-50/20 dark:bg-primary-500/[0.02]' : ''
              ]"
            >
              <!-- Appointments -->
              <div 
                v-for="apt in getAppointments(day, hour)" 
                :key="apt.id + apt.hour"
                @click="openAppointmentModal(apt)"
                :class="[
                  'rounded-lg p-2 border text-[11px] leading-tight cursor-pointer shadow-sm transition-all overflow-hidden flex flex-col hover:ring-2 hover:ring-primary-500/30 hover:shadow-md hover:-translate-y-0.5',
                  getStatusTheme(apt.status).light
                ]"
                :style="{ minHeight: (apt.duration * 66 - 4) + 'px' }"
              >
                <div class="flex items-center gap-1.5 mb-0.5 min-w-0">
                  <div :class="['w-2 h-2 rounded-full flex-shrink-0 animate-pulse', getStatusTheme(apt.status).color]"></div>
                  <span class="font-bold truncate">{{ apt.patient }}</span>
                </div>
                <p class="text-[10px] opacity-75 truncate w-full">{{ apt.procedure }}</p>
                <div class="flex items-center gap-1 mt-auto opacity-60">
                  <Clock class="w-2.5 h-2.5" />
                  <span class="text-[9px]">{{ apt.hour }} · {{ apt.duration }}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Appointment Modal -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-sm bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-border transform transition-all scale-100">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-card">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Detalhes do Agendamento</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <span class="sr-only">Fechar</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div class="p-5 flex flex-col gap-4" v-if="selectedAppointment">
            <!-- Patient / Lead -->
            <div>
              <label class="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Paciente / Lead</label>
              <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedAppointment.patient }}</div>
            </div>
            
            <!-- Procedure -->
            <div>
              <label class="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Procedimento</label>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ selectedAppointment.procedure }}</div>
            </div>
            
            <!-- Info Row -->
            <div class="flex items-center gap-6 bg-gray-50 dark:bg-dark-bg p-3 rounded-xl border border-gray-100 dark:border-dark-border">
              <div class="flex-1">
                <label class="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1 flex items-center gap-1">
                   <Clock class="w-3 h-3" /> Horário
                </label>
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedAppointment.hour }}</div>
              </div>
              <div class="flex-1">
                <label class="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Duração</label>
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedAppointment.duration }} hr(s)</div>
              </div>
            </div>
            
            <!-- Status Updater -->
            <div class="pt-1">
              <label class="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">Status do Agendamento</label>
              <div class="relative">
                <select 
                  v-model="selectedAppointment.status"
                  @change="updateAppointmentMode"
                  :disabled="updatingStatus"
                  class="w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none disabled:opacity-50 transition-colors shadow-sm"
                  :class="[
                     getStatusTheme(selectedAppointment.status).color.replace('bg-', 'text-').replace('500', '600'),
                     'dark:' + getStatusTheme(selectedAppointment.status).color.replace('bg-', 'text-').replace('500', '400')
                  ]"
                >
                  <option v-for="st in statuses" :key="st.id" :value="st.id">{{ st.label }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <div v-if="updatingStatus" class="animate-spin w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <svg v-else class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
