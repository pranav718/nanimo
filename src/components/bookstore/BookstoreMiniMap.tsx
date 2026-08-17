'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { BookstoreGenre } from '@/types';
import { useCallback, useState } from 'react';

interface MiniMapProps {
    onTeleport: (x: number, z: number) => void;
}

interface LocationPoint {
    id: string;
    label: string;
    labelJp: string;
    x: number;
    z: number;
    floor: number;
    genre?: BookstoreGenre;
}

export default function BookstoreMiniMap({ onTeleport }: MiniMapProps) {
    const { currentFloor, setCurrentFloor, playerPosition, isFastTravelOpen, setFastTravelOpen } = useBookstoreStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const locations: LocationPoint[] = [
        { id: 'm-romance', label: 'Romance Aisle', labelJp: '恋愛', x: -13, z: 10, floor: 1, genre: 'Romance' },
        { id: 'm-slice', label: 'Slice of Life', labelJp: '日常', x: -13, z: 0, floor: 1, genre: 'Slice of Life' },
        { id: 'm-mystery', label: 'Mystery & Seinen', labelJp: '推理', x: -13, z: -10, floor: 1, genre: 'Mystery' },
        { id: 'm-action', label: 'Action & Shonen', labelJp: '少年', x: 13, z: 10, floor: 1, genre: 'Action' },
        { id: 'm-fantasy', label: 'Fantasy & Isekai', labelJp: '異世界', x: 13, z: 0, floor: 1, genre: 'Fantasy' },
        { id: 'm-scifi', label: 'Sci-Fi Vault', labelJp: 'SF', x: 13, z: -10, floor: 1, genre: 'Sci-Fi' },
        { id: 'm-elevator', label: 'Glass Elevator', labelJp: '昇降機', x: 0, z: -16, floor: 1 },

        { id: 'a-cinema', label: 'Main Cinema Screen', labelJp: '大劇場', x: 0, z: -10, floor: 2 },
        { id: 'a-action', label: 'Action Anime Pod', labelJp: '少年アニメ', x: -13, z: 8, floor: 2, genre: 'Action' },
        { id: 'a-romance', label: 'Romance Lounge', labelJp: '恋愛アニメ', x: -13, z: -2, floor: 2, genre: 'Romance' },
        { id: 'a-mystery', label: 'Psychological Pod', labelJp: '青年アニメ', x: -13, z: 16, floor: 2, genre: 'Mystery' },
        { id: 'a-fantasy', label: 'Fantasy Pod', labelJp: '異世界アニメ', x: 13, z: 8, floor: 2, genre: 'Fantasy' },
        { id: 'a-scifi', label: 'Sci-Fi Station', labelJp: 'SFアニメ', x: 13, z: -2, floor: 2, genre: 'Sci-Fi' },
        { id: 'a-slice', label: 'Chill Lounge', labelJp: '日常アニメ', x: 13, z: 16, floor: 2, genre: 'Slice of Life' },
        { id: 'a-elevator', label: 'Glass Elevator', labelJp: '昇降機', x: 0, z: -16, floor: 2 },
    ];

    const currentFloorLocations = locations.filter((loc) => loc.floor === currentFloor);

    const worldToMap = useCallback((wx: number, wz: number, mapSize = 140) => {
        const halfRoom = 22;
        const nx = (wx + halfRoom) / (halfRoom * 2);
        const nz = (wz + halfRoom) / (halfRoom * 2);
        return {
            x: Math.max(8, Math.min(mapSize - 8, nx * mapSize)),
            y: Math.max(8, Math.min(mapSize - 8, nz * mapSize)),
        };
    }, []);

    const playerMapPos = worldToMap(playerPosition[0], playerPosition[2]);

    const handleJump = (loc: LocationPoint) => {
        if (loc.floor !== currentFloor) {
            setCurrentFloor(loc.floor as 1 | 2 | 3);
        }
        onTeleport(loc.x, loc.z);
        setFastTravelOpen(false);
        setIsExpanded(false);
    };

    return (
        <>
            <div className="pointer-events-auto fixed top-6 right-6 z-30 flex flex-col items-end gap-3">
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group relative h-36 w-36 overflow-hidden rounded-2xl border border-white/20 bg-black/70 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-amber-400/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-50" />
                    
                    <div className="relative h-full w-full rounded-xl border border-dashed border-white/10 bg-white/5">
                        <div className="absolute top-1 left-1.5 text-[9px] font-bold tracking-widest text-amber-300/80 uppercase">
                            {currentFloor}F RADAR
                        </div>

                        {currentFloorLocations.map((loc) => {
                            const pos = worldToMap(loc.x, loc.z, 120);
                            return (
                                <div
                                    key={loc.id}
                                    style={{ left: pos.x, top: pos.y }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleJump(loc);
                                    }}
                                >
                                    <div className="h-2 w-2 rounded-full bg-amber-400/80 ring-2 ring-amber-400/30 transition-transform group-hover/pin:scale-150" />
                                </div>
                            );
                        })}

                        <div
                            style={{ left: playerMapPos.x * 0.85, top: playerMapPos.y * 0.85 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        >
                            <div className="h-3 w-3 rounded-full bg-sky-400 ring-4 ring-sky-400/40 animate-pulse" />
                        </div>
                    </div>
                    <span className="absolute bottom-1 right-2 text-[8px] tracking-wider text-white/30 uppercase">
                        Click Map
                    </span>
                </div>
            </div>

            {(isExpanded || isFastTravelOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
                    <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412]/95 to-[#0a0808]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">
                                    Fast Travel & Directory
                                </h2>
                                <p className="text-xs text-white/40 tracking-wider uppercase mt-0.5">
                                    Instant Teleportation to Any Aisle or Floor
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsExpanded(false);
                                    setFastTravelOpen(false);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setCurrentFloor(1)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    currentFloor === 1
                                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                1F • Manga Sanctuary
                            </button>
                            <button
                                onClick={() => setCurrentFloor(2)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    currentFloor === 2
                                        ? 'bg-sky-400 text-black shadow-lg shadow-sky-400/20'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                2F • Anime Screening Lounge
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1">
                            {currentFloorLocations.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => handleJump(loc)}
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-400/50 transition-all text-left"
                                >
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                                            {loc.label}
                                        </h4>
                                        <p className="text-xs text-white/40 mt-0.5">{loc.labelJp}</p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-400/80 group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
