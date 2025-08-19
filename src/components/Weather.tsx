'use client'

import { useState, useEffect } from 'react'

interface WeatherProps {
  className?: string
}

export default function Weather({ className = '' }: WeatherProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className={`text-center ${className}`}>
      <div style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <p style={{ 
          fontSize: 'clamp(2rem, 6vw, 4rem)', 
          fontWeight: 900, 
          margin: 0,
          color: '#FFFFFF',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          letterSpacing: '-0.01em',
          lineHeight: 1
        }}>
          25°C
        </p>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 2rem)', 
          fontWeight: 700, 
          margin: '8px 0 0 0',
          color: '#FFFFFF',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.02em',
          lineHeight: 1
        }}>
          Dubai, UAE
        </p>
      </div>
    </div>
  )
}
