export function usePanelistDashboard() {
  const loading = useState<boolean>('panelist:loading', () => false)

  return {
    loading: readonly(loading)
  }
}
