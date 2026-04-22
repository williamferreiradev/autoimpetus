<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeft, BarChart3, Star, Lightbulb, AlertTriangle, 
  Users, Target, Calendar, Handshake, TrendingUp, DollarSign, Clock
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { mainMargin } = useSidebarState()

const loading = ref(true)
const weekKey = ref((route.query.week as string) || 'semana-1')
const weeklyMetrics = ref<Record<string, any>>({})
const weeklyReports = ref<Record<string, any>>({})

const currentMetrics = computed(() => weeklyMetrics.value[weekKey.value] || {})
const currentReport = computed(() => weeklyReports.value[weekKey.value] || {})

const metricCards = computed(() => [
  { title: 'Total Leads', value: currentMetrics.value.totalLeads || 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { title: 'Qualificados', value: currentMetrics.value.qualificados || 0, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { title: 'Agendamentos', value: currentMetrics.value.agendamentos || 0, icon: Calendar, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/10' },
  { title: 'Convertidos', value: currentMetrics.value.convertidos || 0, icon: Handshake, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { title: 'Conversão', value: (currentMetrics.value.taxaConversao || 0) + '%', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { title: 'Receita', value: formatCurrency(currentMetrics.value.receita || 0), icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  { title: 'Tempo Resposta', value: currentMetrics.value.tempoMedioResposta || '-', icon: Clock, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
  { title: 'Novos Contatos', value: currentMetrics.value.novosContatos || 0, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
])

function formatCurrency(val: number) {
  if (val >= 1000) return 'R$ ' + (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k'
  return 'R$ ' + val
}

const fetchData = async () => {
  loading.value = true
  const { mockWeeklyMetrics, mockWeeklyReports } = useMockData()
  await new Promise(resolve => setTimeout(resolve, 300))
  weeklyMetrics.value = mockWeeklyMetrics
  weeklyReports.value = mockWeeklyReports
  loading.value = false
}

onMounted(() => fetchData())
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />
    <main :class="[mainMargin, 'p-8 transition-all duration-300 max-w-5xl']">
      
      <!-- Back + Title -->
      <header class="mb-8">
        <button @click="router.push('/relatorios')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4">
          <ArrowLeft class="w-4 h-4" /> Voltar para Relatórios
        </button>
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
            <BarChart3 class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Relatório Semanal</h1>
            <p class="text-base text-gray-500 dark:text-dark-muted mt-0.5">{{ currentReport.title || weekKey }}</p>
          </div>
        </div>
      </header>

      <div v-if="loading" class="flex items-center justify-center h-40">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <template v-else>
        <!-- Metrics Grid -->
        <div class="grid grid-cols-4 gap-4 mb-8">
          <div v-for="card in metricCards" :key="card.title" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <div :class="['p-1.5 rounded-lg', card.bg]">
                <component :is="card.icon" :class="['w-3.5 h-3.5', card.color]" />
              </div>
              <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">{{ card.title }}</span>
            </div>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
          </div>
        </div>

        <!-- Resumo Executivo -->
        <section class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">Resumo Executivo</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ currentReport.resumo }}</p>
        </section>

        <!-- Destaques -->
        <section v-if="currentReport.destaques?.length" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-6 mb-6">
          <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star class="w-5 h-5 text-amber-500" /> Destaques da Semana
          </h2>
          <div class="space-y-3">
            <div v-for="(d, i) in currentReport.destaques" :key="i" class="bg-gray-50 dark:bg-dark-card/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              {{ d }}
            </div>
          </div>
        </section>

        <!-- Conselhos -->
        <section v-if="currentReport.conselhos?.length" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-6 mb-6">
          <h2 class="text-base font-bold text-primary-600 dark:text-primary-400 mb-4 flex items-center gap-2">
            <Lightbulb class="w-5 h-5" /> Conselhos para o Vendedor
          </h2>
          <div class="space-y-3">
            <div v-for="(c, i) in currentReport.conselhos" :key="i" class="flex items-start gap-4 bg-primary-50/50 dark:bg-primary-500/5 p-4 rounded-xl border border-primary-100/50 dark:border-primary-500/10">
              <span class="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{{ Number(i) + 1 }}</span>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{{ c }}</p>
            </div>
          </div>
        </section>

        <!-- Alertas -->
        <section v-if="currentReport.alertas?.length" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-6 mb-6">
          <h2 class="text-base font-bold text-amber-500 mb-4 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5" /> Alertas e Atenção
          </h2>
          <div class="space-y-3">
            <div v-for="(a, i) in currentReport.alertas" :key="i" class="bg-amber-50/50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-100/50 dark:border-amber-500/10 text-sm text-amber-700 dark:text-amber-300">
              {{ a }}
            </div>
          </div>
        </section>

        <!-- Base info -->
        <div class="text-center text-[11px] text-gray-400 dark:text-dark-muted py-4">
          Relatório gerado com base em {{ currentMetrics.totalLeads || 0 }} leads · Data Impetus CRM
        </div>
      </template>
    </main>
  </div>
</template>
