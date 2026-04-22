<template>
  <button 
    :class="[
      'px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-transparent',
      variantClasses[variant],
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  disabled?: boolean
}>(), {
  variant: 'primary',
  disabled: false
})

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-luxury hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] tracking-wide',
  secondary: 'bg-transparent border border-gray-300 text-gray-900 hover:border-primary-500 dark:border-dark-border dark:text-white dark:hover:border-primary-500',
  ghost: 'bg-transparent text-gray-500 hover:text-black hover:bg-gray-100 dark:text-dark-muted dark:hover:text-white dark:hover:bg-white/5',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md'
}
</script>
