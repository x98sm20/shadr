'use client'

import { useState, useEffect, useCallback } from 'react'

interface WeatherData {
  temperature: number
  location: string
  description: string
}

interface WeatherProps {
  className?: string
}

export default function Weather({ className = '' }: WeatherProps) {
  const [mounted, setMounted] = useState(false)
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 25,
    location: 'Bangalore, India',
    description: 'Clear'
  })
  const [loading, setLoading] = useState(true)

  // Bangalore coordinates as fallback
  const BANGALORE_COORDS = { lat: 12.9716, lon: 77.5946 }

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      // Using OpenWeatherMap API - you'll need to add API key to environment variables
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      if (!API_KEY) {
        // Fallback to Bangalore data if no API key
        setWeather({
          temperature: 26,
          location: 'Bangalore, India',
          description: 'Partly Cloudy'
        })
        setLoading(false)
        return
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      
      if (response.ok) {
        const data = await response.json()
        setWeather({
          temperature: Math.round(data.main.temp),
          location: `${data.name}, ${data.sys.country}`,
          description: data.weather[0].description
        })
      } else {
        throw new Error('Weather API failed')
      }
    } catch {
      console.log('Weather fetch failed, using Bangalore fallback')
      // Fallback to Bangalore
      setWeather({
        temperature: 26,
        location: 'Bangalore, India',
        description: 'Partly Cloudy'
      })
    }
    setLoading(false)
  }

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude)
        },
        () => {
          console.log('Geolocation denied or failed, using Bangalore fallback')
          // Fallback to Bangalore if geolocation fails or is denied
          fetchWeatherData(BANGALORE_COORDS.lat, BANGALORE_COORDS.lon)
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // Cache for 5 minutes
        }
      )
    } else {
      console.log('Geolocation not supported, using Bangalore fallback')
      // Fallback to Bangalore if geolocation is not supported
      fetchWeatherData(BANGALORE_COORDS.lat, BANGALORE_COORDS.lon)
    }
  }, [BANGALORE_COORDS.lat, BANGALORE_COORDS.lon])

  useEffect(() => {
    setMounted(true)
    getUserLocation()
  }, [getUserLocation])

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
          lineHeight: 1,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          {weather.temperature}°C
        </p>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 2rem)', 
          fontWeight: 700, 
          margin: '8px 0 0 0',
          color: '#FFFFFF',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.02em',
          lineHeight: 1,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          {weather.location}
        </p>
      </div>
    </div>
  )
}
