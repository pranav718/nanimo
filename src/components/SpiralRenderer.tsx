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

const POSTER_WIDTH = 85;
const POSTER_HEIGHT = 120;
const LENS_RADIUS = 280;

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
    const count = Math.max(animeList.length, 300);

    const cols = Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / cols);

    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const baseX = col * cellWidth + cellWidth / 2;
        const baseY = row * cellHeight + cellHeight / 2;

        const jitterX = (Math.random() - 0.5) * cellWidth * 0.7;
        const jitterY = (Math.random() - 0.5) * cellHeight * 0.7;

        const x = baseX + jitterX;
        const y = baseY + jitterY;

        const animeIndex = i % Math.max(1, animeList.length);
        const anime = animeList[animeIndex];

        cards.push({
            x,
            y,
            anime,
            brightness: 0.4 + Math.random() * 0.6,
            twinkleSpeed: 0.8 + Math.random() * 2,
            starSize: 1 + Math.random() * 1.5,
        });
    }

    return cards;
}

function getBloomEffect(
    cardX: number,
    cardY: number,
    mouseX: number,
    mouseY: number
): { t: number; angle: number; distance: number } {
    const dx = cardX - mouseX;
    const dy = cardY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    if (distance > LENS_RADIUS) {
        return { t: 0, angle, distance };
    }

    const t = 1 - Math.pow(distance / LENS_RADIUS, 1.2);
    return { t: Math.max(0, t), angle, distance };
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

        smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.12;
        smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.12;

        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        const mouseX = smoothMouseRef.current.x;
        const mouseY = smoothMouseRef.current.y;

        const cardsWithEffect = cardsRef.current.map((card, index) => {
            const effect = getBloomEffect(card.x, card.y, mouseX, mouseY);
            return { card, effect, index };
        });

        cardsWithEffect.sort((a, b) => {
            if (a.effect.t === 0 && b.effect.t === 0) return 0;
            if (a.effect.t === 0) return -1;
            if (b.effect.t === 0) return 1;
            return a.effect.distance - b.effect.distance;
        });

        for (const { card, effect, index } of cardsWithEffect) {
            const { t, angle, distance } = effect;

            let drawX = card.x;
            let drawY = card.y;

            if (t > 0.1) {
                const pushAmount = t * 60;
                drawX = card.x + Math.cos(angle) * pushAmount;
                drawY = card.y + Math.sin(angle) * pushAmount;
            }

            if (t < 0.15) {
                const twinkle = 0.5 + 0.5 * Math.sin(
                    timeRef.current * card.twinkleSpeed + card.x * 0.02
                );
                const brightness = card.brightness * (0.6 + 0.4 * twinkle);
                const starRadius = card.starSize * (1 + t * 3);

                const glowRadius = starRadius * 3;
                const glow = ctx.createRadialGradient(
                    drawX, drawY, 0,
                    drawX, drawY, glowRadius
                );
                glow.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
                glow.addColorStop(0.4, `rgba(200, 220, 255, ${brightness * 0.3})`);
                glow.addColorStop(1, 'rgba(150, 180, 220, 0)');

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(drawX, drawY, starRadius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const cardT = (t - 0.15) / 0.85;
                const sizeFactor = Math.pow(cardT, 0.6);

                const centerBonus = 1 + (1 - distance / LENS_RADIUS) * 0.5;
                const w = (8 + (POSTER_WIDTH - 8) * sizeFactor) * centerBonus;
                const h = (8 + (POSTER_HEIGHT - 8) * sizeFactor) * centerBonus;

                if (cardT > 0.1 && card.anime && !card.loadedImage) {
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

                const showImage = cardT > 0.2 && card.loadedImage;
                const radius = Math.max(3, 10 * cardT);
                const rotation = (1 - cardT) * (angle + Math.PI / 2) * 0.3;

                ctx.save();
                ctx.translate(drawX, drawY);
                ctx.rotate(rotation);

                if (showImage && card.loadedImage) {
                    ctx.globalAlpha = Math.min(1, cardT * 1.8);
                    ctx.beginPath();
                    ctx.roundRect(-w / 2, -h / 2, w, h, radius);
                    ctx.clip();
                    ctx.drawImage(card.loadedImage, -w / 2, -h / 2, w, h);

                    if (cardT > 0.5) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${cardT * 0.5})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                } else {
                    const alpha = 0.4 + 0.5 * cardT;
                    ctx.fillStyle = `rgba(40, 50, 70, ${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(-w / 2, -h / 2, w, h, radius);
                    ctx.fill();

                    ctx.strokeStyle = `rgba(100, 120, 150, ${cardT * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        if (smoothMouseRef.current.x > 0 && smoothMouseRef.current.y > 0) {
            const gradient = ctx.createRadialGradient(
                smoothMouseRef.current.x, smoothMouseRef.current.y, 0,
                smoothMouseRef.current.x, smoothMouseRef.current.y, LENS_RADIUS * 0.5
            );
            gradient.addColorStop(0, 'rgba(100, 130, 180, 0.04)');
            gradient.addColorStop(0.5, 'rgba(80, 110, 160, 0.02)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(smoothMouseRef.current.x, smoothMouseRef.current.y, LENS_RADIUS * 0.5, 0, Math.PI * 2);
            ctx.fill();
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

        window.addEventListener('resize', () => {
            handleResize();
            initCards();
        });

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
