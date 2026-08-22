'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function BookstorePassportModal() {
    const {
        isPassportOpen,
        setPassportOpen,
        visitedFloors,
        hasOrderedCafe,
        hasRolledGachapon,
        hasTakenQuiz,
        savedMedia,
    } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setPassportOpen(false);
    }, [setPassportOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPassportOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPassportOpen, handleClose]);

    if (!isPassportOpen) return null;

    const stamps = [
        {
            id: 'floor1',
            title: 'Manga Sanctuary',
            titleJp: '漫画の聖域',
            desc: 'Stepped into Floor 1 Manga archives',
            unlocked: visitedFloors.includes(1),
            color: 'border-amber-400 text-amber-300',
        },
        {
            id: 'floor2',
            title: 'Anime Screening Lounge',
            titleJp: '大劇場シアター',
            desc: 'Explored Floor 2 Anime screening theater',
            unlocked: visitedFloors.includes(2),
            color: 'border-sky-400 text-sky-300',
        },
        {
            id: 'floor3',
            title: 'Starlit Observatory',
            titleJp: '屋上桜展望台',
            desc: 'Stood under falling sakura petals on 3F',
            unlocked: visitedFloors.includes(3),
            color: 'border-pink-400 text-pink-300',
        },
        {
            id: 'cafe',
            title: 'Cafe Nanimo Sommelier',
            titleJp: '喫茶ナニモ',
            desc: 'Ordered a drink pairing from Barista Aoi',
            unlocked: hasOrderedCafe,
            color: 'border-emerald-400 text-emerald-300',
        },
        {
            id: 'gachapon',
            title: 'Gachapon Capsule',
            titleJp: 'ガチャポン運試し',
            desc: 'Turned the crank for a mystery drop',
            unlocked: hasRolledGachapon,
            color: 'border-rose-400 text-rose-300',
        },
        {
            id: 'quiz',
            title: 'Soul Personality Match',
            titleJp: '魂の適性診断',
            desc: 'Discovered your anime soul archetype',
            unlocked: hasTakenQuiz,
            color: 'border-purple-400 text-purple-300',
        },
        {
            id: 'shelf',
            title: 'Personal Shelf Curator',
            titleJp: '私の本棚収集',
            desc: 'Saved favorite volumes to your 3D shelf',
            unlocked: savedMedia.length > 0,
            color: 'border-yellow-400 text-yellow-300',
        },
        {
            id: 'master',
            title: 'Nanimo Grand Master',
            titleJp: '全館完全制覇',
            desc: 'Completed every in-store experience',
            unlocked:
                visitedFloors.length === 3 &&
                hasOrderedCafe &&
                hasRolledGachapon &&
                hasTakenQuiz &&
                savedMedia.length > 0,
            color: 'border-amber-300 text-amber-200 bg-amber-400/20',
        },
    ];

    const completedCount = stamps.filter((s) => s.unlocked).length;
    const progressPercent = Math.round((completedCount / stamps.length) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#20150d]/95 to-[#0b0805]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-300 uppercase tracking-widest">
                                Nanimo Passport
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                {completedCount} / {stamps.length} Stamps
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
                            Store Exploration Passport
                        </h2>
                    </div>

                    <div className="text-right mr-10">
                        <span className="text-2xl font-extrabold font-mono text-amber-400">
                            {progressPercent}%
                        </span>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            Explored
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stamps.map((st) => (
                        <div
                            key={st.id}
                            className={`relative flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                                st.unlocked
                                    ? `bg-white/5 ${st.color} shadow-lg`
                                    : 'border-white/5 bg-white/5 opacity-40 grayscale'
                            }`}
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 font-bold font-serif text-sm shrink-0 ${
                                    st.unlocked ? st.color : 'border-white/20 text-white/40'
                                }`}
                            >
                                印
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white truncate">
                                        {st.title}
                                    </h4>
                                    <span className="text-[10px] font-medium text-white/40">
                                        {st.titleJp}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                                    {st.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
                    <span>Nanimo Spatial Archive & Pilgrimage</span>
                    <button
                        onClick={handleClose}
                        className="py-2 px-6 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                    >
                        Keep Exploring
                    </button>
                </div>
            </div>
        </div>
    );
}
