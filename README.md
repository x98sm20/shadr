# Shadr

A minimalist full-screen shader canvas application built with Next.js and React Three Fiber.

## Features

- **Full-screen shader canvas** with beautiful animated GLSL patterns
- **Multiple shader options** including wavy patterns, Ether, Shooting Stars, and interactive wavy lines
- **Real-time WebGL rendering** with smooth animations
- **Responsive design** that adapts to any screen size
- **Mouse interaction support** for compatible shaders

## Tech Stack

- **Next.js 15** with TypeScript
- **React Three Fiber** for WebGL rendering
- **Three.js** for 3D graphics
- **Zustand** for state management
- **Tailwind CSS** for styling
- **shadcn/ui** components (ready for future features)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/x98sm20/shadr.git
cd shadr
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Shaders

The application includes 4 different GLSL shaders:

1. **Default** - Animated wavy patterns
2. **Ether** - Fluid, organic patterns by nimitz
3. **Shooting Stars** - Particle-like animations by @XorDev
4. **Wavy Lines** - Interactive distorted lines with mouse support

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License
