import React, { useEffect, useRef } from 'react';
import { particleEngine } from '../utils/particleSystem';

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      particleEngine.init(canvasRef.current);
    }

    return () => {
      particleEngine.destroy();
    };
  }, []);

  return (
    <canvas
      id="celebration-particle-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
      aria-hidden="true"
    />
  );
};
