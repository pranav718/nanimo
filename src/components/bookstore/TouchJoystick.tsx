'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchJoystickProps {
    onMove: (x: number, y: number) => void;
    onJump: () => void;
    onInteract: () => void;
    showInteract?: boolean;
}

export default function TouchJoystick({
    onMove,
    onJump,
    onInteract,
    showInteract = false,
}: TouchJoystickProps) {
    const isPhotoMode = useBookstoreStore((s) => s.isPhotoMode);
    const [active, setActive] = useState(false);
    const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
    const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const touchIdRef = useRef<number | null>(null);
    const zoneRef = useRef<HTMLDivElement>(null);

    const radius = 50;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (touchIdRef.current !== null) return;
        const touch = e.changedTouches[0];
        touchIdRef.current = touch.identifier;

        const rect = zoneRef.current?.getBoundingClientRect();
        if (!rect) return;

        const startX = touch.clientX - rect.left;
        const startY = touch.clientY - rect.top;

        setOrigin({ x: startX, y: startY });
        setKnobPos({ x: 0, y: 0 });
        setActive(true);
    }, []);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (touchIdRef.current === null || !origin || !zoneRef.current) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchIdRef.current) {
                    const rect = zoneRef.current.getBoundingClientRect();
                    const currentX = touch.clientX - rect.left;
                    const currentY = touch.clientY - rect.top;

                    let dx = currentX - origin.x;
                    let dy = currentY - origin.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > radius) {
                        dx = (dx / dist) * radius;
                        dy = (dy / dist) * radius;
                    }

                    setKnobPos({ x: dx, y: dy });

                    const normX = dx / radius;
                    const normY = dy / radius;
                    onMove(normX, normY);
                    break;
                }
            }
        },
        [origin, onMove]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (touchIdRef.current === null) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchIdRef.current) {
                    touchIdRef.current = null;
                    setActive(false);
                    setOrigin(null);
                    setKnobPos({ x: 0, y: 0 });
                    onMove(0, 0);
                    break;
                }
            }
        },
        [onMove]
    );

    useEffect(() => {
        return () => {
            onMove(0, 0);
        };
    }, [onMove]);

    if (isPhotoMode) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-30 md:hidden flex justify-between p-6">
            <div
                ref={zoneRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="pointer-events-auto relative h-44 w-44 touch-none rounded-full"
            >
                {active && origin && (
                    <div
                        style={{ left: origin.x, top: origin.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none h-24 w-24 rounded-full border border-white/20 bg-black/40 backdrop-blur-md"
                    >
                        <div
                            style={{
                                transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
                            }}
                            className="absolute top-1/2 left-1/2 h-10 w-10 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
                        />
                    </div>
                )}
            </div>

            <div className="pointer-events-auto flex flex-col justify-end gap-3 self-end mb-4">
                {showInteract && (
                    <button
                        onTouchStart={(e) => {
                            e.preventDefault();
                            onInteract();
                        }}
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400 bg-black/70 text-xs font-black text-amber-300 shadow-xl backdrop-blur-md active:scale-95"
                    >
                        E
                    </button>
                )}
                <button
                    onTouchStart={(e) => {
                        e.preventDefault();
                        onJump();
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/60 text-xs font-bold text-white shadow-xl backdrop-blur-md active:scale-95"
                >
                    JUMP
                </button>
            </div>
        </div>
    );
}
