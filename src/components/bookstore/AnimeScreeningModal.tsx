'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function AnimeScreeningModal() {
    const { inspectedMedia, setInspectedMedia, currentFloor, toggleSaveMedia, isMediaSaved } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setInspectedMedia(null);
    }, [setInspectedMedia]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    if (!inspectedMedia || currentFloor === 1) return null;

    const title = inspectedMedia.title.english || inspectedMedia.title.romaji || 'Unknown Title';
    const score = inspectedMedia.averageScore ? `${inspectedMedia.averageScore}%` : 'N/A';
    const cleanDesc = inspectedMedia.description?.replace(/<[^>]*>?/gm, '') || 'No synopsis available.';
    const trailerId = inspectedMedia.trailer?.site === 'youtube' ? inspectedMedia.trailer.id : null;
    const isSaved = isMediaSaved(inspectedMedia.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-3xl border border-sky-500/20 bg-gradient-to-b from-[#0f172a]/95 to-[#020617]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/10 mb-6">
                    {trailerId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <div
                            className="w-full h-full bg-cover bg-center flex flex-col items-center justify-center text-center p-6"
                            style={{
                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3)), url(${inspectedMedia.bannerImage || inspectedMedia.coverImage.extraLarge || inspectedMedia.coverImage.large})`,
                            }}
                        >
                            <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-4 py-1 text-xs font-bold uppercase tracking-widest text-sky-300 mb-2">
                                Screening Preview
                            </span>
                            <h3 className="text-2xl font-extrabold text-white">{title}</h3>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-0.5 text-xs font-semibold text-sky-300">
                            Score: {score}
                        </span>
                        {inspectedMedia.episodes && (
                            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-medium text-white/80">
                                {inspectedMedia.episodes} Episodes
                            </span>
                        )}
                        {inspectedMedia.seasonYear && (
                            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs font-medium text-white/80">
                                Year: {inspectedMedia.seasonYear}
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>

                    <div className="flex flex-wrap gap-1.5">
                        {inspectedMedia.genres.map((g) => (
                            <span
                                key={g}
                                className="rounded-md bg-sky-900/30 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-medium text-sky-200"
                            >
                                {g}
                            </span>
                        ))}
                    </div>

                    <p className="text-xs md:text-sm leading-relaxed text-white/70">
                        {cleanDesc}
                    </p>

                    <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-white/10">
                        <button
                            onClick={() => toggleSaveMedia(inspectedMedia)}
                            className={`w-full py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                                isSaved
                                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-400/10'
                                    : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                            }`}
                        >
                            {isSaved ? 'Saved in My Shelf' : 'Save to My Shelf'}
                        </button>

                        <div className="flex items-center gap-3">
                            <a
                                href={`https://anilist.co/anime/${inspectedMedia.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:from-sky-400 hover:to-blue-500 transition-all"
                            >
                                View on AniList
                            </a>
                            <button
                                onClick={handleClose}
                                className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all"
                            >
                                Back to Lounge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
