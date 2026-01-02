'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BlackHoleProps {
    onEnter: () => void;
    isExpanding: boolean;
}

const MAX_DPR = 2;

export default function BlackHole({ onEnter, isExpanding }: BlackHoleProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const [isHovered, setIsHovered] = useState(false);

    const BASE_RADIUS = 120;
    const EXPANDED_RADIUS = 140;

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
        const size = 400;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 400;
        const centerX = size / 2;
        const centerY = size / 2;
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        ctx.clearRect(0, 0, size, size);

        const targetRadius = isExpanding ? EXPANDED_RADIUS : BASE_RADIUS;
        const radius = targetRadius + (isHovered ? 5 : 0) + Math.sin(elapsed * 0.5) * 3;

        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.8,
            centerX, centerY, radius * 2
        );
        glowGradient.addColorStop(0, 'rgba(80, 60, 120, 0.3)');
        glowGradient.addColorStop(0.5, 'rgba(40, 30, 80, 0.1)');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(elapsed * 0.3); 

        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.4, radius * 0.4, 0, 0, Math.PI * 2);
        const ringGradient = ctx.createLinearGradient(-radius * 1.4, 0, radius * 1.4, 0);
        ringGradient.addColorStop(0, 'rgba(255, 150, 100, 0.0)');
        ringGradient.addColorStop(0.3, 'rgba(255, 180, 120, 0.4)');
        ringGradient.addColorStop(0.5, 'rgba(255, 200, 150, 0.6)');
        ringGradient.addColorStop(0.7, 'rgba(255, 180, 120, 0.4)');
        ringGradient.addColorStop(1, 'rgba(255, 150, 100, 0.0)');
        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = 8 + Math.sin(elapsed * 2) * 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.2, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 220, 180, 0.3)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();

        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        coreGradient.addColorStop(0, '#000000');
        coreGradient.addColorStop(0.7, '#010103');
        coreGradient.addColorStop(0.85, '#0a0812');
        coreGradient.addColorStop(1, 'rgba(20, 15, 30, 0.8)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
        const distortGradient = ctx.createRadialGradient(
            centerX, centerY, radius,
            centerX, centerY, radius * 1.2
        );
        distortGradient.addColorStop(0, 'rgba(100, 80, 140, 0.3)');
        distortGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = distortGradient;
        ctx.lineWidth = radius * 0.15;
        ctx.stroke();

        if (isExpanding) {
            const pulseAlpha = 0.3 + Math.sin(elapsed * 15) * 0.2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 140, 220, ${pulseAlpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        animationRef.current = requestAnimationFrame(render);
    }, [isHovered, isExpanding]);

    useEffect(() => {
        handleResize();
        startTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(render);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, render]);

    return (
        <canvas
            ref={canvasRef}
            className="cursor-pointer transition-transform duration-200"
            style={{
                width: 400,
                height: 400,
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={onEnter}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    );
}
