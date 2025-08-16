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
    <h1 className={`text-white font-bold text-8xl text-center select-none ${className}`}>
      {hours}:{minutes}
    </h1>
  )
}
