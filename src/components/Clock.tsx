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
    <div className="flex items-center justify-center w-full h-full">
      <h1 
        className={`font-bold select-none ${className}`}
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'clamp(4rem, 15vw, 12rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
          zIndex: 1000,
          position: 'relative',
          margin: 0,
          padding: 0,
          lineHeight: 1
        }}
      >
        {hours}:{minutes}
      </h1>
    </div>
  )
}
