'use client';

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

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchIdRef.current === null || !origin) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === touchIdRef.current) {
                const rect = zoneRef.current?.getBoundingClientRect();
                if (!rect) return;

                const currentX = touch.clientX - rect.left;
                const currentY = touch.clientY - rect.top;

                const dx = currentX - origin.x;
                const dy = currentY - origin.y;
                const dist = Math.hypot(dx, dy);

                const clampedDist = Math.min(dist, radius);
                const angle = Math.atan2(dy, dx);

                const knobX = Math.cos(angle) * clampedDist;
                const knobY = Math.sin(angle) * clampedDist;

                setKnobPos({ x: knobX, y: knobY });

                const normalizedX = knobX / radius;
                const normalizedY = -knobY / radius;
                onMove(normalizedX, normalizedY);
                break;
            }
        }
    }, [origin, onMove]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchIdRef.current) {
                touchIdRef.current = null;
                setActive(false);
                setOrigin(null);
                setKnobPos({ x: 0, y: 0 });
                onMove(0, 0);
                break;
            }
        }
    }, [onMove]);

    return (
        <>
            <div
                ref={zoneRef}
                className="fixed bottom-0 left-0 w-1/2 h-1/2 z-20 touch-none md:hidden select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {active && origin && (
                    <div
                        className="absolute pointer-events-none rounded-full border border-white/30 bg-white/10 backdrop-blur-md -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
                        style={{
                            left: origin.x,
                            top: origin.y,
                            width: radius * 2,
                            height: radius * 2,
                        }}
                    >
                        <div
                            className="absolute rounded-full bg-white/60 shadow-lg -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: radius + knobPos.x,
                                top: radius + knobPos.y,
                                width: 44,
                                height: 44,
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="fixed bottom-8 right-8 z-20 flex flex-col gap-4 md:hidden">
                {showInteract && (
                    <button
                        onClick={onInteract}
                        className="w-16 h-16 rounded-full bg-amber-500/80 border border-amber-300 text-white font-bold text-lg shadow-xl active:scale-95 transition-transform backdrop-blur-md"
                    >
                        E
                    </button>
                )}
                <button
                    onClick={onJump}
                    className="w-16 h-16 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-sm shadow-xl active:scale-95 transition-transform backdrop-blur-md"
                >
                    JUMP
                </button>
            </div>
        </>
    );
}
