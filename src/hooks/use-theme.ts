import { useEffect } from 'react'
import { useUiStore } from '@/store/ui-store'

export function useApplyTheme() {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
}
