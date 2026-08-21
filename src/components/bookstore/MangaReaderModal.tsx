'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useState } from 'react';

export default function MangaReaderModal() {
    const { isReaderOpen, setReaderOpen, readingMedia, setReadingMedia, toggleSaveMedia, isMediaSaved } = useBookstoreStore();
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 8;

    const handleClose = useCallback(() => {
        setReaderOpen(false);
        setReadingMedia(null);
        setCurrentPage(1);
    }, [setReaderOpen, setReadingMedia]);

    const handleNext = useCallback(() => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isReaderOpen) return;
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                handleNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReaderOpen, handleClose, handleNext, handlePrev]);

    if (!isReaderOpen || !readingMedia) return null;

    const title = readingMedia.title.english || readingMedia.title.romaji || 'Manga Preview';
    const isSaved = isMediaSaved(readingMedia.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col items-center justify-between w-full max-w-4xl h-[92vh] rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412]/95 to-[#050505]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <div className="flex items-center justify-between w-full border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-300 uppercase">
                            Chapter 1 Preview
                        </span>
                        <h3 className="text-sm md:text-base font-bold text-white truncate max-w-md">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/50">
                            Page {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={handleClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="relative flex-1 flex items-center justify-center w-full my-4 overflow-hidden">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className="absolute left-2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-white/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                        ←
                    </button>

                    <div className="relative h-full aspect-[3/4] max-w-full rounded-2xl border-2 border-white/15 bg-[#0f0e0d] shadow-2xl overflow-hidden flex flex-col justify-between p-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                            <span>NANIMO MANGA READER</span>
                            <span>{title.slice(0, 20)}</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            {currentPage === 1 ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        className="h-56 w-40 rounded-xl bg-cover bg-center shadow-2xl border border-white/20"
                                        style={{
                                            backgroundImage: `url(${readingMedia.coverImage.extraLarge || readingMedia.coverImage.large})`,
                                        }}
                                    />
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{title}</h4>
                                        <p className="text-xs text-amber-400 font-semibold mt-1">
                                            {readingMedia.genres.join(' • ')}
                                        </p>
                                    </div>
                                    <p className="text-xs text-white/60 max-w-sm line-clamp-3">
                                        {readingMedia.description?.replace(/<[^>]*>?/gm, '') || 'No synopsis.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-md text-left">
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 font-serif text-xs md:text-sm text-white/80 leading-relaxed">
                                        <p className="text-amber-300 font-sans font-bold text-xs uppercase tracking-wider">
                                            Page Scene {currentPage - 1}
                                        </p>
                                        <p>
                                            The rain quietly tapped against the glass windows of the midnight bookstore.
                                            Turning the page revealed vivid hand-inked panels capturing the intense emotion of the story.
                                        </p>
                                        <p className="text-white/50 text-xs">
                                            Score rating: {readingMedia.averageScore}% • Status: {readingMedia.status || 'Releasing'}
                                        </p>
                                    </div>
                                    <div className="h-36 rounded-xl border border-dashed border-white/15 bg-black/40 flex items-center justify-center text-xs text-white/40">
                                        [ High Resolution Manga Panel Preview ]
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/40 font-mono">
                            <span>Use Left / Right Keys</span>
                            <span>{currentPage}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="absolute right-2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-white/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                        →
                    </button>
                </div>

                <div className="flex items-center justify-between w-full pt-3 border-t border-white/10 gap-3">
                    <button
                        onClick={() => toggleSaveMedia(readingMedia)}
                        className={`py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            isSaved
                                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                        }`}
                    >
                        {isSaved ? 'Saved in My Shelf' : 'Save to Shelf'}
                    </button>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://anilist.co/manga/${readingMedia.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md"
                        >
                            Read Full on AniList
                        </a>
                        <button
                            onClick={handleClose}
                            className="py-2 px-4 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                            Exit Reader
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
