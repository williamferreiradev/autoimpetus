<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { User, Phone, Search, Eye, EyeOff, Filter, Calendar } from 'lucide-vue-next'
import LeadDetailsModal from '@/components/leads/LeadDetailsModal.vue'
import type { Cliente } from '@/types/crm'

const { mainMargin } = useSidebarState()
const supabase = useSupabaseClient()

// State
const contacts = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const showModal = ref(false)
const selectedContact = ref<Cliente | null>(null)
const phoneBlurred = ref(true)
const showFilters = ref(false)
const filterQualified = ref<'all' | 'yes' | 'no'>('all')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Fetch contacts REAL Supabase
const fetchContacts = async () => {
  loading.value = true
  
  try {
    const { data: leadsData, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) throw error
    contacts.value = leadsData || []
  } catch (error) {
    console.error('Error fetching contacts:', error)
  } finally {
    loading.value = false
  }
}

let realtimeChannel: any

const setupRealtime = () => {
  realtimeChannel = supabase.channel('contacts_leads_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          if (!contacts.value.find((l: any) => l.id === payload.new.id)) {
            contacts.value.unshift(payload.new)
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = contacts.value.findIndex((l: any) => l.id === payload.new.id)
          if (idx !== -1) {
            Object.assign(contacts.value[idx], payload.new)
          } else {
            contacts.value.push(payload.new)
          }
        } else if (payload.eventType === 'DELETE') {
          contacts.value = contacts.value.filter((l: any) => l.id !== payload.old.id)
        }
      }
    )
    .subscribe()
}

// Filtered contacts based on search + filters
const filteredContacts = computed(() => {
  let result = [...contacts.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((contact: any) => 
      (contact.name?.toLowerCase().includes(query)) ||
      (contact.phone?.toLowerCase().includes(query))
    )
  }

  if (filterQualified.value !== 'all') {
    result = result.filter((c: any) => {
      const isQualified = c.stage === 'qualificado' || c.stage === 'convertido'
      return filterQualified.value === 'yes' ? isQualified : !isQualified
    })
  }

  return result
})

const hasActiveFilters = computed(() => filterQualified.value !== 'all' || filterDateFrom.value || filterDateTo.value)

const clearFilters = () => {
  filterQualified.value = 'all'
  filterDateFrom.value = ''
  filterDateTo.value = ''
}

// Open modal
const openContactDetails = (contact: Cliente) => {
  selectedContact.value = contact
  showModal.value = true
}

// Handle status update from modal
const handleStatusUpdate = async (id: string, newStage: any) => {
  const contact = contacts.value.find(c => c.id === id)
  if (contact) {
    contact.stage = newStage.estagio
    contact.stage_id = newStage.id
  }
  try {
    await supabase.from('leads').update({
      stage_id: newStage.id,
      stage: newStage.estagio
    }).eq('id', id)
  } catch (err) {
    console.error('Error updating config:', err)
  }
}

// Handle notes update from modal
const handleNotesUpdate = async (id: string, notes: string) => {
  const contact = contacts.value.find(c => c.id === id)
  if (contact) {
    contact.about = notes
  }
  try {
    await supabase.from('leads').update({ about: notes }).eq('id', id)
  } catch (err) {
    console.error('Error updating notes:', err)
  }
}

onMounted(() => {
  fetchContacts()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans selection:bg-primary-500 selection:text-white transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-10 transition-all duration-300']">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contatos</h1>
        <p class="text-gray-400 dark:text-dark-muted text-sm mt-1">Lista de todos os contatos com filtros</p>
      </header>

      <!-- Main Card -->
      <div class="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm transition-colors">
        
        <!-- Card Header with Icon and Count -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-xl">
              <User class="w-5 h-5 text-primary-600 dark:text-primary-500" />
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Diretório de Interessados</h2>
          </div>
          <div class="flex items-center gap-2">
            <!-- Phone Blur -->
            <button 
              @click="phoneBlurred = !phoneBlurred"
              :class="['flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border', phoneBlurred ? 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border' : 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20']"
            >
              <EyeOff v-if="phoneBlurred" class="w-3.5 h-3.5" />
              <Eye v-else class="w-3.5 h-3.5" />
            </button>

            <!-- Filter toggle -->
            <button 
              @click="showFilters = !showFilters"
              :class="['flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border', showFilters || hasActiveFilters ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20' : 'text-gray-500 dark:text-dark-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-card border-gray-100 dark:border-dark-border']"
            >
              <Filter class="w-3.5 h-3.5" />
              <span v-if="!showFilters">Filtrar</span>
            </button>

            <span class="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-inner">
              {{ filteredContacts.length }} de {{ contacts.length }}
            </span>
          </div>
        </div>

        <!-- Filters Panel -->
        <Transition name="slide">
          <div v-if="showFilters" class="px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/80 dark:bg-dark-card/30">
            <div class="flex flex-wrap items-center gap-6">
              <!-- Qualified Filter -->
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Status</span>
                <div class="flex gap-1.5 bg-white dark:bg-dark-surface p-1 rounded-xl border border-gray-100 dark:border-dark-border">
                  <button 
                    v-for="opt in [{ value: 'all', label: 'Todos' }, { value: 'yes', label: 'Qualificado' }, { value: 'no', label: 'Pendente' }]"
                    :key="opt.value"
                    @click="filterQualified = opt.value as any"
                    :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', filterQualified === opt.value ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card']"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <!-- Date Filter -->
              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Período</span>
                <div class="flex items-center gap-2">
                  <input v-model="filterDateFrom" type="date" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400" />
                  <span class="text-[10px] text-gray-400">até</span>
                  <input v-model="filterDateTo" type="date" class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400" />
                </div>
              </div>

              <!-- Clear -->
              <button v-if="hasActiveFilters" @click="clearFilters" class="text-xs text-red-500 hover:text-red-600 font-medium">Limpar</button>
            </div>
          </div>
        </Transition>

        <!-- Search Bar -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
          <div class="relative max-w-2xl">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar interessado por nome ou telefone..."
              class="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl pl-12 pr-4 py-3 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm transition-all"
            />
          </div>
        </div>

        <!-- Table Header -->
        <div class="px-6 py-3 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wider">
          <div class="col-span-8">Nome</div>
          <div class="col-span-4 text-right">Avaliação</div>
        </div>

        <!-- Contact List -->
        <div class="divide-y divide-gray-200 dark:divide-dark-border">
          <!-- Loading State -->
          <div v-if="loading" class="p-12 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredContacts.length === 0" class="p-12 text-center">
            <p class="text-gray-500 dark:text-dark-muted">Nenhum interessado encontrado</p>
          </div>

          <!-- Contact Rows -->
          <div
            v-else
            v-for="contact in filteredContacts"
            :key="contact.id"
            @click="openContactDetails(contact)"
            class="px-6 py-4 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all group grid grid-cols-12 gap-4 items-center"
          >
            <!-- Left: Avatar + Name + Phone -->
            <div class="col-span-8 flex items-center gap-4">
              <!-- Avatar -->
              <div v-if="(contact as any).media_url" class="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
                <img :src="(contact as any).media_url" :alt="contact.name || 'Avatar'" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-500 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                {{ (contact.name || 'I').charAt(0).toUpperCase() }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-primary-500 transition-colors">
                  {{ contact.name || 'Desconhecido' }}
                </h3>
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                  <Phone class="w-3 h-3" />
                  <span :class="{ 'blur-sm select-none': phoneBlurred }">{{ contact.phone || '' }}</span>
                </div>
              </div>
            </div>

            <div class="col-span-4 flex items-center justify-end gap-2">
              <span
                v-if="contact.stage === 'qualificado' || contact.stage === 'convertido'"
                class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 border border-primary-200 dark:border-primary-500/20"
              >
                Aprovado
              </span>
              <span
                v-else
                class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"
              >
                 Pendente
              </span>

              <!-- Travado Badge -->
              <span
                v-if="contact.agent_active === false"
                class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20"
              >
                 Travado
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Lead Details Modal -->
  <LeadDetailsModal
    :model-value="showModal"
    @update:model-value="showModal = $event"
    :lead="selectedContact"
    @update-status="handleStatusUpdate"
    @save-notes="handleNotesUpdate"
  />
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.slide-enter-to, .slide-leave-from {
  max-height: 200px;
}
</style>
