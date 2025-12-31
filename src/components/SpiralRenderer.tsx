'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Card {
    x: number;
    y: number;
    baseWidth: number;
    baseHeight: number;
    hue: number;
}

const CARD_WIDTH = 60;
const CARD_HEIGHT = 90;
const CARD_GAP = 4;
const DEFAULT_CARD_COUNT = 2000;

const LENS_RADIUS = 150;
const LENS_POWER = 2.5;

function generateGridCards(count: number, containerWidth: number, containerHeight: number): Card[] {
    const cards: Card[] = [];
    const cellWidth = CARD_WIDTH + CARD_GAP;
    const cellHeight = CARD_HEIGHT + CARD_GAP;

    const cols = Math.ceil(Math.sqrt(count * (containerWidth / containerHeight)));
    const rows = Math.ceil(count / cols);

    const gridWidth = cols * cellWidth;
    const gridHeight = rows * cellHeight;
    const offsetX = (containerWidth - gridWidth) / 2;
    const offsetY = (containerHeight - gridHeight) / 2;

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = offsetX + col * cellWidth + cellWidth / 2;
        const y = offsetY + row * cellHeight + cellHeight / 2;

        const hue = (i * 137.5) % 360;

        cards.push({
            x,
            y,
            baseWidth: CARD_WIDTH,
            baseHeight: CARD_HEIGHT,
            hue,
        });
    }

    return cards;
}

function getLensMagnification(
    cardX: number,
    cardY: number,
    mouseX: number,
    mouseY: number,
    lensRadius: number,
    lensPower: number
): { scale: number; offsetX: number; offsetY: number } {
    const dx = cardX - mouseX;
    const dy = cardY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > lensRadius) {
        return { scale: 1, offsetX: 0, offsetY: 0 };
    }

    const normalizedDist = distance / lensRadius;
    const falloff = (1 + Math.cos(normalizedDist * Math.PI)) / 2;

    const scale = 1 + (lensPower - 1) * falloff;
    const pushStrength = falloff * (scale - 1) * 15;
    const angle = Math.atan2(dy, dx);
    const offsetX = Math.cos(angle) * pushStrength;
    const offsetY = Math.sin(angle) * pushStrength;

    return { scale, offsetX, offsetY };
}

export default function SpiralRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cardsRef = useRef<Card[]>([]);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const [cardCount, setCardCount] = useState(DEFAULT_CARD_COUNT);

    const panRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    const initCards = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const virtualWidth = 3000;
        const virtualHeight = 3000;
        cardsRef.current = generateGridCards(cardCount, virtualWidth, virtualHeight);

        panRef.current = {
            x: (canvas.width / window.devicePixelRatio - virtualWidth) / 2,
            y: (canvas.height / window.devicePixelRatio - virtualHeight) / 2,
        };
    }, [cardCount]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, width, height);

        const mouseX = mouseRef.current.x - panRef.current.x;
        const mouseY = mouseRef.current.y - panRef.current.y;

        const sortedCards = [...cardsRef.current].map(card => {
            const lens = getLensMagnification(
                card.x,
                card.y,
                mouseX,
                mouseY,
                LENS_RADIUS,
                LENS_POWER
            );
            return { card, lens };
        }).sort((a, b) => a.lens.scale - b.lens.scale);

        for (const { card, lens } of sortedCards) {
            const drawX = card.x + panRef.current.x + lens.offsetX;
            const drawY = card.y + panRef.current.y + lens.offsetY;
            const margin = CARD_WIDTH * LENS_POWER;
            if (drawX < -margin || drawX > width + margin ||
                drawY < -margin || drawY > height + margin) {
                continue;
            }

            const w = card.baseWidth * lens.scale;
            const h = card.baseHeight * lens.scale;

            const alpha = 0.6 + 0.4 * (lens.scale - 1) / (LENS_POWER - 1);
            const saturation = 60 + 30 * (lens.scale - 1) / (LENS_POWER - 1);
            const lightness = 35 + 25 * (lens.scale - 1) / (LENS_POWER - 1);
            const gradient = ctx.createLinearGradient(
                drawX - w / 2,
                drawY - h / 2,
                drawX + w / 2,
                drawY + h / 2
            );

            gradient.addColorStop(0, `hsla(${card.hue}, ${saturation}%, ${lightness}%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${card.hue + 20}, ${saturation}%, ${lightness - 10}%, ${alpha})`);

            ctx.fillStyle = gradient;

            const radius = Math.max(2, 6 * lens.scale);
            ctx.beginPath();
            ctx.roundRect(drawX - w / 2, drawY - h / 2, w, h, radius);
            ctx.fill();

            if (lens.scale > 1.1) {
                ctx.strokeStyle = `hsla(${card.hue}, ${saturation}%, ${lightness + 30}%, ${alpha * 0.5})`;
                ctx.lineWidth = lens.scale;
                ctx.stroke();
            }
        }

        if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
            const glowGradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, LENS_RADIUS
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
            glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, width, height);
        }

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

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };

        if (isDraggingRef.current) {
            const dx = e.clientX - lastMouseRef.current.x;
            const dy = e.clientY - lastMouseRef.current.y;
            panRef.current.x += dx;
            panRef.current.y += dy;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1000, y: -1000 };
        isDraggingRef.current = false;
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

    useEffect(() => {
        initCards();
    }, [cardCount, initCards]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 cursor-grab active:cursor-grabbing"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            />

            <div className="fixed bottom-8 right-8 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 pointer-events-auto">
                <label className="text-white/70 text-xs block mb-2">
                    Cards: {cardCount.toLocaleString()}
                </label>
                <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-32 accent-purple-500"
                />
            </div>
        </>
    );
}
