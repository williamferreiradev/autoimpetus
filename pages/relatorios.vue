<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  BarChart3, TrendingUp, Users, Calendar, Download, 
  CheckCircle2, UserPlus, Bot, Handshake, Clock, 
  Target, DollarSign, ChevronLeft, ChevronRight,
  AlertTriangle, Lightbulb, Star, ExternalLink, ChevronDown
} from 'lucide-vue-next'

const { mainMargin } = useSidebarState()

// State
const loading = ref(true)
const selectedWeek = ref('semana-1')
const activityPage = ref(1)
const activityPerPage = 4
const weekDropdownOpen = ref(false)

// Data refs
const weeklyMetrics = ref<Record<string, any>>({})
const activityLog = ref<any[]>([])
const weeklyReports = ref<Record<string, any>>({})
const chartData = ref<Record<string, any>>({})

// Functional weeks — could grow to 50+
const weeks = [
  { key: 'semana-1', label: '24 Fev – 02 Mar', short: 'Esta Semana' },
  { key: 'semana-2', label: '17 – 23 Fev', short: 'Sem. Passada' },
  { key: 'semana-3', label: '10 – 16 Fev', short: '2 Sem. Atrás' },
  { key: 'semana-4', label: '03 – 09 Fev', short: '3 Sem. Atrás' },
]

const currentWeekLabel = computed(() => {
  const w = weeks.find(w => w.key === selectedWeek.value)
  return w ? w.label : ''
})

const currentWeekShort = computed(() => {
  const w = weeks.find(w => w.key === selectedWeek.value)
  return w ? w.short : ''
})

// Current week metrics
const currentMetrics = computed(() => weeklyMetrics.value[selectedWeek.value] || {})
const currentReport = computed(() => weeklyReports.value[selectedWeek.value] || {})

// Filtered activity log
const filteredActivities = computed(() => 
  activityLog.value.filter(a => a.week === selectedWeek.value)
)
const paginatedActivities = computed(() => {
  const start = (activityPage.value - 1) * activityPerPage
  return filteredActivities.value.slice(start, start + activityPerPage)
})
const totalActivityPages = computed(() => 
  Math.max(1, Math.ceil(filteredActivities.value.length / activityPerPage))
)

// Metric cards config
const metricCards = computed(() => [
  { title: 'Total Leads', value: currentMetrics.value.totalLeads || 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  { title: 'Qualificados', value: currentMetrics.value.qualificados || 0, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  { title: 'Agendamentos', value: currentMetrics.value.agendamentos || 0, icon: Calendar, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/10', border: 'border-primary-100 dark:border-primary-500/20' },
  { title: 'Convertidos', value: currentMetrics.value.convertidos || 0, icon: Handshake, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20' },
  { title: 'Conversão', value: (currentMetrics.value.taxaConversao || 0) + '%', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
  { title: 'Receita', value: formatCurrency(currentMetrics.value.receita || 0), icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
])

function formatCurrency(val: number) {
  if (val >= 1000) return 'R$ ' + (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k'
  return 'R$ ' + val
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'deal_closed': return Handshake
    case 'meeting_scheduled': return Calendar
    case 'lead_qualified': return CheckCircle2
    case 'ai_action': return Bot
    case 'lead_new': return UserPlus
    default: return Star
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'deal_closed': return 'text-green-500 bg-green-50 dark:bg-green-500/10'
    case 'meeting_scheduled': return 'text-primary-500 bg-primary-50 dark:bg-primary-500/10'
    case 'lead_qualified': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
    case 'ai_action': return 'text-violet-500 bg-violet-50 dark:bg-violet-500/10'
    case 'lead_new': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10'
  }
}

function getActivityLabel(type: string) {
  switch (type) {
    case 'deal_closed': return 'Fechamento'
    case 'meeting_scheduled': return 'Agendamento'
    case 'lead_qualified': return 'Qualificação'
    case 'ai_action': return 'IA'
    case 'lead_new': return 'Novo Lead'
    default: return 'Atividade'
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

// Max value for funnel chart
const funnelMax = computed(() => {
  if (!chartData.value.funnel) return 1
  return Math.max(...chartData.value.funnel.map((f: any) => f.value))
})

const selectWeek = (key: string) => {
  selectedWeek.value = key
  weekDropdownOpen.value = false
}

const fetchData = async () => {
  loading.value = true
  try {
    const { mockWeeklyMetrics, mockActivityLog, mockWeeklyReports, mockChartData } = useMockData()
    await new Promise(resolve => setTimeout(resolve, 500))
    weeklyMetrics.value = mockWeeklyMetrics
    activityLog.value = mockActivityLog
    weeklyReports.value = mockWeeklyReports
    chartData.value = mockChartData
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Reset activity page on week change
watch(selectedWeek, () => { activityPage.value = 1 })

onMounted(() => { fetchData() })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-8 transition-all duration-300']">
      <!-- Header -->
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
            <BarChart3 class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Relatórios & Performance</h1>
            <p class="text-gray-400 dark:text-dark-muted text-sm mt-0.5">Análise semanal do pipeline e automação IA</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Week Dropdown (scalable) -->
          <div class="relative">
            <button 
              @click="weekDropdownOpen = !weekDropdownOpen"
              class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-all shadow-sm min-w-[200px] justify-between"
            >
              <Calendar class="w-4 h-4 text-primary-500" />
              <span>{{ currentWeekShort }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-gray-400 transition-transform" :class="{ 'rotate-180': weekDropdownOpen }" />
            </button>
            
            <Transition name="dropdown">
              <div v-if="weekDropdownOpen" class="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-lg z-20 py-1 max-h-[300px] overflow-y-auto">
                <button
                  v-for="w in weeks"
                  :key="w.key"
                  @click="selectWeek(w.key)"
                  :class="[
                    'w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-card transition-colors',
                    selectedWeek === w.key ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  ]"
                >
                  <div>
                    <span class="text-sm block">{{ w.short }}</span>
                    <span class="text-[11px] text-gray-400 dark:text-dark-muted">{{ w.label }}</span>
                  </div>
                  <CheckCircle2 v-if="selectedWeek === w.key" class="w-4 h-4 text-primary-500" />
                </button>
              </div>
            </Transition>
          </div>

          <button class="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl shadow-sm text-xs font-semibold hover:bg-primary-600 transition-all">
            <Download class="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <template v-else>
        <!-- Week Title Banner -->
        <div class="mb-6 flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl px-5 py-3">
            <Calendar class="w-5 h-5 text-primary-500" />
            <span class="text-lg font-bold text-gray-900 dark:text-white">{{ currentReport.title || currentWeekLabel }}</span>
          </div>
          <span class="text-xs text-gray-400 dark:text-dark-muted">{{ currentMetrics.totalLeads || 0 }} leads nesta semana</span>
        </div>

        <!-- Metric Cards Grid -->
        <div class="grid grid-cols-6 gap-4 mb-6">
          <div
            v-for="card in metricCards"
            :key="card.title"
            class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 hover:shadow-card-hover transition-all group"
          >
            <div class="flex items-center justify-between mb-3">
              <div :class="['p-2 rounded-lg border', card.bg, card.border]">
                <component :is="card.icon" :class="['w-4 h-4', card.color]" />
              </div>
            </div>
            <p class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-1">{{ card.title }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
          </div>
        </div>

        <!-- Two Column Layout: Report + Charts -->
        <div class="grid grid-cols-5 gap-6 mb-6">
          <!-- Weekly Report (3 cols) -->
          <div class="col-span-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
            <!-- Report Header -->
            <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="p-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                  <BarChart3 class="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <h2 class="text-sm font-bold text-gray-900 dark:text-white">Relatório Semanal</h2>
                  <p class="text-[11px] text-gray-400 dark:text-dark-muted">{{ currentReport.title }}</p>
                </div>
              </div>
              <NuxtLink 
                :to="'/relatorio-semanal?week=' + selectedWeek"
                class="flex items-center gap-1.5 text-[11px] font-semibold text-primary-500 hover:text-primary-600 transition-colors"
              >
                Ver completo <ExternalLink class="w-3 h-3" />
              </NuxtLink>
            </div>

            <!-- Report Body -->
            <div class="p-6 space-y-5 max-h-[520px] overflow-y-auto">
              <!-- Resumo -->
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ currentReport.resumo }}</p>
              </div>

              <!-- Destaques -->
              <div v-if="currentReport.destaques?.length">
                <h3 class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Star class="w-3 h-3" /> Destaques
                </h3>
                <div class="space-y-2">
                  <div v-for="(d, i) in currentReport.destaques" :key="i" class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-card/50 p-3 rounded-lg">
                    {{ d }}
                  </div>
                </div>
              </div>

              <!-- Conselhos para o Vendedor -->
              <div v-if="currentReport.conselhos?.length">
                <h3 class="text-[11px] font-semibold text-primary-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Lightbulb class="w-3 h-3" /> Conselhos para o Vendedor
                </h3>
                <div class="space-y-2">
                  <div v-for="(c, i) in currentReport.conselhos" :key="i" class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 bg-primary-50/50 dark:bg-primary-500/5 p-3 rounded-lg border border-primary-100/50 dark:border-primary-500/10">
                    <span class="text-primary-500 font-bold text-xs mt-0.5">{{ Number(i) + 1 }}</span>
                    {{ c }}
                  </div>
                </div>
              </div>

              <!-- Alertas -->
              <div v-if="currentReport.alertas?.length">
                <h3 class="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle class="w-3 h-3" /> Alertas
                </h3>
                <div class="space-y-2">
                  <div v-for="(a, i) in currentReport.alertas" :key="i" class="text-sm text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-500/5 p-3 rounded-lg border border-amber-100/50 dark:border-amber-500/10">
                    {{ a }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts (2 cols) -->
          <div class="col-span-2 space-y-6">
            <!-- Funnel Chart -->
            <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp class="w-4 h-4 text-primary-500" /> Funil de Leads
              </h3>
              <div class="space-y-3">
                <div v-for="item in chartData.funnel" :key="item.label" class="flex items-center gap-3">
                  <span class="text-[11px] font-medium text-gray-500 dark:text-dark-muted w-20 text-right">{{ item.label }}</span>
                  <div class="flex-1 bg-gray-100 dark:bg-dark-card rounded-full h-6 overflow-hidden">
                    <div 
                      class="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      :style="{ width: (item.value / funnelMax * 100) + '%', backgroundColor: item.color }"
                    >
                      <span class="text-[10px] font-bold text-white">{{ item.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Weekly Overview (simplified) -->
            <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 class="w-4 h-4 text-primary-500" /> Resumo por Semana
              </h3>
              <div class="space-y-3">
                <div v-for="item in chartData.weeklyTrend" :key="item.week" class="flex items-center gap-3">
                  <span class="text-[11px] font-medium text-gray-500 dark:text-dark-muted w-12">{{ item.week }}</span>
                  <div class="flex-1 flex items-center gap-2">
                    <div class="flex-1 bg-gray-100 dark:bg-dark-card rounded-full h-3 overflow-hidden">
                      <div class="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all duration-500" :style="{ width: Math.max(10, Number(item.leads) * 10) + '%' }"></div>
                    </div>
                    <span class="text-[10px] font-semibold text-gray-500 w-5 text-right">{{ item.leads }}</span>
                  </div>
                  <div class="flex items-center gap-1 w-12">
                    <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span class="text-[10px] font-semibold text-emerald-500">{{ item.conversoes }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-sm bg-primary-400"></div>
                  <span class="text-[10px] text-gray-400 dark:text-dark-muted font-medium">Leads</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span class="text-[10px] text-gray-400 dark:text-dark-muted font-medium">Conversões</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Log -->
        <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="p-1.5 bg-gray-100 dark:bg-dark-card rounded-lg">
                <Clock class="w-4 h-4 text-gray-500 dark:text-dark-muted" />
              </div>
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">Registro de Atividade</h2>
            </div>
            <span class="text-[11px] text-gray-400 dark:text-dark-muted font-medium px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
              {{ filteredActivities.length }} registros
            </span>
          </div>

          <div v-if="filteredActivities.length === 0" class="p-10 text-center text-gray-400 dark:text-dark-muted text-sm">
            Nenhuma atividade registrada nesta semana.
          </div>

          <div v-else class="divide-y divide-gray-50 dark:divide-dark-border">
            <div v-for="item in paginatedActivities" :key="item.id" class="px-6 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors flex items-center gap-4">
              <div :class="['p-2 rounded-lg', getActivityColor(item.type)]">
                <component :is="getActivityIcon(item.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ item.text }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] text-gray-400 dark:text-dark-muted">{{ timeAgo(item.time) }}</span>
                  <span :class="['text-[9px] font-semibold px-1.5 py-0.5 rounded-md', getActivityColor(item.type)]">
                    {{ getActivityLabel(item.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalActivityPages > 1" class="px-6 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
            <p class="text-[11px] text-gray-400 dark:text-dark-muted">
              Página {{ activityPage }} de {{ totalActivityPages }}
            </p>
            <div class="flex gap-1.5">
              <button 
                @click="activityPage = Math.max(1, activityPage - 1)" 
                :disabled="activityPage <= 1" 
                :class="['p-1.5 rounded-lg text-xs transition-all border', activityPage <= 1 ? 'text-gray-300 dark:text-gray-600 border-transparent cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border']"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="activityPage = Math.min(totalActivityPages, activityPage + 1)" 
                :disabled="activityPage >= totalActivityPages" 
                :class="['p-1.5 rounded-lg text-xs transition-all border', activityPage >= totalActivityPages ? 'text-gray-300 dark:text-gray-600 border-transparent cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border']"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
