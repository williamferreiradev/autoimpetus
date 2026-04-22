<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MessageSquare, KanbanSquare, Table as TableIcon } from 'lucide-vue-next'
import KanbanBoard from '@/components/crm/KanbanBoard.vue'
import LeadTable from '@/components/crm/LeadTable.vue'
import LeadDetailsModal from '@/components/leads/LeadDetailsModal.vue'
import type { Cliente, CrmStatus } from '@/types/crm'
import { useSupabaseClient } from '#imports'

const { mainMargin } = useSidebarState()
const supabase = useSupabaseClient()

// State
const currentView = ref<'kanban' | 'table'>('kanban')
const leads = ref<any[]>([])
const stages = ref<any[]>([])
const loading = ref(true)
const error = ref<any>(null)
const showModal = ref(false)
const selectedLead = ref<Cliente | null>(null)

// Fetch Data - REAL SUPABASE
const fetchLeads = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data: stagesData, error: stagesError } = await supabase.from('stage').select('*').order('id')
    if (stagesError) throw stagesError
    stages.value = stagesData || []

    const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (leadsError) throw leadsError
    leads.value = leadsData || []
  } catch (err: any) {
    console.error('Error fetching leads:', err)
    error.value = err.message || err
  } finally {
    loading.value = false
  }
}

const handleStatusUpdate = async (id: string, newStage: any) => {
  const lead = leads.value.find((l: any) => l.id === id)
  if (lead) {
    lead.stage_id = newStage.id
    lead.stage = newStage.estagio
  }
  try {
    await supabase.from('leads').update({
      stage_id: newStage.id,
      stage: newStage.estagio
    }).eq('id', id)
  } catch (err) {
    console.error('Error updating status:', err)
  }
}

const openLeadDetails = (lead: Cliente) => {
  selectedLead.value = lead
  showModal.value = true
}

const handleNotesUpdate = async (id: string, notes: string) => {
  const lead = leads.value.find((l: any) => l.id === id)
  if (lead) {
    lead.about = notes
  }
  try {
    await supabase.from('leads').update({ about: notes }).eq('id', id)
  } catch (err) {
    console.error('Error updating notes:', err)
  }
}

let realtimeChannel: any

const setupRealtime = () => {
  realtimeChannel = supabase.channel('crm_leads_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          if (!leads.value.find((l: any) => l.id === payload.new.id)) {
            leads.value.unshift(payload.new)
          }
        } else if (payload.eventType === 'UPDATE') {
          const idx = leads.value.findIndex((l: any) => l.id === payload.new.id)
          if (idx !== -1) {
            Object.assign(leads.value[idx], payload.new)
          } else {
            // Se foi atualizado mas não tava na lista (ex: paginação futura), coloca na lista
            leads.value.push(payload.new)
          }
        } else if (payload.eventType === 'DELETE') {
          leads.value = leads.value.filter((l: any) => l.id !== payload.old.id)
        }
      }
    )
    .subscribe()
}

onMounted(() => {
  fetchLeads()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />

    <!-- Error Debug Output -->
    <pre v-if="error" class="fixed top-4 right-4 bg-red-50 text-red-600 dark:bg-red-900 dark:text-white p-4 rounded-xl z-50 max-w-md overflow-auto shadow-card">{{ error }}</pre>

    <main :class="[mainMargin, 'p-10 h-screen overflow-hidden flex flex-col transition-all duration-300']">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
             <MessageSquare class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight flex items-center gap-3">
              Pipeline de Negociações
              <span v-if="!loading" class="text-xs font-medium text-gray-500 dark:text-dark-muted px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                {{ leads.length }} interessados
              </span>
            </h1>
            <p class="text-gray-400 dark:text-dark-muted text-sm mt-0.5">Gerencie os interessados nos imóveis.</p>
          </div>
        </div>
        
        <!-- View Toggle -->
        <div class="bg-white dark:bg-dark-surface p-1 rounded-xl border border-gray-100 dark:border-dark-border shadow-card flex gap-1 transition-colors duration-300">
          <button 
            @click="currentView = 'kanban'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              currentView === 'kanban' ? 'bg-primary-500 text-white shadow-luxury' : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <KanbanSquare class="w-4 h-4" /> Kanban
          </button>
          
          <button 
            @click="currentView = 'table'"
            :class="[
               'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
               currentView === 'table' ? 'bg-primary-500 text-white shadow-luxury' : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <TableIcon class="w-4 h-4" /> Tabela
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm transition-colors duration-300">
           <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <Transition name="fade" mode="out-in">
          <KanbanBoard 
            v-if="currentView === 'kanban'" 
            :leads="leads" 
            :stages="stages"
            @update-status="handleStatusUpdate"
            @view-details="openLeadDetails"
          />
          <LeadTable 
            v-else 
            :leads="leads"
            @view-details="openLeadDetails"
          />
        </Transition>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
