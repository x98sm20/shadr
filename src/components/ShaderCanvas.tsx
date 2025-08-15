'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useShaderStore } from '@/store/shaderStore'

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

function ShaderMesh({ size }: ShaderMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial & {
    iTime: number
    iResolution: THREE.Vector2
    iMouse: THREE.Vector2
  }>(null)
  const mouseRef = useRef(new THREE.Vector2())
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  
  const { activeShaderIndex, shaders } = useShaderStore()
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Use the selected shader directly
  const fragmentShader = useMemo(() => {
    return shaders[activeShaderIndex]?.fragmentShader || shaders[0].fragmentShader
  }, [activeShaderIndex, shaders])
  
  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.iTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.iResolution.value.set(dimensions.width, dimensions.height)
      materialRef.current.uniforms.iMouse.value.copy(mouseRef.current)
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
    <mesh ref={meshRef} onPointerMove={handlePointerMove}>
      <planeGeometry args={[planeSize, planeSize]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        uniforms={{
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(dimensions.width, dimensions.height) },
          iMouse: { value: new THREE.Vector2() },
        }}
      />
    </mesh>
  )
}

interface ShaderCanvasProps {
  size: number
  onClick?: () => void
  className?: string
}

export default function ShaderCanvas({ size, onClick, className = '' }: ShaderCanvasProps) {
  return (
    <div 
      className={`${className}`}
      style={{ 
        width: '100vw', 
        height: '100vh',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ 
          width: '100vw', 
          height: '100vh',
          display: 'block'
        }}
        gl={{ antialias: false }}
      >
        <ShaderMesh size={size} />
      </Canvas>
    </div>
  )
}
