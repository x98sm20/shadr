'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to ensure proper detection
    const checkInstallation = () => {
      // More comprehensive PWA detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true
      const isInWebAppChrome = window.matchMedia('(display-mode: fullscreen)').matches
      const isInMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
      
      // Check URL parameters for PWA launch
      const isPWALaunch = window.location.search.includes('source=pwa') || 
                         window.location.search.includes('utm_source=homescreen')
      
      // More robust detection
      const isActuallyInstalled = isStandalone || isInWebAppiOS || isInWebAppChrome || 
                                 isInMinimalUI || isPWALaunch ||
                                 (window.outerHeight === window.innerHeight) // Full screen detection

      if (isActuallyInstalled) {
        setIsInstalled(true)
        setIsLoading(false)
        return
      }

      // For mobile devices, always show the button since beforeinstallprompt isn't always reliable
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = userAgent.includes('mobile') || userAgent.includes('android') || 
                      userAgent.includes('iphone') || userAgent.includes('ipad')
      
      if (isMobile) {
        setShowInstallButton(true)
      }
      
      setIsLoading(false)
    }

    // Listen for the beforeinstallprompt event (mainly for desktop Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    // Check installation status after a brief delay
    setTimeout(checkInstallation, 100)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for browsers that don't support the install prompt
      const userAgent = navigator.userAgent.toLowerCase()
      let instructions = ''
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = 'To install:\n1. Tap the Share button (⬆️)\n2. Select "Add to Home Screen"'
      } else if (userAgent.includes('android')) {
        instructions = 'To install:\n1. Tap the menu (⋮)\n2. Select "Add to Home screen" or "Install app"'
      } else {
        instructions = 'To install:\n1. Look for the install icon (⊕) in your address bar\n2. Click "Install Shadr"'
      }
      
      alert(instructions)
      return
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallButton(false)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  // Don't show the button if already installed or still loading
  if (isInstalled || isLoading) {
    return null
  }

  // Only show if we have a reason to show it
  if (!showInstallButton && !deferredPrompt) {
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      onTouchStart={() => {}} // Ensures touch events work on mobile
      className="fixed top-4 right-4 z-[10000] bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 active:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg touch-manipulation"
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {deferredPrompt ? '📱 Install App' : '📱 Add to Home'}
    </button>
  )
}