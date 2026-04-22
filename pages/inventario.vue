<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Trash2, Search, Car, X, Save, UploadCloud } from 'lucide-vue-next'
import { useSupabaseClient } from '#imports'
import Sidebar from '~/components/Sidebar.vue'

const { mainMargin } = useSidebarState()
const supabase = useSupabaseClient()

// State
const vehicles = ref<any[]>([])
const loadingList = ref(true)
const searchQuery = ref('')

// Modal state
const showModal = ref(false)
const isSaving = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)

const formData = ref({
  brand: '',
  model: '',
  year: '',
  km: '',
  color: '',
  price: '',
  description: '',
  is_available: true
})

const selectedFile = ref<File | null>(null)
const previewImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const fetchVehicles = async () => {
  loadingList.value = true
  try {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    vehicles.value = data || []
  } catch (error) {
    console.error('Erro ao listar veículos:', error)
  } finally {
    loadingList.value = false
  }
}

onMounted(() => {
  fetchVehicles()
})

const filteredVehicles = computed(() => {
  if (!searchQuery.value) return vehicles.value
  const query = searchQuery.value.toLowerCase()
  return vehicles.value.filter(v => 
    v.brand?.toLowerCase().includes(query) || 
    v.model?.toLowerCase().includes(query)
  )
})

const openCreateModal = () => {
  modalMode.value = 'create'
  editingId.value = null
  formData.value = { brand: '', model: '', year: '', km: '', color: '', price: '', description: '', is_available: true }
  selectedFile.value = null
  previewImage.value = null
  showModal.value = true
}

const formatCurrency = (value: string | number) => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number') {
    value = value.toFixed(2)
  }
  const numericString = String(value).replace(/\D/g, '')
  if (!numericString) return ''
  const numericValue = Number(numericString) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)
}

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  formData.value.price = formatCurrency(target.value)
}

const openEditModal = (vehicle: any) => {
  modalMode.value = 'edit'
  editingId.value = vehicle.id
  formData.value = {
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year ? String(vehicle.year) : '',
    km: vehicle.km ? String(vehicle.km) : '',
    color: vehicle.color || '',
    price: vehicle.price ? formatCurrency(vehicle.price) : '',
    description: vehicle.description || '',
    is_available: vehicle.is_available ?? true
  }
  selectedFile.value = null
  
  // Extrair imagem do JSON
  if (vehicle.photo_urls && Array.isArray(vehicle.photo_urls) && vehicle.photo_urls.length > 0) {
      previewImage.value = vehicle.photo_urls[0]
  } else {
      previewImage.value = null
  }
  
  showModal.value = true
}

const closeModal = () => {
  if (isSaving.value) return
  showModal.value = false
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const parseNumericPrice = (value: string | number) => {
  if (!value) return 0
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

const handleSave = async () => {
  if (!formData.value.brand || !formData.value.model || !formData.value.price) {
    alert('Preencha a marca, modelo e o preço!')
    return
  }
  
  isSaving.value = true
  try {
    let finalImageUrl = previewImage.value && !previewImage.value.startsWith('blob:') ? previewImage.value : null
    
    // Upload da imagem se houver novo arquivo
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('img')
        .upload(`uploads/${fileName}`, selectedFile.value, {
           cacheControl: '3600',
           upsert: false
        })
        
      if (uploadError) throw uploadError
      
      // Coletar URL pública
      const { data: publicUrlData } = supabase.storage.from('img').getPublicUrl(uploadData.path)
      finalImageUrl = publicUrlData.publicUrl
    }

    const payload = {
      brand: formData.value.brand,
      model: formData.value.model,
      year: parseInt(formData.value.year) || null,
      km: parseInt(formData.value.km) || null,
      color: formData.value.color,
      price: parseNumericPrice(formData.value.price),
      description: formData.value.description,
      is_available: formData.value.is_available,
      photo_urls: finalImageUrl ? [finalImageUrl] : []
    }

    // Inserir ou Dar Update na tabela vehicles
    if (modalMode.value === 'create') {
      // Como o id é text e a PK no schema_dump não tem DEFAULT (no seu create table tá "id text not null constraint vehicles_pkey primary key"),
      // se não for auto-incrementado, precisamos gerar um uuid no payload, ou usar crypto.randomUUID()
      // Se a tabela tem um trigger ou padrão não mostrado no print, ele vai assumir. Para prevenir:
      const newId = crypto.randomUUID()
      const { error } = await supabase.from('vehicles').insert({ id: newId, ...payload })
      if (error) throw error
    } else if (modalMode.value === 'edit' && editingId.value) {
      const { error } = await supabase.from('vehicles').update(payload).eq('id', editingId.value)
      if (error) throw error
    }
    
    await fetchVehicles()
    isSaving.value = false 
    closeModal()
  } catch (err: any) {
    console.error('Erro ao salvar veículo:', err)
    alert('Erro ao salvar: ' + err.message)
    isSaving.value = false
  }
}

const confirmDelete = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error
      vehicles.value = vehicles.value.filter(v => v.id !== id)
    } catch (e) {
      console.error(e)
      alert('Erro ao deletar veículo.')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
    <Sidebar />

    <main :class="[mainMargin, 'p-10 min-h-screen flex flex-col transition-all duration-300']">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold font-serif text-gray-900 dark:text-white tracking-wide">Pátio / Estoque</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Gerencie os veículos disponíveis na concessionária.</p>
        </div>
        <button @click="openCreateModal" class="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-sm hover:bg-primary-600 transition-colors shadow-luxury">
          <Plus class="w-4 h-4" />
          <span class="font-semibold uppercase tracking-widest text-xs">Novo Veículo</span>
        </button>
      </div>

      <!-- Search / Filter bar -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar veículo (Marca ou Modelo)..." 
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-sm leading-5 bg-white dark:bg-dark-surface/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors shadow-sm dark:shadow-none"
          >
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-dark-surface/50 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-sm overflow-hidden shadow-card dark:shadow-2xl">
        <div class="overflow-x-auto relative min-h-[300px]">
          
          <div v-if="loadingList" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-dark-bg/50 backdrop-blur-sm">
             <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent flex-shrink-0 animate-spin rounded-full"></div>
             <p class="mt-3 text-sm font-semibold text-gray-500">Sincronizando com o Pátio...</p>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-white/5">
                <th class="py-4 px-6 font-semibold">Veículo & Capa</th>
                <th class="py-4 px-6 font-semibold">Detalhes</th>
                <th class="py-4 px-6 font-semibold">Preço</th>
                <th class="py-4 px-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-white/5 text-gray-600 dark:text-gray-300 text-sm">
              <tr v-for="vehicle in filteredVehicles" :key="vehicle.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-12 rounded-sm overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                      <img v-if="vehicle.photo_urls && vehicle.photo_urls[0]" :src="vehicle.photo_urls[0]" class="w-full h-full object-cover" />
                      <Car v-else class="w-5 h-5 opacity-50" />
                    </div>
                    <div>
                      <p class="text-gray-900 dark:text-white font-medium">{{ vehicle.brand }} {{ vehicle.model }}</p>
                      <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                         <span :class="vehicle.is_available ? 'text-green-500 font-bold' : 'text-red-500'">
                           {{ vehicle.is_available ? 'Disponível' : 'Vendido/Indisponível' }}
                         </span>
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div class="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                     <span><strong>Ano:</strong> {{ vehicle.year || 'N/A' }}</span>
                     <span><strong>Km:</strong> {{ vehicle.km ? vehicle.km.toLocaleString('pt-BR') + ' km' : '0 km' }}</span>
                     <span><strong>Cor:</strong> {{ vehicle.color || 'N/A' }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 font-medium text-gray-900 dark:text-white">R$ {{ Number(vehicle.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</td>
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal(vehicle)" class="p-2 text-gray-400 hover:text-primary-500 transition-colors rounded-sm hover:bg-gray-100 dark:hover:bg-white/5" title="Editar">
                      <Edit class="w-4 h-4" />
                    </button>
                    <button @click="confirmDelete(vehicle.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-sm hover:bg-gray-100 dark:hover:bg-white/5" title="Excluir">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!loadingList && filteredVehicles.length === 0">
                <td colspan="4" class="py-12 text-center text-gray-400 dark:text-gray-500">
                  <Car class="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>O pátio está vazio ou nenhum veículo bate com a busca.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal CRUD -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative z-10 pointer-events-auto bg-white dark:bg-dark-card w-full max-w-2xl rounded-sm shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-card z-10">
          <h2 class="text-xl font-serif font-bold text-gray-900 dark:text-white">
            {{ modalMode === 'create' ? 'Cadastrar Veículo' : 'Atualizar Veículo' }}
          </h2>
          <button @click="closeModal" :disabled="isSaving" class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Imagem de Capa (Upload via Storage) -->
             <div class="md:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Foto de Capa do Veículo</label>
              
              <div 
                 @click="fileInput?.click()" 
                 class="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-white/10 border-dashed rounded-md cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
               >
                <div class="space-y-1 text-center">
                  <div v-if="previewImage" class="mb-4">
                     <img :src="previewImage" class="mx-auto h-32 w-auto object-cover rounded-sm shadow-sm" />
                  </div>
                  <UploadCloud v-else class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <span class="relative cursor-pointer bg-transparent rounded-md font-medium text-primary-500 hover:text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Clique aqui para selecionar uma foto</span>
                      <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="handleFileSelect">
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Marca -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Marca</label>
              <input v-model="formData.brand" type="text" placeholder="Ex: Porsche" class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
            </div>

            <!-- Modelo -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Modelo</label>
              <input v-model="formData.model" type="text" placeholder="Ex: 911 Carrera S" class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
            </div>

            <!-- Ano -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Ano</label>
              <input v-model="formData.year" type="number" placeholder="2024" class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
            </div>

            <!-- KM -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Km Rodados</label>
              <input v-model="formData.km" type="number" placeholder="15000" class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
            </div>

            <!-- Cor -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Cor Interna / Externa</label>
              <input v-model="formData.color" type="text" placeholder="Preto / Vermelho" class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
            </div>

            <!-- Preço -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Preço (R$)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400 sm:text-sm">R$</span>
                </div>
                <input :value="formData.price" @input="handlePriceInput" type="text" placeholder="0,00" class="w-full pl-9 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500">
              </div>
            </div>

            <!-- Toggle Em Estoque -->
            <div class="md:col-span-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface/50 border border-gray-200 dark:border-white/10 rounded-sm">
              <div>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">Veículo no Pátio / Em Estoque?</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Se desativado, ficará marcado como Vendido/Indisponível no sistema.</p>
              </div>
              <button
                type="button"
                @click="formData.is_available = !formData.is_available"
                :class="formData.is_available ? 'bg-primary-500' : 'bg-red-500'"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              >
                <span
                  :class="formData.is_available ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                />
              </button>
            </div>

            <!-- Descrição (Opcional) -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Observações Adicionais</label>
              <textarea v-model="formData.description" rows="3" placeholder="Opcionais, histórico de dono, blindagem..." class="w-full bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"></textarea>
            </div>

          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-surface/50 flex justify-end gap-3 sticky bottom-0">
          <button @click="closeModal" :disabled="isSaving" class="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 rounded-sm transition-colors uppercase tracking-widest disabled:opacity-50">
            Cancelar
          </button>
          <button @click="handleSave" :disabled="isSaving" class="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-sm transition-colors shadow-luxury uppercase tracking-widest disabled:opacity-50">
            <template v-if="isSaving">
               <div class="w-4 h-4 border-2 border-white border-t-transparent flex-shrink-0 animate-spin rounded-full"></div>
               Salvando...
            </template>
            <template v-else>
               <Save class="w-4 h-4" />
               Salvar Veículo
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
