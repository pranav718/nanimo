'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number;
    baseSize: number;
    twinkleSpeed: number;
    twinkleOffset: number;
}

interface StarFieldProps {
    mode: 'idle' | 'prewarp' | 'warp';
    blackHoleCenter?: { x: number; y: number };
    onWarpComplete?: () => void;
}

const MAX_DPR = 2;

function generateStars(width: number, height: number): Star[] {
    const count = Math.min(300, Math.floor((width * height) / 5000));
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 1000 + 1,
            baseSize: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 2 + 1,
            twinkleOffset: Math.random() * Math.PI * 2,
        });
    }

    return stars;
}

export default function StarField({ mode, blackHoleCenter, onWarpComplete }: StarFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const warpStartRef = useRef<number>(0);
    const hasCalledComplete = useRef(false);

    const WARP_DURATION = 1200; 
    const PREWARP_DURATION = 100; 

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }

        starsRef.current = generateStars(window.innerWidth, window.innerHeight);
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio, MAX_DPR);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        ctx.fillStyle = '#030305';
        ctx.fillRect(0, 0, width, height);

        const centerX = blackHoleCenter?.x ?? width / 2;
        const centerY = blackHoleCenter?.y ?? height / 2;

        for (const star of starsRef.current) {
            let drawX = star.x;
            let drawY = star.y;
            let size = star.baseSize;
            let alpha = 0.3 + 0.7 * Math.sin(elapsed * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;

            if (mode === 'prewarp') {
                const dx = centerX - star.x;
                const dy = centerY - star.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pullStrength = 0.15;
                drawX = star.x + dx * pullStrength;
                drawY = star.y + dy * pullStrength;
                alpha = 0.8;
            } else if (mode === 'warp') {
                const warpElapsed = now - warpStartRef.current;
                const warpProgress = Math.min(warpElapsed / WARP_DURATION, 1);

                star.z -= 30 * (1 + warpProgress * 3);

                if (star.z <= 0) {
                    star.z = 1000;
                    star.x = Math.random() * width;
                    star.y = Math.random() * height;
                }

                const fov = 500;
                const scale = fov / star.z;
                drawX = centerX + (star.x - centerX) * scale;
                drawY = centerY + (star.y - centerY) * scale;

                const prevScale = fov / (star.z + 30);
                const prevX = centerX + (star.x - centerX) * prevScale;
                const prevY = centerY + (star.y - centerY) * prevScale;

                const streakAlpha = Math.min(1, (1000 - star.z) / 500) * (1 - warpProgress * 0.5);
                ctx.strokeStyle = `rgba(255, 255, 255, ${streakAlpha})`;
                ctx.lineWidth = Math.max(0.5, size * scale * 0.5);
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(drawX, drawY);
                ctx.stroke();

                if (warpProgress >= 1 && !hasCalledComplete.current) {
                    hasCalledComplete.current = true;
                    onWarpComplete?.();
                }

                continue; 
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }

        animationRef.current = requestAnimationFrame(render);
    }, [mode, blackHoleCenter, onWarpComplete]);

    useEffect(() => {
        if (mode === 'warp') {
            warpStartRef.current = performance.now();
            hasCalledComplete.current = false;
        }
    }, [mode]);

    useEffect(() => {
        handleResize();
        startTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(render);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, render]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
