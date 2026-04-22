<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useSupabaseClient } from '#imports'
import { MessageSquare, Phone, Search, FileText, Menu, X, BotOff, Bot, EyeOff, Eye, PhoneForwarded } from 'lucide-vue-next'

const route = useRoute()
const { mainMargin } = useSidebarState()
const supabase = useSupabaseClient()

// State
const chats = ref<any[]>([])
const selectedChat = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const messagesLoading = ref(false)
const searchQuery = ref('')
const isSidebarOpen = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const phoneBlurred = ref(true)

// Summary state
const summaryText = ref('')
const summaryLoading = ref(false)
const showSummary = ref(false)

// Handoff state
const handoffNumber = ref('+55 11 99999-0000')
const editingHandoff = ref(false)
const globalHandoffNumber = ref('+55 11 98888-0000')
const editingGlobalHandoff = ref(false)

// Fetch Clients to populate chat list
const fetchChats = async () => {
  loading.value = true
  try {
    const { data: leadsData, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) throw error

    // Fetch latest messages for sidelist
    const { data: allChats } = await supabase.from('n8n_chat_histories').select('lead_id, message, id').order('id', { ascending: false })
    
    const latestMsgs: Record<string, any> = {}
    if (allChats) {
       for(const c of allChats) {
          if (c.lead_id && !latestMsgs[c.lead_id]) {
             latestMsgs[c.lead_id] = c;
          }
       }
    }

    chats.value = (leadsData || []).map(c => {
      const msgObj = latestMsgs[c.id]?.message || {};
      return {
        id: c.id,
        name: c.name || 'Sem nome',
        phone: c.phone || c.remotejid || 'Sem telefone',
        lastMessage: msgObj.content || c.notes || 'Conversa iniciada...',
        lastSender: msgObj.type === 'ai' ? 'me' : 'user',
        timestamp: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        avatar: (c.name || 'U').charAt(0).toUpperCase(),
        media_url: undefined,
        Ativado: c.agent_active || false,
        is_qualified: c.is_qualified || false,
        estagiokanbam: c.stage || 'novo'
      }
    })

    const clientId = route.query.clientId as string
    if (clientId) {
      const chat = chats.value.find(c => c.id === clientId || c.phone === clientId)
      if (chat) selectChat(chat)
    } else if (chats.value.length > 0) {
      selectChat(chats.value[0])
    }
  } catch (error) {
    console.error('Error fetching chats:', error)
  } finally {
    loading.value = false
  }
}

// Fetch Messages for selected chat
const fetchMessages = async (chatId: string) => {
  messagesLoading.value = true
  showSummary.value = false
  summaryText.value = ''
  try {
    const { data, error } = await supabase.from('n8n_chat_histories')
      .select('*')
      .eq('lead_id', chatId)
      .order('id', { ascending: true })
      
    if (error) throw error
    
    const parseMessage = (text: string) => {
      if (!text) return { text: '', isSystem: false, systemAction: '' }
      
      const trimmed = text.trim()
      // Identifica "Calling function_name with input:" (chamadas de ferramenta do n8n)
      if (trimmed.startsWith('Calling ') && trimmed.includes('with input:')) {
         const functionName = trimmed.split(' ')[1] || 'ferramenta_interna'
         const niceName = functionName.replace(/_/g, ' ')
         return { text: trimmed, isSystem: true, systemAction: `Executou comando: ${niceName}` }
      }
      
      // Identifica respostas de banco em JSON ex: "[{...}]" ou "{...}"
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed)
          if (typeof parsed === 'object') {
            return { text: trimmed, isSystem: true, systemAction: 'Consultou o banco de dados' }
          }
        } catch(e) {}
      }
      
      return { text: trimmed, isSystem: false, systemAction: '' }
    }

    messages.value = (data || []).map(m => {
      const msgData = m.message || {}
      const parsed = parseMessage(msgData.content || '')
      return {
        id: m.id,
        sender: msgData.type === 'ai' ? 'me' : 'user', 
        text: parsed.text,
        isSystem: parsed.isSystem,
        systemAction: parsed.systemAction,
        timestamp: '', 
        type: 'text'
      }
    })
    
    scrollToBottom()
  } catch (e) {
    console.error('Error fetching messages', e)
  } finally {
    messagesLoading.value = false
  }
}

const selectChat = (chat: any) => {
  selectedChat.value = chat
  isSidebarOpen.value = false
  fetchMessages(chat.id)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight + 100
  }
}

let realtimeChannel: any

const parseMessage = (text: string) => {
      if (!text) return { text: '', isSystem: false, systemAction: '' }
      
      const trimmed = text.trim()
      // Identifica "Calling function_name with input:" (chamadas de ferramenta do n8n)
      if (trimmed.startsWith('Calling ') && trimmed.includes('with input:')) {
         const functionName = trimmed.split(' ')[1] || 'ferramenta_interna'
         const niceName = functionName.replace(/_/g, ' ')
         return { text: trimmed, isSystem: true, systemAction: `Executou comando: ${niceName}` }
      }
      
      // Identifica respostas de banco em JSON ex: "[{...}]" ou "{...}"
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed)
          if (typeof parsed === 'object') {
            return { text: trimmed, isSystem: true, systemAction: 'Consultou o banco de dados' }
          }
        } catch(e) {}
      }
      
      return { text: trimmed, isSystem: false, systemAction: '' }
    }

const setupRealtime = () => {
  realtimeChannel = supabase.channel('chat_updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'n8n_chat_histories' },
      async (payload) => {
        const row = payload.new

        // Update current active chat window
        if (selectedChat.value && row.lead_id === selectedChat.value.id) {
          const msgData = row.message || {}
          const parsed = parseMessage(msgData.content || '')
          messages.value.push({
            id: row.id,
            sender: msgData.type === 'ai' ? 'me' : 'user',
            text: parsed.text,
            isSystem: parsed.isSystem,
            systemAction: parsed.systemAction,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          })
          scrollToBottom()
        }

        // Update Sidebar lastMessage
        const chatIdx = chats.value.findIndex(c => c.id === row.lead_id)
        if (chatIdx !== -1) {
           chats.value[chatIdx].lastMessage = row.message?.content || ''
           chats.value[chatIdx].lastSender = row.message?.type === 'ai' ? 'me' : 'user'
        }
      }
    )
    .subscribe()
}

// Generate Summary
const generateSummary = async () => {
  if (!selectedChat.value) return
  summaryLoading.value = true
  showSummary.value = true

  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500))

  const { mockSummaries } = useMockData()
  const summary = (mockSummaries as any)[selectedChat.value.id]
  
  if (summary) {
    summaryText.value = summary
  } else {
    summaryText.value = `📋 **Resumo da Conversa — ${selectedChat.value.name}**\n\n• Interesse: ${selectedChat.value.estagiokanbam || 'Não informado'}\n• Status: Em análise\n• Temperatura: ⚪ Frio — aguardando mais interação\n• Próximo passo: Continuar qualificação via IA`
  }

  summaryLoading.value = false
}

// Mask phone number
const maskPhone = (phone: string) => {
  if (!phone) return ''
  if (phoneBlurred.value) {
    return phone.slice(0, 4) + '•••••' + phone.slice(-2)
  }
  return phone
}

// Actions
const toggleAI = async () => {
  if (!selectedChat.value) return
  const newVal = !selectedChat.value.Ativado
  selectedChat.value.Ativado = newVal
  await supabase.from('leads').update({ agent_active: newVal }).eq('id', selectedChat.value.id)
}

const updateStatus = async () => {
  if (!selectedChat.value) return
  await supabase.from('leads').update({ stage: selectedChat.value.estagiokanbam }).eq('id', selectedChat.value.id)
}

onMounted(() => {
  fetchChats()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<template>
  <div class="h-screen w-full bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans flex overflow-hidden transition-colors duration-300">
    <Sidebar />

    <!-- Chat Sidebar (Left) -->
    <aside :class="[mainMargin, 'w-80 border-r border-gray-100 dark:border-dark-border flex flex-col bg-white dark:bg-dark-surface flex-shrink-0 transition-all duration-300']">
      <!-- Header -->
      <div class="p-5 border-b border-gray-100 dark:border-dark-border">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Conversas</h2>
          <!-- Phone Blur Toggle -->
          <button 
            @click="phoneBlurred = !phoneBlurred"
            :class="['p-1.5 rounded-lg transition-colors border', phoneBlurred ? 'text-gray-400 border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card' : 'text-primary-500 bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20']"
            :title="phoneBlurred ? 'Mostrar telefones' : 'Ocultar telefones'"
          >
            <EyeOff v-if="phoneBlurred" class="w-3.5 h-3.5" />
            <Eye v-else class="w-3.5 h-3.5" />
          </button>
        </div>
        
        <!-- Global Handoff Number -->
        <div class="mb-3 p-2.5 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
          <div class="flex items-center gap-2 mb-1.5">
            <PhoneForwarded class="w-3 h-3 text-primary-500" />
            <span class="text-[10px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">Handoff Geral</span>
          </div>
          <div class="flex items-center gap-1.5">
            <input
              v-if="editingGlobalHandoff"
              v-model="globalHandoffNumber"
              @blur="editingGlobalHandoff = false"
              @keyup.enter="editingGlobalHandoff = false"
              class="flex-1 bg-white dark:bg-dark-surface border border-primary-200 dark:border-primary-500/30 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-400"
              autofocus
            />
            <span 
              v-else
              @click="editingGlobalHandoff = true"
              class="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary-500 transition-colors truncate"
            >
              {{ globalHandoffNumber }}
            </span>
            <button
              @click="editingGlobalHandoff = !editingGlobalHandoff"
              class="text-[10px] font-semibold text-primary-500 hover:text-primary-600 transition-colors px-1.5"
            >
              {{ editingGlobalHandoff ? 'Salvar' : 'Editar' }}
            </button>
          </div>
        </div>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar conversas..."
            class="w-full bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30 transition-all"
          />
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-8 text-center text-gray-400 dark:text-dark-muted text-sm">
          Carregando...
        </div>
        <div v-else-if="chats.length === 0" class="p-8 text-center text-gray-400 dark:text-dark-muted text-sm">
          Nenhuma conversa encontrada.
        </div>
        <button
          v-for="chat in chats"
          :key="chat.id"
          @click="selectChat(chat)"
          :class="[
            'w-full p-4 flex gap-3 border-b border-gray-50 dark:border-dark-border transition-all hover:bg-gray-50 dark:hover:bg-white/5',
            selectedChat?.id === chat.id ? 'bg-primary-50/50 dark:bg-primary-500/5 border-l-2 border-l-primary-500' : ''
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {{ chat.avatar }}
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate text-sm">{{ chat.name }}</h3>
                <span v-if="chat.is_qualified" class="text-[9px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20 flex-shrink-0 whitespace-nowrap">qualificado</span>
              </div>
              <span class="text-[10px] text-gray-400 dark:text-dark-muted flex-shrink-0">{{ chat.timestamp }}</span>
            </div>
            <p class="text-xs text-gray-400 dark:text-dark-muted truncate flex items-center gap-1">
              <span v-if="chat.lastSender === 'me'" class="text-[12px] font-bold text-gray-400 mb-0.5">•</span>
              <span class="truncate">{{ chat.lastMessage }}</span>
            </p>
          </div>
        </button>
      </div>
    </aside>

    <!-- Chat Content (Middle) -->
    <section class="flex-1 flex flex-col bg-gray-50 dark:bg-dark-bg relative min-w-0 transition-colors duration-300">
      <div v-if="selectedChat" class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Header -->
        <header class="px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-between z-20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              {{ selectedChat.avatar }}
            </div>
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white text-sm">{{ selectedChat.name }}</h2>
              <p class="text-xs text-gray-400 dark:text-dark-muted flex items-center gap-1">
                <Phone class="w-3 h-3" />
                {{ maskPhone(selectedChat.phone) }}
                <button 
                  @click="phoneBlurred = !phoneBlurred" 
                  class="ml-1 text-gray-400 hover:text-primary-500 transition-colors"
                  :title="phoneBlurred ? 'Mostrar número' : 'Ocultar número'"
                >
                  <EyeOff v-if="phoneBlurred" class="w-3 h-3" />
                  <Eye v-else class="w-3 h-3" />
                </button>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <NuxtLink 
              :to="`/crm?clientId=${selectedChat.id}`"
              class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-dark-card text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-dark-border transition-all border border-gray-100 dark:border-dark-border"
            >
              <FileText class="w-3 h-3" /> Ver no CRM
            </NuxtLink>

            <button 
              @click="isSidebarOpen = !isSidebarOpen"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors hover:bg-gray-50 dark:hover:bg-dark-card rounded-lg"
              title="Ações"
            >
              <Menu class="w-5 h-5" v-if="!isSidebarOpen" />
              <X class="w-5 h-5" v-else />
            </button>
          </div>
        </header>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-4 relative custom-scrollbar pb-24">
          <div v-if="messagesLoading" class="flex-1 flex items-center justify-center">
             <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
          <div v-else-if="messages.length === 0" class="flex-1 flex items-center justify-center">
             <p class="text-gray-400 dark:text-dark-muted text-sm">Nenhuma mensagem encontrada nesta sessão.</p>
          </div>
          <div
            v-else
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.isSystem ? 'justify-center my-2' : (message.sender === 'me' ? 'justify-end' : 'justify-start')
            ]"
          >
            <!-- Renderização das chamadas de Banco/Ferramentas do N8N -->
            <div
              v-if="message.isSystem"
              class="px-3 py-1.5 bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full text-[10px] text-gray-500 dark:text-dark-muted shadow-sm flex items-center gap-1.5"
            >
               <Bot class="w-3.5 h-3.5 text-primary-500" />
               <span class="font-medium tracking-wide">Ação de IA:</span> {{ message.systemAction }}
            </div>

            <!-- Balão de conversa normal -->
            <div
              v-else
              :class="[
                'max-w-md px-4 py-3 rounded-2xl shadow-sm overflow-hidden shrink-0',
                message.sender === 'me' 
                  ? 'bg-primary-500 text-white rounded-br-none' 
                  : 'bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-dark-border rounded-bl-none'
              ]"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">{{ message.text }}</p>
              <p v-if="message.timestamp" :class="['text-[10px] mt-1 text-right', message.sender === 'me' ? 'text-white/70' : 'text-gray-400 dark:text-dark-muted']">
                {{ message.timestamp }}
              </p>
            </div>
          </div>

          <!-- Summary Result -->
          <Transition name="fade">
            <div v-if="showSummary" class="bg-white dark:bg-dark-surface border border-primary-100 dark:border-primary-500/20 rounded-xl p-5 shadow-card">
              <div class="flex items-center gap-2 mb-3">
                <FileText class="w-4 h-4 text-primary-500" />
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Resumo Gerado pela IA</h4>
              </div>
              <div v-if="summaryLoading" class="flex items-center gap-2 text-sm text-gray-400">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                Analisando conversa...
              </div>
              <p v-else class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{{ summaryText }}</p>
            </div>
          </Transition>
        </div>

        <!-- Floating Action: Generate Summary -->
        <div class="absolute bottom-20 right-6 z-30">
           <button 
             @click="generateSummary"
             :disabled="summaryLoading"
             class="bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-card border border-gray-200 dark:border-dark-border shadow-card-hover text-gray-900 dark:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
           >
             <FileText class="w-4 h-4 text-primary-500" /> 
             {{ summaryLoading ? 'Gerando...' : 'Gerar Resumo' }}
           </button>
        </div>

        <!-- Footer -->
        <footer class="p-4 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface z-20">
          <div class="bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 px-4 py-2.5 rounded-xl text-xs text-center font-medium">
            O envio de mensagens deve ser feito via WhatsApp ou automação externa.
          </div>
        </footer>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-dark-muted p-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl flex items-center justify-center mb-5">
          <MessageSquare class="w-8 h-8 opacity-30" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Selecione uma conversa</h2>
        <p class="text-center max-w-xs text-sm">Escolha um lead à esquerda para visualizar o histórico da conversa.</p>
      </div>
    </section>

    <!-- Side Actions Drawer (Right) -->
    <aside 
      v-if="isSidebarOpen && selectedChat" 
      class="w-72 border-l border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col flex-shrink-0 transition-colors"
    >
      <div class="p-5 border-b border-gray-100 dark:border-dark-border">
        <h2 class="font-bold text-gray-900 dark:text-white text-base">Ações</h2>
      </div>

      <div class="p-5 flex flex-col gap-6 flex-1 overflow-y-auto">
        <!-- AI Toggle -->
        <div>
          <label class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-2 block font-semibold">IA Automática</label>
          <button 
            @click="toggleAI"
            :class="[
              'w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all border text-sm',
              selectedChat.Ativado 
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 border-primary-100 dark:border-primary-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-100 border-amber-100 dark:border-amber-500/20' 
            ]"
          >
            <BotOff class="w-4 h-4" v-if="!selectedChat.Ativado" />
            <Bot class="w-4 h-4" v-else />
            {{ selectedChat.Ativado ? 'Ativada' : 'Desativada' }}
          </button>
        </div>

        <!-- Status -->
        <div>
          <label class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-2 block font-semibold">Status CRM</label>
          <div class="relative">
            <select 
              v-model="selectedChat.estagiokanbam" 
              @change="updateStatus"
              class="w-full bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-3 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30 appearance-none"
            >
              <option value="novo">Novo</option>
              <option value="contato">Contato</option>
              <option value="qualificando">Qualificando</option>
              <option value="Engajado">Engajado</option>
              <option value="qualificado">Qualificado</option>
              <option value="agendado">Agendado</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
               <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>
        </div>

        <!-- Handoff Number -->
        <div>
          <label class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-2 block font-semibold">
            <PhoneForwarded class="w-3 h-3 inline mr-1" /> Número de Handoff
          </label>
          <div v-if="editingHandoff" class="flex gap-2">
            <input 
              v-model="handoffNumber" 
              type="text"
              class="flex-1 bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30"
              placeholder="+55 11 99999-0000"
            />
            <button 
              @click="editingHandoff = false"
              class="px-3 py-2 bg-primary-500 text-white rounded-xl text-xs font-medium hover:bg-primary-600 transition-colors"
            >
              OK
            </button>
          </div>
          <button 
            v-else
            @click="editingHandoff = true"
            class="w-full bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl p-3 text-sm text-left font-mono text-gray-700 dark:text-gray-300 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors flex items-center justify-between"
          >
            <span>{{ handoffNumber }}</span>
            <span class="text-[10px] text-primary-500 font-sans font-medium">Editar</span>
          </button>
          <p class="text-[10px] text-gray-400 dark:text-dark-muted mt-1.5">Número para transferência quando IA finalizar qualificação.</p>
        </div>

        <!-- Generate Summary -->
        <div>
          <label class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-2 block font-semibold">Resumo</label>
          <button 
            @click="generateSummary"
            :disabled="summaryLoading"
            class="w-full bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border border border-gray-100 dark:border-dark-border text-gray-900 dark:text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all text-sm disabled:opacity-50"
          >
            <FileText class="w-4 h-4 text-primary-500" /> 
            {{ summaryLoading ? 'Gerando...' : 'Gerar Resumo' }}
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #E5E7EB #F9FAFB;
}
:global(.dark) .custom-scrollbar {
  scrollbar-color: #1F2937 #0B0F1A;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #F9FAFB;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
  background: #0B0F1A;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #E5E7EB;
  border-radius: 4px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #1F2937;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
