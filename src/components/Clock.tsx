'use client'

import { useState, useEffect } from 'react'

interface ClockProps {
  className?: string
}

interface LocationData {
  city: string
  country: string
}

interface WeatherData {
  temperature: number
  location: LocationData
  loading: boolean
  error: string | null
}

export default function Clock({ className = '' }: ClockProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    location: { city: 'Loading...', country: '' },
    loading: true,
    error: null
  })

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    // Get user location and weather data
    const fetchLocationAndWeather = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser')
        }

        // Get user coordinates
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000 // 5 minutes cache
          })
        })

        const { latitude, longitude } = position.coords

        // Get location name using BigDataCloud (free, no API key)
        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        
        if (!locationResponse.ok) {
          throw new Error('Failed to fetch location data')
        }
        
        const locationData = await locationResponse.json()
        
        // Get weather using Open-Meteo (free, no API key)
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`
        )
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather data')
        }
        
        const weatherData = await weatherResponse.json()

        // Update state with real data
        setWeather({
          temperature: Math.round(weatherData.current_weather.temperature),
          location: {
            city: locationData.city || locationData.locality || locationData.principalSubdivision || 'Unknown City',
            country: locationData.countryCode || locationData.countryName || ''
          },
          loading: false,
          error: null
        })

      } catch (error) {
        console.error('Error fetching location/weather:', error)
        
        // Fallback to a default location if geolocation fails
        setWeather({
          temperature: 25,
          location: { city: 'Location unavailable', country: '' },
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location'
        })
      }
    }

    fetchLocationAndWeather()

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
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          margin: 0,
          padding: 0,
          lineHeight: 1,
          opacity: weather.loading ? 0.6 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {weather.loading ? 'Loading...' : `${weather.temperature}°C`}
      </div>
      
      {/* Location Display */}
      <div
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'clamp(0.8rem, 2.5vw, 1.5rem)',
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
          margin: 0,
          padding: 0,
          lineHeight: 1,
          opacity: weather.loading ? 0.6 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {weather.loading 
          ? 'Getting location...' 
          : weather.error 
            ? 'Location unavailable'
            : `${weather.location.city}${weather.location.country ? `, ${weather.location.country}` : ''}`
        }
      </div>
    </div>
  )
}
