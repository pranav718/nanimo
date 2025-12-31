'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Card {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    hue: number;
}

const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;
const NUM_CARDS = 3000;
const SPIRAL_DEPTH = 5000;
const SPIRAL_RADIUS_MIN = 100;
const SPIRAL_RADIUS_MAX = 800;
const SPIRAL_TURNS = 12; 

function generateVortexCards(): Card[] {
    const cards: Card[] = [];

    for (let i = 0; i < NUM_CARDS; i++) {
        const t = i / NUM_CARDS;

        const z = t * SPIRAL_DEPTH;

        const radius = SPIRAL_RADIUS_MIN + (SPIRAL_RADIUS_MAX - SPIRAL_RADIUS_MIN) * t;

        const angle = t * SPIRAL_TURNS * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const hue = (i * 137.5) % 360; 

        cards.push({
            x,
            y,
            z,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            hue,
        });
    }

    return cards;
}

function projectTo2D(
    x: number,
    y: number,
    z: number,
    fov: number,
    centerX: number,
    centerY: number,
    cameraZ: number
): { screenX: number; screenY: number; scale: number } | null {
    const relativeZ = z - cameraZ;

    if (relativeZ <= 0) return null;

    const scale = fov / (fov + relativeZ);

    const screenX = centerX + x * scale;
    const screenY = centerY + y * scale;

    return { screenX, screenY, scale };
}

export default function SpiralRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cardsRef = useRef<Card[]>([]);
    const animationRef = useRef<number>(0);

    const cameraZRef = useRef(-200); 
    const targetCameraZRef = useRef(-200);
    const rotationRef = useRef(0); 
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const panRef = useRef({ x: 0, y: 0 });

    const initCards = useCallback(() => {
        cardsRef.current = generateVortexCards();
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2 + panRef.current.x;
        const centerY = height / 2 + panRef.current.y;
        const fov = 600; 

        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, width, height);

        cameraZRef.current += (targetCameraZRef.current - cameraZRef.current) * 0.1;

        rotationRef.current += 0.002;

        const projectedCards: {
            card: Card;
            screenX: number;
            screenY: number;
            scale: number;
            z: number;
        }[] = [];

        for (const card of cardsRef.current) {
            const cos = Math.cos(rotationRef.current);
            const sin = Math.sin(rotationRef.current);
            const rotatedX = card.x * cos - card.y * sin;
            const rotatedY = card.x * sin + card.y * cos;

            const projected = projectTo2D(
                rotatedX,
                rotatedY,
                card.z,
                fov,
                centerX,
                centerY,
                cameraZRef.current
            );

            if (projected && projected.scale > 0.01) {
                projectedCards.push({
                    card,
                    screenX: projected.screenX,
                    screenY: projected.screenY,
                    scale: projected.scale,
                    z: card.z - cameraZRef.current,
                });
            }
        }

        projectedCards.sort((a, b) => b.z - a.z);

        for (const { card, screenX, screenY, scale } of projectedCards) {
            const w = card.width * scale;
            const h = card.height * scale;

            if (w < 2 || h < 2) continue;

            const alpha = Math.min(1, scale * 2);

            const gradient = ctx.createLinearGradient(
                screenX - w / 2,
                screenY - h / 2,
                screenX + w / 2,
                screenY + h / 2
            );

            const saturation = 70;
            const lightness = 45 + scale * 20;
            gradient.addColorStop(0, `hsla(${card.hue}, ${saturation}%, ${lightness}%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${card.hue + 30}, ${saturation}%, ${lightness - 10}%, ${alpha})`);

            ctx.fillStyle = gradient;

            const radius = Math.max(2, 4 * scale);
            ctx.beginPath();
            ctx.roundRect(screenX - w / 2, screenY - h / 2, w, h, radius);
            ctx.fill();
            ctx.strokeStyle = `hsla(${card.hue}, ${saturation}%, ${lightness + 20}%, ${alpha * 0.3})`;
            ctx.lineWidth = Math.max(0.5, scale);
            ctx.stroke();
        }

        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 200
        );
        glowGradient.addColorStop(0, 'rgba(100, 50, 255, 0.1)');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);

        animationRef.current = requestAnimationFrame(render);
    }, []);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;

        panRef.current.x += dx;
        panRef.current.y += dy;

        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        targetCameraZRef.current += e.deltaY * 2;
        targetCameraZRef.current = Math.max(-1000, Math.min(SPIRAL_DEPTH - 500, targetCameraZRef.current));
    }, []);

    useEffect(() => {
        handleResize();
        initCards();
        render();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, initCards, render]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        />
    );
}
