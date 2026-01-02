'use client';

import { useAnimeStore } from '@/store/animeStore';
import { AnimeMedia } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Card {
    x: number;
    y: number;
    hue: number;
    anime?: AnimeMedia;
    loadedImage?: HTMLImageElement;
}

const DOT_SIZE = 9;
const POSTER_WIDTH = 120;
const POSTER_HEIGHT = 180;
const CARD_GAP = 4;

const LENS_RADIUS = 180;
const LENS_POWER = 1;

const imageCache = new Map<string, HTMLImageElement>();

function loadImageOnDemand(url: string): Promise<HTMLImageElement | null> {
    if (imageCache.has(url)) {
        return Promise.resolve(imageCache.get(url)!);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageCache.set(url, img);
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

function generateGridCards(
    animeList: AnimeMedia[],
    containerWidth: number,
    containerHeight: number
): Card[] {
    const cards: Card[] = [];
    const cellWidth = POSTER_WIDTH + CARD_GAP;
    const cellHeight = POSTER_HEIGHT + CARD_GAP;

    const count = animeList.length || 500;
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

        const animeIndex = i % Math.max(1, animeList.length);
        const anime = animeList[animeIndex];
        const hue = (i * 137.5) % 360;

        cards.push({ x, y, hue, anime });
    }

    return cards;
}

function getLensEffect(
    cardX: number,
    cardY: number,
    mouseX: number,
    mouseY: number
): { t: number; offsetX: number; offsetY: number } {
    const dx = cardX - mouseX;
    const dy = cardY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > LENS_RADIUS) {
        return { t: 0, offsetX: 0, offsetY: 0 };
    }

    const t = 1 - distance / LENS_RADIUS;

    const eased = 1 - Math.pow(1 - t, 3);

    const pushStrength = eased * 20;
    const angle = Math.atan2(dy, dx);
    const offsetX = Math.cos(angle) * pushStrength;
    const offsetY = Math.sin(angle) * pushStrength;

    return { t: eased, offsetX, offsetY };
}

export default function SpiralRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cardsRef = useRef<Card[]>([]);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const loadingRef = useRef<Set<string>>(new Set());

    const panRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    const { animeList, isLoading, fetchTrending } = useAnimeStore();
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (animeList.length === 0) {
            fetchTrending();
        }
    }, [animeList.length, fetchTrending]);

    const initCards = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const virtualWidth = 2500;
        const virtualHeight = 2500;
        cardsRef.current = generateGridCards(animeList, virtualWidth, virtualHeight);

        cardsRef.current = cardsRef.current.map((card) => {
            const url = card.anime?.coverImage?.extraLarge || card.anime?.coverImage?.large;
            if (url && imageCache.has(url)) {
                return { ...card, loadedImage: imageCache.get(url) };
            }
            return card;
        });

        panRef.current = {
            x: (canvas.width / window.devicePixelRatio - virtualWidth) / 2,
            y: (canvas.height / window.devicePixelRatio - virtualHeight) / 2,
        };
    }, [animeList]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.fillStyle = '#030305';
        ctx.fillRect(0, 0, width, height);

        const mouseX = mouseRef.current.x - panRef.current.x;
        const mouseY = mouseRef.current.y - panRef.current.y;

        const cardsWithLens = cardsRef.current.map((card, index) => {
            const lens = getLensEffect(card.x, card.y, mouseX, mouseY);
            return { card, lens, index };
        }).sort((a, b) => a.lens.t - b.lens.t);

        for (const { card, lens, index } of cardsWithLens) {
            const drawX = card.x + panRef.current.x + lens.offsetX;
            const drawY = card.y + panRef.current.y + lens.offsetY;

            const margin = POSTER_WIDTH + LENS_RADIUS;
            if (drawX < -margin || drawX > width + margin ||
                drawY < -margin || drawY > height + margin) {
                continue;
            }

            const w = DOT_SIZE + (POSTER_WIDTH - DOT_SIZE) * lens.t;
            const h = DOT_SIZE + (POSTER_HEIGHT - DOT_SIZE) * lens.t;

            const showImage = lens.t > 0.3 && card.loadedImage;

            if (lens.t > 0.2 && card.anime && !card.loadedImage) {
                const url = card.anime.coverImage?.extraLarge || card.anime.coverImage?.large;
                if (url && !loadingRef.current.has(url)) {
                    loadingRef.current.add(url);
                    loadImageOnDemand(url).then((img) => {
                        if (img) {
                            cardsRef.current[index] = { ...cardsRef.current[index], loadedImage: img };
                            forceUpdate(n => n + 1);
                        }
                    });
                }
            }

            if (showImage && card.loadedImage) {
                const radius = Math.max(2, 6 * lens.t);
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(drawX - w / 2, drawY - h / 2, w, h, radius);
                ctx.clip();
                ctx.drawImage(card.loadedImage, drawX - w / 2, drawY - h / 2, w, h);
                ctx.restore();

                if (lens.t > 0.5) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${lens.t * 0.3})`;
                    ctx.lineWidth = 1 + lens.t;
                    ctx.beginPath();
                    ctx.roundRect(drawX - w / 2, drawY - h / 2, w, h, radius);
                    ctx.stroke();
                }
            } else {
                const alpha = 0.3 + 0.5 * lens.t;
                const saturation = 50 + 30 * lens.t;
                const lightness = 30 + 30 * lens.t;

                ctx.fillStyle = `hsla(${card.hue}, ${saturation}%, ${lightness}%, ${alpha})`;

                if (lens.t < 0.1) {
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const radius = Math.max(2, w / 4);
                    ctx.beginPath();
                    ctx.roundRect(drawX - w / 2, drawY - h / 2, w, h, radius);
                    ctx.fill();
                }
            }
        }

        if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
            const glowGradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, LENS_RADIUS * 0.8
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
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
    }, [animeList, initCards]);

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

            {isLoading && (
                <div className="fixed bottom-8 right-8 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-white/50 text-xs">Loading...</p>
                </div>
            )}
        </>
    );
}
