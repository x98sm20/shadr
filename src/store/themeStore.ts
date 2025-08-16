import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeConfig {
  id: number
  name: string
  shaderIndex: number // References shader from shaderStore
  colors: {
    primary: [number, number, number] // RGB values for shader uniforms
    secondary: [number, number, number]
    accent: [number, number, number]
  }
  description: string
}

interface ThemeStore {
  activeThemeIndex: number
  themes: ThemeConfig[]
  isTransitioning: boolean
  setActiveTheme: (index: number) => void
  nextTheme: () => void
  setTransitioning: (transitioning: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      activeThemeIndex: 0,
      isTransitioning: false,
      
      themes: [
        {
          id: 0,
          name: 'Monochrome',
          shaderIndex: 0, // Default liquid shader (old default)
          colors: {
            primary: [1.0, 1.0, 1.0], // White
            secondary: [0.0, 0.0, 0.0], // Black
            accent: [0.5, 0.5, 0.5] // Gray
          },
          description: 'Classic black and white liquid'
        },
        {
          id: 1,
          name: 'Deep Space',
          shaderIndex: 0, // Default liquid shader
          colors: {
            primary: [0.2, 0.4, 0.9], // Deep blue
            secondary: [0.05, 0.05, 0.2], // Dark navy
            accent: [0.8, 0.9, 1.0] // Light blue
          },
          description: 'Deep space blues'
        },
        {
          id: 2,
          name: 'Forest Mist',
          shaderIndex: 1, // Ether shader
          colors: {
            primary: [0.2, 0.8, 0.3], // Forest green
            secondary: [0.1, 0.3, 0.1], // Dark green
            accent: [0.6, 1.0, 0.7] // Light mint
          },
          description: 'Natural forest greens'
        },
        {
          id: 3,
          name: 'Royal Purple',
          shaderIndex: 3, // Wavy Lines shader
          colors: {
            primary: [0.6, 0.2, 0.9], // Royal purple
            secondary: [0.2, 0.0, 0.4], // Dark purple
            accent: [0.9, 0.6, 1.0] // Light lavender
          },
          description: 'Rich purple tones'
        },
        {
          id: 4,
          name: 'Golden Hour',
          shaderIndex: 0, // Default shader with different colors
          colors: {
            primary: [1.0, 0.7, 0.2], // Golden yellow
            secondary: [0.8, 0.4, 0.1], // Warm brown
            accent: [1.0, 0.9, 0.6] // Cream
          },
          description: 'Warm golden tones'
        }
      ],
      
      setActiveTheme: (index: number) => {
        const themes = get().themes
        if (index >= 0 && index < themes.length) {
          set({ activeThemeIndex: index })
        }
      },
      
      nextTheme: () => {
        const { activeThemeIndex, themes } = get()
        const nextIndex = (activeThemeIndex + 1) % themes.length
        set({ activeThemeIndex: nextIndex })
      },
      
      setTransitioning: (transitioning: boolean) => {
        set({ isTransitioning: transitioning })
      }
    }),
    {
      name: 'shadr-theme-storage',
      partialize: (state) => ({ activeThemeIndex: state.activeThemeIndex })
    }
  )
)
