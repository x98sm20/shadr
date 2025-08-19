'use client'

import { useState, useEffect } from 'react'

interface ClockProps {
  className?: string
}

export default function Clock({ className = '' }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Prevent hydration mismatch by not rendering on server
  if (!mounted) {
    return null
  }

  const formatTime = (date: Date) => {
    return {
      hours: date.getHours().toString().padStart(2, '0'),
      minutes: date.getMinutes().toString().padStart(2, '0')
    }
  }

  const { hours, minutes } = formatTime(time)

  return (
    <div 
      className="flex flex-col items-center justify-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        position: 'relative',
        zIndex: 1000
      }}
    >
      {/* Time Display */}
      <div
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'clamp(4rem, 15vw, 12rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
          margin: 0,
          padding: 0,
          lineHeight: 1
        }}
      >
        {hours}:{minutes}
      </div>
      
      {/* Temperature Display */}
      <div
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.01em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          margin: 0,
          padding: 0,
          lineHeight: 1
        }}
      >
        25°C
      </div>
      
      {/* Location Display */}
      <div
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'clamp(1rem, 3vw, 2rem)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
          margin: 0,
          padding: 0,
          lineHeight: 1
        }}
      >
        Dubai, UAE
      </div>
    </div>
  )
}
