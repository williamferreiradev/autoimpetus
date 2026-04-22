<template>
  <button 
    @click="toggleTheme" 
    class="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    :class="isDark ? 'border-dark-border bg-dark-card text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
    aria-label="Toggle Theme"
  >
    <!-- Sun Icon (shown in dark mode → click to go light) -->
    <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
    
    <!-- Moon Icon (shown in light mode → click to go dark) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
</template>

<script setup lang="ts">
const isDark = useState('theme', () => false) // Default to LIGHT mode

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateDOM()
}

const updateDOM = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  updateDOM()
})
</script>
