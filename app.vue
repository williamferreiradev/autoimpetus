<template>
  <div class="min-h-screen bg-[#FCFCF9] text-gray-900 dark:bg-dark-bg dark:text-dark-text font-sans transition-colors duration-300 selection:bg-primary-500 selection:text-black">
    <div class="fixed inset-0 pointer-events-none z-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-primary-900/10 dark:via-dark-bg dark:to-dark-bg opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#FCFCF9] to-[#F2EFE9]"></div>
    <div class="relative z-10 h-full">
      <NuxtPage />
    </div>
  </div>
</template>

<style>
:root {
  --app-bg: #f8fafc;
  --app-surface: #ffffff;
  --app-border: #e2e8f0;
}

html {
  background: var(--app-bg);
}

body {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(229, 57, 53, 0.05), transparent 26%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark body {
  background:
    radial-gradient(circle at top left, rgba(229, 57, 53, 0.08), transparent 22%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
}
</style>
