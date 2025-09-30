'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/store/themeStore'

export default function ThemeInputHandler() {
  const { nextTheme, setTransitioning } = useThemeStore()
  const isTransitioning = useRef(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Desktop: Just Spacebar
      if (event.code === 'Space' && !isTransitioning.current) {
        event.preventDefault()
        event.stopPropagation()
        switchTheme()
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      // Mobile: Touch/Tap
      if (!isTransitioning.current) {
        event.preventDefault()
        switchTheme()
      }
    }

    const switchTheme = async () => {
      if (isTransitioning.current) return
      
      isTransitioning.current = true
      setTransitioning(true)
      
      // Subtle transition delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      nextTheme()
      
      // Complete transition
      await new Promise(resolve => setTimeout(resolve, 400))
      
      setTransitioning(false)
      isTransitioning.current = false
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('touchstart', handleTouchStart, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [nextTheme, setTransitioning])

  return null // This component doesn't render anything
}
