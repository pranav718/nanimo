'use client';

import { useAnimeStore } from '@/store/animeStore';
import { AnimeMedia } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Card {
    x: number;
    y: number;
    anime?: AnimeMedia;
    loadedImage?: HTMLImageElement;
    brightness: number;
    twinkleSpeed: number;
    starSize: number;
}

const POSTER_WIDTH = 100;
const POSTER_HEIGHT = 140;
const LENS_RADIUS = 160;

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

function generateUniformStars(
    animeList: AnimeMedia[],
    width: number,
    height: number
): Card[] {
    const cards: Card[] = [];
    const count = Math.max(animeList.length, 200);

    const cols = Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / cols);

    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const baseX = col * cellWidth + cellWidth / 2;
        const baseY = row * cellHeight + cellHeight / 2;

        const jitterX = (Math.random() - 0.5) * cellWidth * 0.5;
        const jitterY = (Math.random() - 0.5) * cellHeight * 0.5;

        const x = baseX + jitterX;
        const y = baseY + jitterY;

        const animeIndex = i % Math.max(1, animeList.length);
        const anime = animeList[animeIndex];

        cards.push({
            x,
            y,
            anime,
            brightness: 0.3 + Math.random() * 0.7,
            twinkleSpeed: 0.5 + Math.random() * 1.5,
            starSize: 1.2 + Math.random() * 1.3,
        });
    }

    return cards;
}

export default function SpiralRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cardsRef = useRef<Card[]>([]);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const smoothMouseRef = useRef({ x: -1000, y: -1000 });
    const loadingRef = useRef<Set<string>>(new Set());
    const timeRef = useRef(0);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    const { animeList, isLoading, fetchTrending } = useAnimeStore();
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (animeList.length === 0) {
            fetchTrending();
        }
    }, [animeList.length, fetchTrending]);

    const initCards = useCallback(() => {
        const { width, height } = dimensionsRef.current;
        if (width === 0 || height === 0) return;

        cardsRef.current = generateUniformStars(animeList, width, height);

        cardsRef.current = cardsRef.current.map((card) => {
            const url = card.anime?.coverImage?.extraLarge || card.anime?.coverImage?.large;
            if (url && imageCache.has(url)) {
                return { ...card, loadedImage: imageCache.get(url) };
            }
            return card;
        });
    }, [animeList]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        timeRef.current = performance.now() / 1000;

        smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.18;
        smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.18;

        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, width, height);

        const mouseX = smoothMouseRef.current.x;
        const mouseY = smoothMouseRef.current.y;

        const cardsWithDistance = cardsRef.current.map((card, index) => {
            const dx = card.x - mouseX;
            const dy = card.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { card, index, distance };
        });

        cardsWithDistance.sort((a, b) => b.distance - a.distance);

        for (const { card, index, distance } of cardsWithDistance) {
            const isInLens = distance < LENS_RADIUS;

            if (!isInLens) {
                const twinkle = 0.5 + 0.5 * Math.sin(
                    timeRef.current * card.twinkleSpeed + card.x * 0.01
                );
                const brightness = card.brightness * (0.5 + 0.5 * twinkle);

                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(card.x, card.y, card.starSize, 0, Math.PI * 2);
                ctx.fill();

                if (brightness > 0.6) {
                    ctx.fillStyle = `rgba(200, 220, 255, ${(brightness - 0.6) * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(card.x, card.y, card.starSize * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const normalizedDist = distance / LENS_RADIUS;
                const t = 1 - Math.pow(normalizedDist, 0.6);

                const sizeMultiplier = 0.3 + t * 0.7;
                const w = POSTER_WIDTH * sizeMultiplier;
                const h = POSTER_HEIGHT * sizeMultiplier;

                if (t > 0.2 && card.anime && !card.loadedImage) {
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

                const radius = Math.max(4, 10 * t);

                ctx.save();

                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 15 * t;
                ctx.shadowOffsetY = 5 * t;

                if (card.loadedImage && t > 0.15) {
                    ctx.globalAlpha = Math.min(1, t * 1.5);

                    ctx.beginPath();
                    ctx.roundRect(card.x - w / 2, card.y - h / 2, w, h, radius);
                    ctx.clip();
                    ctx.drawImage(card.loadedImage, card.x - w / 2, card.y - h / 2, w, h);

                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;

                    if (t > 0.6) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(t - 0.6) * 1.2})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                } else {
                    const alpha = 0.2 + 0.7 * t;
                    ctx.fillStyle = `rgba(30, 35, 50, ${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(card.x - w / 2, card.y - h / 2, w, h, radius);
                    ctx.fill();

                    ctx.strokeStyle = `rgba(80, 100, 140, ${t * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.restore();
            }
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

        dimensionsRef.current = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1000, y: -1000 };
    }, []);

    useEffect(() => {
        handleResize();
        initCards();
        render();

        const onResize = () => {
            handleResize();
            initCards();
        };

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
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
                className="fixed inset-0"
                onMouseMove={handleMouseMove}
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
