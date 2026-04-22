export const useSidebarState = () => {
    const isCollapsed = useState('sidebar-collapsed', () => false)

    const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value
    }

    const sidebarWidth = computed(() => isCollapsed.value ? 'w-20' : 'w-72')
    const mainMargin = computed(() => isCollapsed.value ? 'ml-20' : 'ml-72')

    return {
        isCollapsed,
        toggleSidebar,
        sidebarWidth,
        mainMargin
    }
}
