'use client'

import { useRef, useMemo, useEffect, useState, useCallback, memo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useShaderStore } from '@/store/shaderStore'
import { useThemeStore } from '@/store/themeStore'

// Create shader material
const ShaderMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector2(),
    iMouse: new THREE.Vector2(),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader (will be replaced)
  `
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 iMouse;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
      for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
      }
      gl_FragColor = vec4(vec3(0.1)/abs(sin(iTime - uv.y - uv.x)), 1.0);
    }
  `
)

extend({ ShaderMaterial })

interface ShaderMeshProps {
  size: number
}

const ShaderMesh = memo(function ShaderMesh({ size }: ShaderMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2())
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  
  const { shaders, setActiveShader } = useShaderStore()
  const { activeThemeIndex, themes } = useThemeStore()
  
  // Get current theme and its shader - memoize to prevent unnecessary recalculations
  const currentTheme = useMemo(() => themes[activeThemeIndex], [themes, activeThemeIndex])
  const activeShaderIndex = currentTheme.shaderIndex
  
  // Memoize the dimension update callback
  const updateDimensions = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, [])
  
  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])
  
  // Update shader when theme changes
  useEffect(() => {
    setActiveShader(currentTheme.shaderIndex)
  }, [currentTheme.shaderIndex, setActiveShader])
  
  // Use the selected shader directly - make sure it updates when theme changes
  const fragmentShader = useMemo(() => {
    const shader = shaders[currentTheme.shaderIndex]?.fragmentShader || shaders[0].fragmentShader
    return shader
  }, [currentTheme.shaderIndex, shaders])
  
  // Create shader material with proper uniforms - only recreate when shader changes
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(dimensions.width, dimensions.height) },
        iMouse: { value: new THREE.Vector2() },
        uPrimaryColor: { value: new THREE.Vector3(...currentTheme.colors.primary) },
        uSecondaryColor: { value: new THREE.Vector3(...currentTheme.colors.secondary) },
        uAccentColor: { value: new THREE.Vector3(...currentTheme.colors.accent) },
      }
    })
  }, [fragmentShader, dimensions.width, dimensions.height])
  
  useFrame((state) => {
    if (shaderMaterial && shaderMaterial.uniforms) {
      shaderMaterial.uniforms.iTime.value = state.clock.elapsedTime
      shaderMaterial.uniforms.iResolution.value.set(dimensions.width, dimensions.height)
      shaderMaterial.uniforms.iMouse.value.copy(mouseRef.current)
      
      // Update theme colors
      if (shaderMaterial.uniforms.uPrimaryColor) {
        shaderMaterial.uniforms.uPrimaryColor.value.set(...currentTheme.colors.primary)
      }
      if (shaderMaterial.uniforms.uSecondaryColor) {
        shaderMaterial.uniforms.uSecondaryColor.value.set(...currentTheme.colors.secondary)
      }
      if (shaderMaterial.uniforms.uAccentColor) {
        shaderMaterial.uniforms.uAccentColor.value.set(...currentTheme.colors.accent)
      }
    }
  })
  
  const handlePointerMove = (event: THREE.Event & { clientX: number; clientY: number; nativeEvent?: PointerEvent }) => {
    // In React Three Fiber, we need to get the canvas element from the event
    // The event object has a nativeEvent that contains the actual DOM event
    try {
      // Get the canvas element from the React Three Fiber event
      const canvas = event.nativeEvent?.target || event.target
      
      // Check if we have a valid DOM element with getBoundingClientRect
      if (canvas && typeof canvas === 'object' && canvas !== null && 'getBoundingClientRect' in canvas) {
        const htmlElement = canvas as HTMLElement
        if (typeof htmlElement.getBoundingClientRect === 'function') {
          const rect = htmlElement.getBoundingClientRect()
          mouseRef.current.set(
            (event.clientX - rect.left) / rect.width,
            1 - (event.clientY - rect.top) / rect.height
          )
        } else {
          // Fallback: use viewport coordinates if we can't get the canvas rect
          mouseRef.current.set(
            event.clientX / dimensions.width,
            1 - event.clientY / dimensions.height
          )
        }
      } else {
        // Fallback: use viewport coordinates if we can't get the canvas rect
        mouseRef.current.set(
          event.clientX / dimensions.width,
          1 - event.clientY / dimensions.height
        )
      }
    } catch (error) {
      // Silent fallback - just use normalized viewport coordinates
      mouseRef.current.set(
        event.clientX / dimensions.width,
        1 - event.clientY / dimensions.height
      )
    }
  }
  
  // Make plane large enough to cover entire screen regardless of aspect ratio
  const planeSize = 10 // Much larger to ensure full coverage
  
  return (
    <mesh ref={meshRef} onPointerMove={handlePointerMove} material={shaderMaterial}>
      <planeGeometry args={[planeSize, planeSize]} />
    </mesh>
  )
})

interface ShaderCanvasProps {
  size: number
  onClick?: () => void
  className?: string
}

// Stable object references to prevent Canvas re-renders
const CAMERA_CONFIG = { position: [0, 0, 1] as const, fov: 75 }
const CANVAS_STYLE = { 
  width: '100vw', 
  height: '100vh',
  display: 'block'
} as const
const GL_CONFIG = { antialias: false }

export default memo(function ShaderCanvas({ size, onClick, className = '' }: ShaderCanvasProps) {
  const { isTransitioning } = useThemeStore()
  
  // Memoize the container style to prevent re-renders
  const containerStyle = useMemo(() => ({
    width: '100vw', 
    height: '100vh',
    margin: 0,
    padding: 0,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    opacity: 1.0
  }), [])
  
  return (
    <div 
      className={`${className} transition-opacity duration-500 ease-in-out`}
      style={containerStyle}
      onClick={onClick}
    >
      <Canvas
        camera={CAMERA_CONFIG}
        style={CANVAS_STYLE}
        gl={GL_CONFIG}
      >
        <ShaderMesh size={size} />
      </Canvas>
    </div>
  )
})
