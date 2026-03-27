export default defineAppConfig({
  ui: {
    colors: {
      primary: 'fsmes',
      secondary: 'sky',
      neutral: 'slate',
      success: 'green',
      info: 'sky',
      warning: 'amber',
      error: 'red'
    },
    icons: {
      loading: 'i-lucide-loader-circle'
    },
    button: {
      slots: {
        base: 'font-semibold'
      }
    },
    card: {
      slots: {
        root: 'rounded-[var(--ui-radius)] border border-muted/80 bg-default/95 shadow-[0_16px_40px_rgb(15_23_42_/_0.06)] backdrop-blur-sm',
        header: 'px-5 py-4 sm:px-6',
        body: 'px-5 py-5 sm:px-6',
        footer: 'px-5 py-4 sm:px-6'
      }
    },
    dashboardNavbar: {
      slots: {
        root: 'h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3 border-b border-default/80 bg-default/78 px-4 sm:px-6 xl:px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-default/70',
        right: 'flex items-center shrink-0 gap-2'
      }
    },
    dashboardPanel: {
      slots: {
        body: 'flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8'
      }
    },
    dashboardSidebar: {
      slots: {
        root: 'relative hidden lg:flex flex-col min-h-svh min-w-16 w-(--width) shrink-0 bg-default/88 backdrop-blur-xl',
        header: 'shrink-0 px-4 pt-4 sm:px-5',
        body: 'flex flex-col gap-4 flex-1 overflow-y-auto px-3 py-4 sm:px-5',
        footer: 'shrink-0 px-3 py-4 sm:px-5'
      }
    },
    input: {
      slots: {
        base: 'rounded-[var(--ui-radius)]'
      }
    },
    textarea: {
      slots: {
        base: 'rounded-[var(--ui-radius)]'
      }
    },
    badge: {
      slots: {
        base: 'font-semibold'
      }
    },
    progress: {
      slots: {
        indicator: 'rounded-full'
      }
    }
  }
})
