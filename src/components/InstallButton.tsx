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

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInWebAppChrome = window.matchMedia('(display-mode: fullscreen)').matches
    
    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
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

  // Don't show the button if already installed
  if (isInstalled) {
    return null
  }

  // Always show some form of install hint, even if no prompt available
  return (
    <button
      onClick={handleInstallClick}
      className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg"
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
      }}
    >
      {showInstallButton ? '📱 Install App' : '📱 Add to Home'}
    </button>
  )
}