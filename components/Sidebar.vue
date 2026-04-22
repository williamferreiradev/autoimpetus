<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { 
  LayoutDashboard, 
  KanbanSquare, 
  MessageSquare, 
  Users, 
  BarChart3, 
  LogOut,
  Building,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Globe,
  Settings,
  Car,
  CalendarDays
} from 'lucide-vue-next'

const router = useRouter()
const { isCollapsed, toggleSidebar } = useSidebarState()
const user = { user_metadata: { full_name: 'Usuário Demo' } }
const supabase = useSupabaseClient()

const leadsCount = ref(0)
const clinicId = ref<string | null>(null)
let realtimeChannel: any

const fetchLeadsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      
    if (!error && count !== null) {
      leadsCount.value = count
    }
  } catch (err) {
    console.error('Error fetching leads count:', err)
  }
}

const fetchClinicId = async () => {
  try {
    const { data: rpcData } = await supabase.rpc('get_auth_clinic_id')
    if (rpcData) { clinicId.value = rpcData; return }

    const { data: sessionData } = await supabase.auth.getUser()
    if (sessionData?.user?.user_metadata?.clinic_id) {
      clinicId.value = sessionData.user.user_metadata.clinic_id; return
    }

    const { data: leadData } = await supabase.from('leads').select('clinic_id').limit(1).single()
    if (leadData) clinicId.value = leadData.clinic_id
  } catch (err) {
    console.error('Erro ao buscar clinic_id:', err)
  }
}

onMounted(() => {
  fetchLeadsCount()
  fetchClinicId()
  
  realtimeChannel = supabase.channel('sidebar_leads_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      () => {
        fetchLeadsCount()
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

const navigation = computed(() => [
  { name: 'PRINCIPAL', items: [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { name: 'Negociações', icon: KanbanSquare, route: '/crm', badge: leadsCount.value > 0 ? String(leadsCount.value) : undefined },
    { name: 'Contatos', icon: Users, route: '/contatos' },
    { name: 'Visitas', icon: CalendarDays, route: '/agenda' },
  ]},
  { name: 'GESTÃO', items: [
    { name: 'Pátio', icon: Car, route: '/inventario' },
    { name: 'Conversas', icon: MessageSquare, route: '/chats' },
    { name: 'Relatórios', icon: BarChart3, route: '/relatorios' },
    { name: 'Reativar Interessados', icon: RefreshCw, route: '/reativacao' },
  ]},
  { name: 'ADMINISTRAÇÃO', items: [
    { name: 'Catálogo Público', icon: Globe, route: '/catalogo', external: true },
    { name: 'Configurações', icon: Settings, route: '/configuracoes' },
  ]}
])

const handleLogout = async () => {
  router.push('/login')
}
</script>

<template>
  <aside 
    :class="[
      'h-screen bg-white/80 dark:bg-dark-bg/80 backdrop-blur-2xl border-r border-gray-100 dark:border-dark-border flex flex-col fixed left-0 top-0 overflow-hidden z-50 sidebar-transition',
      isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <!-- Header / Logo -->
    <div class="h-[72px] flex items-center border-b border-gray-100 dark:border-dark-border" :class="isCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'">
      <div class="flex items-center gap-3 group cursor-pointer" :class="isCollapsed ? 'justify-center' : ''">
         <div class="w-10 h-10 rounded-sm bg-primary-500 flex items-center justify-center shadow-luxury sidebar-transition group-hover:scale-105 flex-shrink-0">
            <Building class="w-5 h-5 text-white" />
         </div>
         <div v-if="!isCollapsed" class="sidebar-text-transition overflow-hidden">
           <span class="text-gray-900 dark:text-white font-bold text-lg tracking-tight block whitespace-nowrap">AutoOS</span>
           <span class="text-[11px] text-gray-400 dark:text-dark-muted font-medium whitespace-nowrap uppercase tracking-wider">Dealership</span>
         </div>
      </div>
      <button 
        @click="toggleSidebar"
        class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 sidebar-transition"
        :title="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
      >
        <ChevronsLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronsRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto py-6" :class="isCollapsed ? 'px-3' : 'px-4'">
      <div v-for="section in navigation" :key="section.name" class="mb-6">
        <h3 
          v-if="!isCollapsed" 
          class="text-[10px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-[0.15em] px-4 mb-3 sidebar-text-transition"
        >
          {{ section.name }}
        </h3>
        <div v-else class="h-px bg-gray-100 dark:bg-dark-border mb-3 mx-2"></div>
        
        <ul class="space-y-1">
          <li v-for="item in section.items" :key="item.name">
            <NuxtLink 
              :to="item.route" 
              :class="[
                'flex items-center rounded-sm text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-white/5 sidebar-transition group relative border-l-2 border-transparent',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
              ]"
              active-class="!text-primary-500 !border-primary-500 !font-semibold bg-gray-50/20 dark:bg-white/5"
              :title="isCollapsed ? item.name : undefined"
              :target="(item as any).external ? '_blank' : undefined"
            >
              <component 
                :is="item.icon" 
                class="w-[18px] h-[18px] sidebar-transition flex-shrink-0" 
              />
              
              <span v-if="!isCollapsed" class="flex-1 sidebar-text-transition">{{ item.name }}</span>

              <!-- Badge -->
              <span 
                v-if="item.badge && !isCollapsed" 
                class="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
              >
                {{ item.badge }}
              </span>

              <!-- Collapsed badge dot -->
              <span 
                v-if="item.badge && isCollapsed" 
                class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"
              ></span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="px-4 py-2 border-t border-gray-100 dark:border-dark-border flex" :class="isCollapsed ? 'justify-center' : 'justify-end'">
      <ThemeToggle />
    </div>

    <!-- Footer / User Profile + Collapse -->
    <div class="p-4 border-t border-gray-100 dark:border-dark-border">
      <div 
        :class="[
          'flex items-center rounded-sm hover:bg-gray-50 dark:hover:bg-white/5 sidebar-transition group',
          isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'
        ]"
      >
        <!-- Avatar -->
        <div class="w-9 h-9 rounded-sm bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
          {{ user?.user_metadata?.full_name?.charAt(0) || 'U' }}
        </div>
        
        <template v-if="!isCollapsed">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ user?.user_metadata?.full_name || 'Usuário' }}
            </p>
            <p class="text-xs text-gray-400 dark:text-dark-muted">Admin</p>
          </div>

          <button @click="handleLogout" class="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-sm sidebar-transition" title="Sair">
            <LogOut class="w-4 h-4" />
          </button>
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-transition {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-text-transition {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
</style>
