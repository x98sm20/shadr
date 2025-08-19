'use client'

import { useEffect, useState } from 'react'
import ShaderCanvas from '@/components/ShaderCanvas'
import Clock from '@/components/Clock'
import ThemeInputHandler from '@/components/ThemeInputHandler'

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Prevent all scroll events
    const preventScroll = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const preventKeyboardScroll = (e: KeyboardEvent) => {
      // Prevent arrow keys, page up/down, home, end, space
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]
      if (scrollKeys.includes(e.keyCode)) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    updateDimensions()
    
    // Add event listeners
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('scroll', preventScroll, { passive: false })
    window.addEventListener('keydown', preventKeyboardScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('scroll', preventScroll, { passive: false })
    document.addEventListener('keydown', preventKeyboardScroll, { passive: false })

    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('scroll', preventScroll)
      window.removeEventListener('keydown', preventKeyboardScroll)
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('scroll', preventScroll)
      document.removeEventListener('keydown', preventKeyboardScroll)
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-black overflow-hidden" style={{ margin: 0, padding: 0, backgroundColor: '#000000' }}>
      {/* Theme Input Handler */}
      <ThemeInputHandler />
      
      {/* Full Screen Shader Canvas */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <ShaderCanvas 
          size={Math.max(dimensions.width, dimensions.height)} 
          className="w-screen h-screen"
        />
      </div>
      
      {/* Clock with Weather - Centered Middle */}
      <div 
        className="absolute inset-0 flex items-center justify-center" 
        style={{ 
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          pointerEvents: 'none'
        }}
      >
        <Clock />
      </div>
    </div>
  )
}
