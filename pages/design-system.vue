<template>
  <div class="p-10 max-w-7xl mx-auto space-y-12 transition-colors duration-300">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Design System</h1>
        <p class="text-gray-500 dark:text-dark-muted text-lg">Luxury & {{ isDark ? 'Dark' : 'Light' }} Theme Configuration</p>
      </div>
      <ThemeToggle />
    </div>

    <!-- Colors Section -->
    <section class="space-y-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border pb-2">Color Palette</h2>
      
      <!-- Primary Colors -->
      <div class="space-y-4">
        <h3 class="text-primary-500 font-medium tracking-wide text-sm uppercase">Primary Gold</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <div class="h-24 rounded-sm bg-primary-500 shadow-luxury"></div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-900 dark:text-white font-medium">Primary / 500</span>
              <span class="text-gray-500 dark:text-dark-muted">#C5A059</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-24 rounded-sm bg-primary-600"></div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-900 dark:text-white font-medium">Primary Hover / 600</span>
              <span class="text-gray-500 dark:text-dark-muted">#AF8E4E</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-24 rounded-sm bg-primary-glow border border-primary-500 border-dashed"></div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-900 dark:text-white font-medium">Glow Base</span>
              <span class="text-gray-500 dark:text-dark-muted">#C5A05940</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Scale -->
      <div class="space-y-4">
        <h3 class="text-gray-500 dark:text-dark-muted font-medium tracking-wide text-sm uppercase">Theme Scale</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="space-y-2">
            <div class="h-24 rounded-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border"></div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-900 dark:text-white font-medium">Background</span>
              <span class="text-gray-500 dark:text-dark-muted">Adaptive</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-24 rounded-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-sm"></div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-900 dark:text-white font-medium">Surface</span>
              <span class="text-gray-500 dark:text-dark-muted">Adaptive</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- UI Components -->
    <section class="space-y-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border pb-2">UI Components</h2>
      
      <div class="grid md:grid-cols-2 gap-16">
        <!-- Buttons -->
        <div class="space-y-6">
          <h3 class="text-gray-500 dark:text-dark-muted font-medium tracking-wide text-sm uppercase">Base Buttons</h3>
          <div class="flex flex-wrap gap-4 items-center">
            <BaseButton variant="primary" class="rounded-sm shadow-luxury">Primary Action</BaseButton>
            <BaseButton variant="secondary" class="rounded-sm">Secondary</BaseButton>
            <BaseButton variant="ghost" class="rounded-sm">Ghost Button</BaseButton>
          </div>
        </div>

        <!-- Inputs -->
        <div class="space-y-6">
          <h3 class="text-gray-500 dark:text-dark-muted font-medium tracking-wide text-sm uppercase">Base Inputs</h3>
          <div class="space-y-4 max-w-md">
            <BaseInput 
              modelValue="" 
              label="Email Address" 
              placeholder="Enter your email" 
              type="email" 
            />
             <BaseInput 
              modelValue="" 
              label="Password" 
              placeholder="••••••••" 
              type="password" 
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Typography -->
    <section class="space-y-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border pb-2">Typography</h2>
      <div class="space-y-4">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Heading 1 - Display</h1>
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Heading 2 - Title</h2>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Heading 3 - Section</h3>
        <p class="text-gray-500 dark:text-dark-muted max-w-2xl text-lg leading-relaxed font-light">
          Body text large. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p class="text-gray-500 dark:text-dark-muted max-w-2xl leading-relaxed font-light">
          Body text base. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p class="text-gray-400 dark:text-gray-600 text-sm font-light">
          Caption text. Excepteur sint occaecat cupidatat non proident.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Getting the state that was set by ThemeToggle
const isDark = useState('theme', () => true)
</script>
