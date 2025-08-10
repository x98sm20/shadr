import { create } from 'zustand'

export interface ShaderConfig {
  id: number
  name: string
  fragmentShader: string
}

interface ShaderStore {
  activeShaderIndex: number
  shaders: ShaderConfig[]
  setActiveShader: (index: number) => void
}

export const useShaderStore = create<ShaderStore>((set) => ({
  activeShaderIndex: 0,
  shaders: [
    {
      id: 0,
      name: 'Default',
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        
        void main() {
          vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
          for(float i = 1.0; i < 10.0; i++){
            uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
            uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
          }
          gl_FragColor = vec4(vec3(0.1)/abs(sin(iTime - uv.y - uv.x)), 1.0);
        }
      `
    },
    {
      id: 1,
      name: 'Ether',
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        
        #define t iTime
        mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}
        float map(vec3 p){
          p.xz*= m(t*0.4);p.xy*= m(t*0.3);
          vec3 q = p*2.+t;
          return length(p+vec3(sin(t*0.7)))*log(length(p)+1.) + sin(q.x+sin(q.z+sin(q.y)))*0.5 - 1.;
        }

        void main() {	
          vec2 p = gl_FragCoord.xy/iResolution.y - vec2(.9,.5);
          vec3 cl = vec3(0.);
          float d = 2.5;
          for(int i=0; i<=5; i++)	{
            vec3 p = vec3(0,0,5.) + normalize(vec3(p, -1.))*d;
            float rz = map(p);
            float f =  clamp((rz - map(p+.1))*0.5, -.1, 1. );
            vec3 l = vec3(0.1,0.3,.4) + vec3(5., 2.5, 3.)*f;
            cl = cl*l + smoothstep(2.5, .0, rz)*.7*l;
            d += min(rz, 1.);
          }
          gl_FragColor = vec4(cl, 1.);
        }
      `
    },
    {
      id: 2,
      name: 'Shooting Stars',
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        
        void main() {
          vec4 O = vec4(0.0);
          vec2 I = gl_FragCoord.xy;
          O *= 0.;
          vec2 b = vec2(0, .2), p;
          mat2 R;
          for(float i = .9; i++ < 20.;
              O += 1e-3 / length(clamp(p = R *
              (fract((I / iResolution.y * i * .1 + iTime * b) * R) - .5), -b, b) - p)
              * (cos(p.y / .1 + vec4(0, 1, 2, 3)) + 1.))
              R = mat2(cos(i + vec4(0, 33, 11, 0)));
          gl_FragColor = O;
        }
      `
    },
    {
      id: 3,
      name: 'Wavy Lines',
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iMouse;
        uniform vec2 iResolution;
        
        #define PI 3.14159265359

        float hash(float n) {
          return fract(sin(n) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i.x + i.y * 57.0);
          float b = hash(i.x + 1.0 + i.y * 57.0);
          float c = hash(i.x + i.y * 57.0 + 1.0);
          float d = hash(i.x + 1.0 + i.y * 57.0 + 1.0);
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float sum = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for(int i = 0; i < 6; i++) {
            sum += amp * noise(p * freq);
            amp *= 0.5;
            freq *= 2.0;
          }
          return sum;
        }

        float lines(vec2 uv, float thickness, float distortion) {
          float y = uv.y;
          float distortionAmount = distortion * fbm(vec2(uv.x * 2.0, y * 0.5 + iTime * 0.1));
          y += distortionAmount;
          float linePattern = fract(y * 20.0);
          float line = smoothstep(0.5 - thickness, 0.5, linePattern) - 
                       smoothstep(0.5, 0.5 + thickness, linePattern);
          return line;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          float aspect = iResolution.x / iResolution.y;
          uv.x *= aspect;
          
          vec2 mousePos = iMouse / iResolution.xy;
          mousePos.x *= aspect;
          float mouseDist = length(uv - mousePos);
          float mouseInfluence = smoothstep(0.5, 0.0, mouseDist);
          
          float baseThickness = 0.05;
          float baseDistortion = 0.2;
          float thickness = mix(baseThickness, baseThickness * 1.5, mouseInfluence);
          float distortion = mix(baseDistortion, baseDistortion * 2.0, mouseInfluence);
          
          float line = lines(uv, thickness, distortion);
          float timeOffset = sin(iTime * 0.2) * 0.1;
          float animatedLine = lines(uv + vec2(timeOffset, 0.0), thickness, distortion);
          line = mix(line, animatedLine, 0.3);
          
          vec3 backgroundColor = vec3(0.0, 0.0, 0.0);
          vec3 lineColor = vec3(1.0, 1.0, 1.0);
          vec3 finalColor = mix(backgroundColor, lineColor, line);
          finalColor += vec3(0.1, 0.1, 0.1) * mouseInfluence * line;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    }
  ],
  
  setActiveShader: (index: number) => {
    set({ activeShaderIndex: index })
  },
}))
