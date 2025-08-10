'use client'

import { useEffect, useState } from 'react'
import ShaderCanvas from '@/components/ShaderCanvas'

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
    <div className="w-screen h-screen bg-background overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Full screen shader canvas */}
      <ShaderCanvas 
        size={Math.max(dimensions.width, dimensions.height)} 
        className="w-screen h-screen absolute top-0 left-0"
      />
    </div>
  )
}
