<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  Filter, 
  Eye, 
  EyeOff,
  Lock, 
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Users
} from 'lucide-vue-next'
import LeadDetailsModal from '@/components/leads/LeadDetailsModal.vue'
import type { Cliente } from '@/types/crm'

definePageMeta({
  // middleware: 'auth'
})

const { mainMargin } = useSidebarState()
const supabase = useSupabaseClient()

interface Lead {
  id: string
  name: string
  avatar: string
  phone: string
  interested: boolean
  product: string
  status: 'active' | 'locked'
  media_url?: string
}

// Reactive State
const leads = ref<Lead[]>([])
const metrics = reactive({
  total: 0,
  interested: 0,
  newLeads: 0,
  locked: 0
})
const loading = ref(true)
const showModal = ref(false)
const selectedLead = ref<Cliente | null>(null)
const fullLeadsData = ref<any[]>([])
const phoneBlurred = ref(true)

const maskPhone = (phone: string) => {
  if (!phone) return ''
  if (phoneBlurred.value) {
    return phone.slice(0, 4) + '•••••' + phone.slice(-2)
  }
  return phone
}

// Filter State
const showFilters = ref(false)
const filterStatus = ref<'all' | 'active' | 'locked'>('all')
const filterInterest = ref<'all' | 'yes' | 'no'>('all')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterProduct = ref<'all' | string>('all')

// Pagination State
const currentPage = ref(1)
const itemsPerPage = 5

// Computed filtered leads
const filteredLeads = computed(() => {
  let result = [...leads.value]
  
  if (filterStatus.value !== 'all') {
    result = result.filter(l => l.status === filterStatus.value)
  }
  
  if (filterInterest.value !== 'all') {
    result = result.filter(l => filterInterest.value === 'yes' ? l.interested : !l.interested)
  }
  
  return result
})

// Computed pagination
const totalPages = computed(() => Math.max(1, Math.ceil(filteredLeads.value.length / itemsPerPage)))
const paginatedLeads = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLeads.value.slice(start, start + itemsPerPage)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset to page 1 when filters change
watch([filterStatus, filterInterest, filterDateFrom, filterDateTo, filterProduct], () => {
  currentPage.value = 1
})

const clearFilters = () => {
  filterStatus.value = 'all'
  filterInterest.value = 'all'
}

const hasActiveFilters = computed(() => filterStatus.value !== 'all' || filterInterest.value !== 'all')

// Fetch Data Supabase
const fetchData = async () => {
  loading.value = true
  try {
    const { data: leadsData, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    fullLeadsData.value = leadsData || []

    let total = 0
    let interested = 0
    let newLeads = 0
    let locked = 0

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    leads.value = (leadsData || []).map((item: any) => {
      total++
      
      const isInterested = item.stage === 'qualificado' || item.stage === 'convertido'
      if (isInterested) interested++
      
      const isLocked = item.agent_active === false
      if (isLocked) locked++

      const itemDate = new Date(item.created_at)
      if (itemDate >= sevenDaysAgo) newLeads++

      return {
        id: item.id,
        name: item.name || 'Sem nome',
        avatar: (item.name || 'U').charAt(0).toUpperCase(),
        media_url: undefined,
        phone: item.phone || '',
        interested: isInterested,
        product: item.source || 'Não informado',
        status: isLocked ? 'locked' : 'active'
      }
    })

    metrics.total = total
    metrics.interested = interested
    metrics.newLeads = newLeads
    metrics.locked = locked

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const openLeadDetails = (leadId: string) => {
  const fullLead = fullLeadsData.value.find((l: any) => l.id === leadId)
  if (fullLead) {
    selectedLead.value = fullLead as Cliente
    showModal.value = true
  }
}

const openChat = (leadId: string) => {
  navigateTo(`/chats?clientId=${leadId}`)
}

const handleStatusUpdate = async (id: string, newStatus: string) => {
  const lead = fullLeadsData.value.find(l => l.id === id)
  if (lead) {
    lead.stage = newStatus
  }
  try {
    await supabase.from('leads').update({ stage: newStatus }).eq('id', id)
  } catch (err) {
    console.error('Error updating status:', err)
  }
}

const handleNotesUpdate = async (id: string, notes: string) => {
  const lead = fullLeadsData.value.find(l => l.id === id)
  if (lead) {
    lead.about = notes
  }
  try {
    await supabase.from('leads').update({ about: notes }).eq('id', id)
  } catch (err) {
    console.error('Error updating notes:', err)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen text-gray-900 dark:text-dark-text font-sans transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-10 transition-all duration-300']">
      <!-- Header -->
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-serif">Dashboard</h1>
          <p class="text-gray-400 dark:text-dark-muted mt-1 text-sm">Visão geral da sua imobiliária.</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-sm font-medium text-gray-400 dark:text-dark-muted bg-white dark:bg-dark-surface px-4 py-2 rounded-sm border border-gray-100 dark:border-dark-border">
            {{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>
        </div>
      </header>

      <!-- Metrics Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <!-- Card 1: Total de Leads -->
        <div class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border p-6 rounded-sm shadow-card hover:shadow-card-hover hover:border-primary-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-gray-400 dark:text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">Contatos Totais</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.total }}</h3>
            </div>
            <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-sm text-primary-500 group-hover:scale-110 transition-transform">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <p class="text-xs text-gray-400 dark:text-dark-muted">Clientes captados</p>
        </div>

        <!-- Card 2: Visitas Agendadas -->
        <div class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border p-6 rounded-sm shadow-card hover:shadow-card-hover hover:border-emerald-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-gray-400 dark:text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">Visitas Agendadas</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.interested }}</h3>
            </div>
            <div class="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-sm text-emerald-500 group-hover:scale-110 transition-transform">
              <TrendingUp class="w-5 h-5" />
            </div>
          </div>
          <p class="text-xs text-gray-400 dark:text-dark-muted">Visitas aos imóveis pendentes</p>
        </div>

        <!-- Card 3: Novos (7 dias) -->
        <div class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border p-6 rounded-sm shadow-card hover:shadow-card-hover hover:border-blue-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-gray-400 dark:text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">Novos (7 dias)</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.newLeads }}</h3>
            </div>
            <div class="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-sm text-blue-500 group-hover:scale-110 transition-transform">
              <Clock class="w-5 h-5" />
            </div>
          </div>
          <p class="text-xs text-gray-400 dark:text-dark-muted">Novos contatos esta semana</p>
        </div>

        <!-- Card 4: Contratos de Aluguel -->
        <div class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border p-6 rounded-sm shadow-card hover:shadow-card-hover hover:border-amber-500/30 transition-all duration-300 group">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-gray-400 dark:text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">Contratos (Mês)</p>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.locked }}</h3>
            </div>
            <div class="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-sm text-amber-500 group-hover:scale-110 transition-transform">
              <AlertCircle class="w-5 h-5" />
            </div>
          </div>
          <p class="text-xs text-gray-400 dark:text-dark-muted">Contratos de aluguel assinados</p>
        </div>
      </div>

      <!-- Recent Leads Table -->
      <div class="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border rounded-sm overflow-hidden shadow-card">
        <!-- Table Header -->
        <div class="px-6 py-5 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-sm text-primary-500">
               <Phone class="w-5 h-5" />
             </div>
             <div>
               <h3 class="text-base font-semibold text-gray-900 dark:text-white">Clientes do WhatsApp</h3>
               <p class="text-xs text-gray-400 dark:text-dark-muted">Listagem recente de contatos</p>
             </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-gray-500 dark:text-dark-muted text-xs font-medium px-3 py-1.5 rounded-sm bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
              {{ filteredLeads.length }} clientes
            </span>

            <button 
              @click="phoneBlurred = !phoneBlurred"
              :class="[
                'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors border',
                phoneBlurred
                  ? 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border'
                  : 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20'
              ]"
              :title="phoneBlurred ? 'Mostrar telefones' : 'Ocultar telefones'"
            >
              <EyeOff v-if="phoneBlurred" class="w-3.5 h-3.5" />
              <Eye v-else class="w-3.5 h-3.5" />
              {{ phoneBlurred ? 'Mostrar' : 'Ocultar' }}
            </button>

            <!-- Clear Filters Button -->
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <X class="w-3.5 h-3.5" /> Limpar
            </button>

            <button 
              @click="showFilters = !showFilters"
              :class="[
                'flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-sm transition-colors border',
                showFilters || hasActiveFilters
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20' 
                  : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border'
              ]"
            >
              <Filter class="w-3.5 h-3.5" /> Filtrar
            </button>
          </div>
        </div>

        <!-- Filters Panel -->
        <Transition name="slide">
          <div v-if="showFilters" class="px-6 py-5 border-b border-gray-100 dark:border-dark-border bg-gray-50/80 dark:bg-dark-card/30">
            <div class="grid grid-cols-2 gap-x-8 gap-y-4">
              <!-- Row 1: Status + Qualificado -->
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider w-20 flex-shrink-0">Status</span>
                <div class="flex gap-1.5 bg-white dark:bg-dark-surface p-1 rounded-sm border border-gray-100 dark:border-dark-border">
                  <button 
                    v-for="opt in [{ value: 'all', label: 'Todos' }, { value: 'active', label: 'Ativo' }, { value: 'locked', label: 'Travado' }]" 
                    :key="opt.value"
                    @click="filterStatus = opt.value as any"
                    :class="[
                      'px-3 py-1.5 rounded-sm text-xs font-semibold transition-all',
                      filterStatus === opt.value 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card hover:text-gray-700 dark:hover:text-white'
                    ]"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider w-20 flex-shrink-0">Qualificado</span>
                <div class="flex gap-1.5 bg-white dark:bg-dark-surface p-1 rounded-sm border border-gray-100 dark:border-dark-border">
                  <button 
                    v-for="opt in [{ value: 'all', label: 'Todos' }, { value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }]"
                    :key="opt.value"
                    @click="filterInterest = opt.value as any"
                    :class="[
                      'px-3 py-1.5 rounded-sm text-xs font-semibold transition-all',
                      filterInterest === opt.value 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card hover:text-gray-700 dark:hover:text-white'
                    ]"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider w-20 flex-shrink-0">Interesse</span>
                <div class="flex gap-1.5 bg-white dark:bg-dark-surface p-1 rounded-sm border border-gray-100 dark:border-dark-border">
                  <button 
                    v-for="opt in [{ value: 'all', label: 'Todos' }, { value: 'Apartamento', label: 'Apartamento' }, { value: 'Casa', label: 'Casa' }, { value: 'Loteamento', label: 'Loteamento' }]"
                    :key="opt.value"
                    @click="filterProduct = opt.value as any"
                    :class="[
                      'px-3 py-1.5 rounded-sm text-xs font-semibold transition-all',
                      filterProduct === opt.value 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card hover:text-gray-700 dark:hover:text-white'
                    ]"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider w-20 flex-shrink-0">Período</span>
                <div class="flex items-center gap-2">
                  <input 
                    v-model="filterDateFrom" 
                    type="date" 
                    class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-sm px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <span class="text-[10px] text-gray-400">até</span>
                  <input 
                    v-model="filterDateTo" 
                    type="date" 
                    class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-sm px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-dark-border text-gray-400 dark:text-dark-muted text-xs uppercase tracking-wider">
                <th class="px-6 py-4 font-medium">Nome</th>
                <th class="px-6 py-4 font-medium">Telefone</th>
                <th class="px-6 py-4 font-medium">Interessado</th>
                <th class="px-6 py-4 font-medium">Produto</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-dark-border">
              <tr v-for="lead in paginatedLeads" :key="lead.id" class="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <!-- Nome -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div v-if="lead.media_url" class="w-9 h-9 rounded-sm flex-shrink-0 overflow-hidden border border-gray-100 dark:border-dark-border">
                      <img :src="lead.media_url" :alt="lead.name || 'Avatar'" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-9 h-9 rounded-sm bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                      {{ lead.avatar }}
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white text-sm">{{ lead.name }}</span>
                  </div>
                </td>
                
                <!-- Telefone -->
                <td class="px-6 py-4">
                  <span class="text-gray-400 dark:text-dark-muted text-sm font-mono" :class="{ 'blur-sm select-none': phoneBlurred }">
                    {{ lead.phone }}
                  </span>
                </td>

                <!-- Interessado -->
                <td class="px-6 py-4">
                  <span v-if="lead.interested" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Sim
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400">
                    Não
                  </span>
                </td>

                <!-- Produto -->
                <td class="px-6 py-4 text-sm text-gray-400 dark:text-dark-muted">
                  {{ lead.product }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span v-if="lead.status === 'active'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ativo
                  </span>
                  <span v-else-if="lead.status === 'locked'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500">
                     <Lock class="w-3 h-3" />
                     Travado
                  </span>
                </td>

                <!-- Ações -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="openLeadDetails(lead.id)"
                      class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-sm transition-all" 
                      title="Ver Detalhes"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button 
                      @click="openChat(lead.id)" 
                      class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-sm transition-all" 
                      title="Abrir Chat"
                    >
                      <MessageSquare class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer / Pagination -->
        <div class="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex justify-between items-center">
          <p class="text-xs text-gray-400 dark:text-dark-muted">
            Mostrando <span class="text-gray-700 dark:text-white font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredLeads.length) }}</span> 
            de {{ filteredLeads.length }} clientes
          </p>
          
          <div class="flex items-center gap-2">
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage <= 1"
              :class="[
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                currentPage <= 1 
                  ? 'text-gray-300 dark:text-gray-600 border-gray-100 dark:border-dark-border cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card hover:border-gray-300'
              ]"
            >
              <ChevronLeft class="w-3.5 h-3.5" /> Anterior
            </button>
            
            <div class="flex gap-1">
              <button 
                v-for="page in totalPages" 
                :key="page" 
                @click="goToPage(page)"
                :class="[
                  'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                  page === currentPage 
                    ? 'bg-primary-500 text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage >= totalPages"
              :class="[
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                currentPage >= totalPages 
                  ? 'text-gray-300 dark:text-gray-600 border-gray-100 dark:border-dark-border cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card hover:border-gray-300'
              ]"
            >
              Próxima <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Lead Details Modal -->
  <LeadDetailsModal
    :model-value="showModal"
    @update:model-value="showModal = $event"
    :lead="selectedLead"
    @update-status="handleStatusUpdate"
    @save-notes="handleNotesUpdate"
  />
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 100px;
}
</style>
