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

    const BASE_RADIUS = 80;
    const EXPANDED_RADIUS = 95;

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
        const size = 500;
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

        const size = 500;
        const centerX = size / 2;
        const centerY = size / 2;
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        ctx.clearRect(0, 0, size, size);

        const targetRadius = isExpanding ? EXPANDED_RADIUS : BASE_RADIUS;
        const radius = targetRadius + (isHovered ? 4 : 0) + Math.sin(elapsed * 0.3) * 2;

        const rotation = elapsed * 0.08;

        const outerGlow = ctx.createRadialGradient(
            centerX, centerY, radius * 1.5,
            centerX, centerY, radius * 3
        );
        outerGlow.addColorStop(0, 'rgba(255, 180, 100, 0.08)');
        outerGlow.addColorStop(0.5, 'rgba(255, 140, 60, 0.03)');
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        const drawAccretionArc = (yOffset: number, radiusMultiplier: number, alpha: number, thickness: number) => {
            ctx.beginPath();
            ctx.ellipse(0, yOffset, radius * radiusMultiplier, radius * 0.15, 0, Math.PI, 0);

            const gradient = ctx.createLinearGradient(-radius * radiusMultiplier, 0, radius * radiusMultiplier, 0);
            gradient.addColorStop(0, `rgba(80, 40, 20, 0)`);
            gradient.addColorStop(0.15, `rgba(180, 100, 50, ${alpha * 0.6})`);
            gradient.addColorStop(0.3, `rgba(255, 180, 100, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 240, 200, ${alpha * 1.2})`);
            gradient.addColorStop(0.7, `rgba(255, 180, 100, ${alpha})`);
            gradient.addColorStop(0.85, `rgba(180, 100, 50, ${alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(80, 40, 20, 0)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = thickness;
            ctx.stroke();
        };

        drawAccretionArc(-radius * 0.95, 1.8, 0.7, 12 + Math.sin(elapsed * 1.5) * 2);
        drawAccretionArc(-radius * 0.85, 1.6, 0.5, 8);
        drawAccretionArc(-radius * 0.75, 1.4, 0.3, 5);

        ctx.restore();

        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        coreGradient.addColorStop(0, '#000000');
        coreGradient.addColorStop(0.8, '#000000');
        coreGradient.addColorStop(0.92, '#050505');
        coreGradient.addColorStop(1, '#0a0a0a');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.02, 0, Math.PI * 2);
        const photonRing = ctx.createRadialGradient(
            centerX, centerY, radius * 0.98,
            centerX, centerY, radius * 1.08
        );
        photonRing.addColorStop(0, 'rgba(255, 200, 150, 0)');
        photonRing.addColorStop(0.4, 'rgba(255, 220, 180, 0.6)');
        photonRing.addColorStop(0.5, 'rgba(255, 240, 220, 0.9)');
        photonRing.addColorStop(0.6, 'rgba(255, 220, 180, 0.6)');
        photonRing.addColorStop(1, 'rgba(255, 180, 120, 0)');
        ctx.strokeStyle = photonRing;
        ctx.lineWidth = radius * 0.08;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        for (let i = 0; i < 5; i++) {
            const diskRadius = radius * (1.3 + i * 0.25);
            const diskThickness = 25 - i * 4;
            const diskAlpha = 0.9 - i * 0.15;

            ctx.beginPath();
            ctx.ellipse(0, 0, diskRadius, radius * 0.1, 0, 0, Math.PI);

            const diskGradient = ctx.createLinearGradient(-diskRadius, 0, diskRadius, 0);
            diskGradient.addColorStop(0, `rgba(60, 30, 15, 0)`);
            diskGradient.addColorStop(0.1, `rgba(120, 60, 30, ${diskAlpha * 0.4})`);
            diskGradient.addColorStop(0.25, `rgba(200, 120, 60, ${diskAlpha * 0.8})`);
            diskGradient.addColorStop(0.4, `rgba(255, 180, 100, ${diskAlpha})`);
            diskGradient.addColorStop(0.5, `rgba(255, 220, 180, ${diskAlpha})`);
            diskGradient.addColorStop(0.6, `rgba(255, 180, 100, ${diskAlpha})`);
            diskGradient.addColorStop(0.75, `rgba(200, 120, 60, ${diskAlpha * 0.8})`);
            diskGradient.addColorStop(0.9, `rgba(120, 60, 30, ${diskAlpha * 0.4})`);
            diskGradient.addColorStop(1, `rgba(60, 30, 15, 0)`);

            ctx.strokeStyle = diskGradient;
            ctx.lineWidth = diskThickness;
            ctx.stroke();
        }

        drawAccretionArc(radius * 0.6, 1.6, 0.4, 6);

        ctx.restore();

        const innerGlow = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius * 1.2
        );
        innerGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        innerGlow.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        innerGlow.addColorStop(1, 'rgba(255, 200, 150, 0.1)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (isExpanding) {
            const pulseAlpha = 0.4 + Math.sin(elapsed * 12) * 0.2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 200, 150, ${pulseAlpha})`;
            ctx.lineWidth = 2;
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
                width: 500,
                height: 500,
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={onEnter}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    );
}
