'use client'

import { useEffect, useState } from 'react'
import ShaderCanvas from '@/components/ShaderCanvas'
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

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
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
    </div>
  )
}
