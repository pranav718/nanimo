'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { AnimeMedia } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function StoreSearchModal() {
    const {
        isSearchOpen,
        setSearchOpen,
        mangaGenres,
        animeGenres,
        trendingAnime,
        trendingManga,
        setInspectedMedia,
    } = useBookstoreStore();

    const [query, setQuery] = useState('');

    const handleClose = useCallback(() => {
        setSearchOpen(false);
        setQuery('');
    }, [setSearchOpen]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setSearchOpen(!isSearchOpen);
        } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            setSearchOpen(true);
        } else if (e.key === 'Escape' && isSearchOpen) {
            handleClose();
        }
    }, [isSearchOpen, setSearchOpen, handleClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const allMedia = useMemo(() => {
        const set = new Map<number, AnimeMedia>();
        Object.values(mangaGenres).forEach((list) => list.forEach((m) => set.set(m.id, m)));
        Object.values(animeGenres).forEach((list) => list.forEach((m) => set.set(m.id, m)));
        trendingAnime.forEach((m) => set.set(m.id, m));
        trendingManga.forEach((m) => set.set(m.id, m));
        return Array.from(set.values());
    }, [mangaGenres, animeGenres, trendingAnime, trendingManga]);

    const filtered = useMemo(() => {
        if (!query.trim()) return allMedia.slice(0, 12);
        const q = query.toLowerCase();
        return allMedia.filter((m) => {
            const en = m.title.english?.toLowerCase() || '';
            const ro = m.title.romaji?.toLowerCase() || '';
            const genres = m.genres.join(' ').toLowerCase();
            return en.includes(q) || ro.includes(q) || genres.includes(q);
        }).slice(0, 16);
    }, [allMedia, query]);

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-2xl max-h-[75vh] rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412] to-[#0a0808] p-6 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search anime, manga, or genres (e.g., Romance, Jujutsu)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white text-base placeholder-white/40 focus:outline-none"
                    />
                    <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/50">ESC</kbd>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center text-white/40 text-xs">
                            No titles found matching &quot;{query}&quot;
                        </div>
                    ) : (
                        filtered.map((item) => {
                            const title = item.title.english || item.title.romaji || 'Unknown Title';
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setInspectedMedia(item);
                                        handleClose();
                                    }}
                                    className="group flex items-center justify-between w-full p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div
                                            className="h-12 w-9 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                                            style={{
                                                backgroundImage: `url(${item.coverImage.medium || item.coverImage.large})`,
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                                                {title}
                                            </h4>
                                            <p className="text-[11px] text-white/50 truncate">
                                                {item.genres.slice(0, 3).join(' • ')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-semibold text-amber-400 shrink-0 ml-3">
                                        {item.averageScore ? `${item.averageScore}%` : ''}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
