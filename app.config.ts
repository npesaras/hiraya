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
        root: 'rounded-[var(--ui-radius)] border border-muted/80 bg-default/95 shadow-sm backdrop-blur-sm',
        header: 'px-5 py-4 sm:px-6',
        body: 'px-5 py-5 sm:px-6',
        footer: 'px-5 py-4 sm:px-6'
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
