"use client";

import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    // Container yüklendiğinde çalışır
  }, []);

  const particlesOptions = useMemo(() => ({
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60, // FPS limitini düşürdük
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: false,
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4, // Daha az parçacık ekliyoruz
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
          area: 1200, // Daha geniş alan
        },
        value: 60, // Parçacık sayısını azalttık
      },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: {
          enable: true,
          speed: 1.5, // Animasyon hızını azalttık
          minimumValue: 0.1,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 4 },
        animation: {
          enable: true,
          speed: 2, // Animasyon hızını azalttık
          minimumValue: 0.5,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: { min: 0.05, max: 0.3 }, // Hareket hızını azalttık
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
          enable: true,
          frequency: 0.03, // Twinkle frekansını azalttık
          opacity: 1,
        },
      },
    },
    detectRetina: true,
  }), []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particlesOptions}
    />
  );
}