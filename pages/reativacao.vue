<script setup lang="ts">
import { ref } from 'vue'
import { 
  RefreshCw, Upload, Settings, Zap, Calendar, 
  FileText, Users, Send, CheckCircle2, Clock,
  ChevronRight, AlertTriangle, Sparkles
} from 'lucide-vue-next'

const { mainMargin } = useSidebarState()

// State
const activeTab = ref<'disparo' | 'followup' | 'historico'>('disparo')
const csvFile = ref<File | null>(null)
const csvFileName = ref('')
const message = ref('Olá, [Nome]! Tudo bem? Vi que você demonstrou interesse em nossas propriedades de alto padrão. Temos novos imóveis exclusivos que acabaram de entrar no portfólio. Gostaria de conhecer as novidades?')
const selectedLeads = ref<string[]>([])
const selectAll = ref(false)
const sending = ref(false)
const sendComplete = ref(false)

// Follow-up config
const followupEnabled = ref(true)
const followupDelay = ref('48')
const followupMessage = ref('Oi! Passando para saber se conseguiu pensar sobre os imóveis que conversamos. Temos horários disponíveis esta semana para visitas presenciais. Posso te ajudar a encontrar o imóvel ideal? 🗝️')
const followupCount = ref('3')

// Mock inactive leads
const inactiveLeads = ref([
  { id: '1', name: 'Ana Clara Moreira', phone: '5511991234567', lastContact: '15 dias atrás', product: 'Cobertura Duplex', status: 'sem_resposta' },
  { id: '2', name: 'Dr. Paulo Ribeiro', phone: '5521998765432', lastContact: '22 dias atrás', product: 'Casa de Condomínio', status: 'esfriou' },
  { id: '3', name: 'Juliana Ferreira', phone: '5531987654321', lastContact: '30 dias atrás', product: 'Apartamento Luxo', status: 'sem_resposta' },
  { id: '4', name: 'Marcos Vinícius', phone: '5511976543210', lastContact: '18 dias atrás', product: 'Loteamento Exclusivo', status: 'esfriou' },
  { id: '5', name: 'Patrícia Gomes', phone: '5521965432109', lastContact: '45 dias atrás', product: 'Mansão', status: 'sem_resposta' },
  { id: '6', name: 'Ricardo Santos', phone: '5511954321098', lastContact: '12 dias atrás', product: 'Cobertura Duplex', status: 'esfriou' },
])

// Mock history
const reactivationHistory = ref([
  { id: '1', date: '28/02/2026', totalSent: 15, responses: 4, reactivated: 2, status: 'completed' },
  { id: '2', date: '21/02/2026', totalSent: 8, responses: 2, reactivated: 1, status: 'completed' },
  { id: '3', date: '14/02/2026', totalSent: 12, responses: 5, reactivated: 3, status: 'completed' },
])

const handleCSVUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    csvFile.value = target.files[0]!
    csvFileName.value = target.files[0]!.name
  }
}

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value
  if (selectAll.value) {
    selectedLeads.value = inactiveLeads.value.map(l => l.id)
  } else {
    selectedLeads.value = []
  }
}

const toggleLead = (id: string) => {
  const idx = selectedLeads.value.indexOf(id)
  if (idx > -1) {
    selectedLeads.value.splice(idx, 1)
  } else {
    selectedLeads.value.push(id)
  }
}

const startReactivation = async () => {
  sending.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  sending.value = false
  sendComplete.value = true
  setTimeout(() => { sendComplete.value = false }, 3000)
}

function getStatusColor(status: string) {
  return status === 'sem_resposta' 
    ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' 
    : 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
}

function getStatusLabel(status: string) {
  return status === 'sem_resposta' ? 'Sem resposta' : 'Esfriou'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-8 transition-all duration-300']">
      <!-- Header -->
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
            <RefreshCw class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Reativar Interessados</h1>
            <p class="text-gray-400 dark:text-dark-muted text-sm mt-0.5">Disparos de reativação, follow-up e nutrição de base</p>
          </div>
        </div>
      </header>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white dark:bg-dark-surface p-1 rounded-xl border border-gray-100 dark:border-dark-border mb-6 w-fit">
        <button 
          v-for="tab in [{ key: 'disparo', label: 'Disparo', icon: Send }, { key: 'followup', label: 'Follow-up', icon: Clock }, { key: 'historico', label: 'Histórico', icon: FileText }]"
          :key="tab.key"
          @click="activeTab = tab.key as any"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
            activeTab === tab.key 
              ? 'bg-primary-500 text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card'
          ]"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: Disparo -->
      <div v-if="activeTab === 'disparo'" class="grid grid-cols-3 gap-6">
        <!-- Left: Lead Selection (2 cols) -->
        <div class="col-span-2 space-y-5">
          <!-- CSV Upload -->
          <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Upload class="w-4 h-4 text-primary-500" /> Importar Base (CSV)
            </h3>
            <div class="flex items-center gap-3">
              <label class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary-300 dark:hover:border-primary-500/30 transition-colors">
                <Upload class="w-4 h-4 text-gray-400" />
                <span class="text-xs text-gray-500 dark:text-dark-muted">{{ csvFileName || 'Arraste ou clique para enviar CSV' }}</span>
                <input type="file" accept=".csv" class="hidden" @change="handleCSVUpload" />
              </label>
              <span v-if="csvFileName" class="text-[10px] text-emerald-500 font-semibold">✓ Enviado</span>
            </div>
          </div>

          <!-- Lead List -->
          <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Users class="w-4 h-4 text-gray-400" />
                <h3 class="text-sm font-bold text-gray-900 dark:text-white">Interessados Inativos</h3>
                <span class="text-[10px] text-gray-400 bg-gray-100 dark:bg-dark-card px-2 py-0.5 rounded-full">{{ inactiveLeads.length }}</span>
              </div>
              <button @click="toggleSelectAll" class="text-[11px] font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                {{ selectAll ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>

            <div class="divide-y divide-gray-50 dark:divide-dark-border max-h-[350px] overflow-y-auto">
              <div 
                v-for="lead in inactiveLeads" 
                :key="lead.id"
                @click="toggleLead(lead.id)"
                :class="[
                  'px-5 py-3 flex items-center gap-4 cursor-pointer transition-colors',
                  selectedLeads.includes(lead.id) 
                    ? 'bg-primary-50/50 dark:bg-primary-500/5' 
                    : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                ]"
              >
                <!-- Checkbox -->
                <div :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all', selectedLeads.includes(lead.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-dark-border']">
                  <CheckCircle2 v-if="selectedLeads.includes(lead.id)" class="w-3 h-3 text-white" />
                </div>

                <!-- Lead Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ lead.name }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-dark-muted">{{ lead.product }} · {{ lead.lastContact }}</p>
                </div>

                <!-- Status -->
                <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-md border', getStatusColor(lead.status)]">
                  {{ getStatusLabel(lead.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Message Config (1 col) -->
        <div class="space-y-5">
          <!-- Message -->
          <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-primary-500" /> Mensagem de Reativação
            </h3>
            <textarea 
              v-model="message"
              rows="5"
              class="w-full bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
              placeholder="Escreva a mensagem de reativação..."
            ></textarea>
            <p class="text-[10px] text-gray-400 mt-2">A IA vai personalizar a mensagem com o nome do lead e produto de interesse.</p>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Resumo do Disparo</h3>
            <div class="space-y-2.5">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500 dark:text-dark-muted">Selecionados</span>
                <span class="font-bold text-gray-900 dark:text-white">{{ selectedLeads.length }} leads</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500 dark:text-dark-muted">CSV importado</span>
                <span class="font-bold" :class="csvFileName ? 'text-emerald-500' : 'text-gray-400'">{{ csvFileName ? 'Sim' : 'Não' }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500 dark:text-dark-muted">Follow-up</span>
                <span class="font-bold" :class="followupEnabled ? 'text-primary-500' : 'text-gray-400'">{{ followupEnabled ? 'Ativo' : 'Desligado' }}</span>
              </div>
            </div>
          </div>

          <!-- Send Button -->
          <button 
            @click="startReactivation"
            :disabled="selectedLeads.length === 0 || sending"
            :class="[
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all',
              selectedLeads.length > 0 && !sending
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md' 
                : 'bg-gray-100 dark:bg-dark-card text-gray-400 cursor-not-allowed'
            ]"
          >
            <Send v-if="!sending && !sendComplete" class="w-4 h-4" />
            <div v-if="sending" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <CheckCircle2 v-if="sendComplete" class="w-4 h-4 text-white" />
            {{ sendComplete ? 'Enviado!' : sending ? 'Enviando...' : 'Iniciar Reativação' }}
          </button>
        </div>
      </div>

      <!-- Tab: Follow-up -->
      <div v-if="activeTab === 'followup'" class="max-w-2xl">
        <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings class="w-5 h-5 text-primary-500" /> Configuração de Follow-up
            </h3>
            <button 
              @click="followupEnabled = !followupEnabled"
              :class="['relative w-11 h-6 rounded-full transition-colors', followupEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border']"
            >
              <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform', followupEnabled ? 'left-[22px]' : 'left-0.5']"></span>
            </button>
          </div>

          <div :class="{ 'opacity-50 pointer-events-none': !followupEnabled }" class="space-y-5">
            <!-- Delay -->
            <div>
              <label class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider block mb-2">Intervalo entre mensagens</label>
              <div class="flex gap-1.5 bg-gray-50 dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border w-fit">
                <button 
                  v-for="opt in ['24', '48', '72']"
                  :key="opt"
                  @click="followupDelay = opt"
                  :class="['px-4 py-2 rounded-lg text-xs font-semibold transition-all', followupDelay === opt ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white dark:hover:bg-dark-surface']"
                >
                  {{ opt }}h
                </button>
              </div>
            </div>

            <!-- Number of follow-ups -->
            <div>
              <label class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider block mb-2">Quantidade de follow-ups</label>
              <div class="flex gap-1.5 bg-gray-50 dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border w-fit">
                <button 
                  v-for="opt in ['1', '2', '3', '5']"
                  :key="opt"
                  @click="followupCount = opt"
                  :class="['px-4 py-2 rounded-lg text-xs font-semibold transition-all', followupCount === opt ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white dark:hover:bg-dark-surface']"
                >
                  {{ opt }}x
                </button>
              </div>
            </div>

            <!-- Follow-up message -->
            <div>
              <label class="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider block mb-2">Mensagem de Follow-up</label>
              <textarea 
                v-model="followupMessage"
                rows="4"
                class="w-full bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
              ></textarea>
            </div>

            <!-- Info -->
            <div class="bg-primary-50/50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 rounded-xl p-4 flex items-start gap-3">
              <Sparkles class="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <p class="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                A IA vai adaptar automaticamente a mensagem de follow-up com base no contexto da conversa anterior e o produto de interesse do lead.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Histórico -->
      <div v-if="activeTab === 'historico'">
        <div class="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Histórico de Reativações</h3>
          </div>

          <div class="divide-y divide-gray-50 dark:divide-dark-border">
            <div v-for="item in reactivationHistory" :key="item.id" class="px-6 py-4 flex items-center gap-5">
              <div class="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                <Calendar class="w-4 h-4 text-primary-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">Campanha de {{ item.date }}</p>
                <p class="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">{{ item.totalSent }} enviados · {{ item.responses }} respostas · {{ item.reactivated }} reativados</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <p class="text-lg font-bold text-primary-500">{{ Math.round(item.responses / item.totalSent * 100) }}%</p>
                  <p class="text-[9px] text-gray-400 uppercase font-medium">Resposta</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-emerald-500">{{ Math.round(item.reactivated / item.totalSent * 100) }}%</p>
                  <p class="text-[9px] text-gray-400 uppercase font-medium">Reativado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
