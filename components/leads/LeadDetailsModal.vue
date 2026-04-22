<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { User, Phone, Calendar, Package, X, TrendingUp } from 'lucide-vue-next'
import type { Cliente } from '@/types/crm'

const props = defineProps<{
  modelValue: boolean
  lead: Cliente | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update-status', id: string, status: string): void
  (e: 'save-notes', id: string, notes: string): void
}>()

const localNotes = ref('')
const localStatus = ref('')

// Sync state when lead changes
watch(() => props.lead, (newLead) => {
  if (newLead) {
    localNotes.value = newLead.metadata?.notes || ''
    localStatus.value = newLead.estagiokanbam || 'novo'
  }
}, { immediate: true })

const statusOptions = [
  { label: 'Novo', value: 'novo', color: 'bg-blue-500' },
  { label: 'Em Contato', value: 'em_contato', color: 'bg-yellow-500' },
  { label: 'Qualificado', value: 'qualificado', color: 'bg-primary-500' },
  { label: 'Convertido', value: 'convertido', color: 'bg-green-500' },
  { label: 'Perdido', value: 'perdido', color: 'bg-red-500' }
]

const currentStatusColor = computed(() => {
  const status = statusOptions.find(s => s.value === localStatus.value)
  return status ? status.color : 'bg-gray-500'
})

const close = () => emit('update:modelValue', false)

const handleStatusChange = async (event: Event) => {
  const newStatus = (event.target as HTMLSelectElement).value
  if (!props.lead) return
  localStatus.value = newStatus
  emit('update-status', props.lead.id, newStatus)
}

const handleSaveNotes = async () => {
  if (!props.lead) return
  
  const currentNotes = props.lead.metadata?.notes || ''
  if (localNotes.value !== currentNotes) {
    emit('save-notes', props.lead.id, localNotes.value)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Desconhecido'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <!-- Teleport to body for true popup behavior -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue && lead" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-sm"></div>
        
        <!-- Modal Card -->
        <div class="relative bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-sm shadow-luxury max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-surface z-10">
            <div class="flex items-center gap-3">
              <User class="w-5 h-5 text-primary-500" />
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Detalhes do Interessado</h2>
            </div>
            <button 
              @click="close" 
              class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-sm transition-all"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            
            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-6">
              
              <!-- Nome e Avatar -->
              <div class="col-span-2 flex items-center gap-4 border-b border-gray-200 dark:border-dark-border pb-6 mb-2">
                <div v-if="lead.media_url" class="w-16 h-16 rounded-sm flex-shrink-0 overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
                  <img :src="lead.media_url" :alt="lead.name || 'Avatar'" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-16 h-16 rounded-sm bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-500 font-bold text-2xl flex-shrink-0 shadow-sm border border-transparent">
                  {{ (lead.name || 'D').charAt(0).toUpperCase() }}
                </div>
                <div class="space-y-1">
                  <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Nome</span>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ lead.name || 'Desconhecido' }}</p>
                </div>
              </div>

              <!-- Telefone -->
              <div class="space-y-1">
                <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Telefone</span>
                <div class="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                  <Phone class="w-4 h-4 text-primary-500" />
                  <span>{{ lead.remotejid }}</span>
                </div>
              </div>

              <!-- Data de Cadastro -->
              <div class="space-y-1">
                <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Cadastrado em</span>
                <div class="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span class="text-sm font-medium">{{ formatDate(lead.created_at) }}</span>
                </div>
              </div>

              <!-- Interesse -->
              <div class="space-y-1">
                <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Avaliação</span>
                <div>
                  <span 
                    v-if="lead.is_qualified" 
                    class="inline-flex px-3 py-1 rounded-sm text-xs font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 border border-primary-200 dark:border-primary-500/20 shadow-sm"
                  >
                    Aprovada
                  </span>
                  <span 
                    v-else 
                    class="inline-flex px-3 py-1 rounded-sm text-xs font-bold bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border"
                  >
                    Pendente
                  </span>
                </div>
              </div>

              <!-- Vertical / Produto -->
              <div class="col-span-1 space-y-1">
                <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Interesse</span>
                <div class="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Package class="w-4 h-4 text-primary-500" />
                  <span class="text-sm font-medium">{{ lead.vertical || 'Não informado' }}</span>
                </div>
              </div>

              <!-- Score -->
              <div class="col-span-1 space-y-1">
                <span class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Score IA</span>
                <div class="flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp class="w-4 h-4 text-primary-500" />
                  <span class="font-bold text-sm">{{ lead.score || 'A+' }}</span>
                </div>
              </div>

            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-200 dark:bg-dark-border"></div>

            <!-- Actions -->
            <div class="space-y-4">
              
              <!-- Status Selector -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Status CRM</label>
                <div class="relative">
                  <select
                    v-model="localStatus"
                    @change="handleStatusChange"
                    class="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-sm px-4 py-3 pl-8 pr-10 appearance-none shadow-sm font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span :class="['w-2 h-2 rounded-full inline-block', currentStatusColor]"></span>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Observações</label>
                <textarea
                  v-model="localNotes"
                  placeholder="Adicione observações sobre o perfil deste interessado..."
                  rows="4"
                  @blur="handleSaveNotes"
                  class="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none text-sm shadow-sm"
                ></textarea>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-dark-border text-xs text-gray-500 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg mt-2">
            <span class="font-medium">Follow-ups: {{ lead.metadata?.followups || 0 }} tentativas</span>
            <span class="font-medium">Último: {{ formatDate(lead.metadata?.last_followup) }}</span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
