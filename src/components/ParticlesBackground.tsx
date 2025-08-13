"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function ParticlesBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {
    // Container yüklendiğinde çalışır
  }, []);

  const particlesOptions = useMemo(() => ({
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: isMobile ? 30 : 60, // Mobilde FPS'i daha da düşür
    interactivity: {
      events: {
        onClick: {
          enable: !isMobile, // Mobilde click interactivity'yi kapat
          mode: "push",
        },
        onHover: {
          enable: false,
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: isMobile ? 2 : 4, // Mobilde daha az parçacık
        },
      },
    },
    particles: {
      color: {
        value: ["#ffffff", "#ffd700", "#87ceeb", "#e6e6fa", "#fffacd"],
      },
      shape: {
        type: "star",
        options: {
          star: {
            sides: 5,
            inRadius: 2,
            outRadius: 5,
          }
        }
      },
      number: {
        density: {
          enable: true,
          area: isMobile ? 1800 : 1200, // Mobilde daha geniş alan (daha az yoğunluk)
        },
        value: isMobile ? 25 : 60, // Mobilde çok daha az parçacık
      },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: {
          enable: !isMobile, // Mobilde opacity animasyonunu kapat
          speed: 1.5,
          minimumValue: 0.1,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: isMobile ? 3 : 4 }, // Mobilde daha küçük parçacıklar
        animation: {
          enable: !isMobile, // Mobilde size animasyonunu kapat
          speed: 2,
          minimumValue: 0.5,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: { min: 0.05, max: isMobile ? 0.2 : 0.3 }, // Mobilde daha yavaş hareket
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: {
          default: "out" as const,
        },
        attract: {
          enable: false,
        },
      },
      twinkle: {
        particles: {
          enable: !isMobile, // Mobilde twinkle'ı kapat
          frequency: 0.03,
          opacity: 1,
        },
      },
    },
    detectRetina: true,
  }), [isMobile]);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particlesOptions}
    />
  );
}