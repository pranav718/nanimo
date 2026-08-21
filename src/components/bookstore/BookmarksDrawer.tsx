'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function BookmarksDrawer() {
    const {
        isBookmarksOpen,
        setBookmarksOpen,
        savedMedia,
        setInspectedMedia,
        toggleSaveMedia,
        setExportOpen,
    } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setBookmarksOpen(false);
    }, [setBookmarksOpen]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'b' || e.key === 'B') {
                if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                    setBookmarksOpen(!isBookmarksOpen);
                }
            } else if (e.key === 'Escape' && isBookmarksOpen) {
                handleClose();
            }
        },
        [isBookmarksOpen, setBookmarksOpen, handleClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isBookmarksOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-md h-full bg-gradient-to-b from-[#181412]/95 to-[#0a0808]/95 border-l border-white/15 p-6 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            My Saved Shelf
                        </h2>
                        <p className="text-xs text-white/40 tracking-wider uppercase mt-0.5">
                            {savedMedia.length} Volumes Saved
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {savedMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-white/40 text-xs gap-2">
                            <p>No volumes saved yet.</p>
                            <p className="text-[11px] text-white/30">
                                Click &quot;Save to Shelf&quot; when inspecting any volume in the store.
                            </p>
                        </div>
                    ) : (
                        savedMedia.map((item) => {
                            const title = item.title.english || item.title.romaji || 'Unknown Title';
                            return (
                                <div
                                    key={item.id}
                                    className="group flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 transition-all"
                                >
                                    <div
                                        onClick={() => {
                                            setInspectedMedia(item);
                                            handleClose();
                                        }}
                                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                    >
                                        <div
                                            className="h-14 w-10 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                                            style={{
                                                backgroundImage: `url(${item.coverImage.medium || item.coverImage.large})`,
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                                {title}
                                            </h4>
                                            <span className="text-[10px] text-amber-400 font-medium">
                                                {item.averageScore ? `Score: ${item.averageScore}%` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleSaveMedia(item)}
                                        title="Remove from Shelf"
                                        className="text-xs text-white/40 hover:text-rose-400 p-2 transition-colors shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {savedMedia.length > 0 && (
                    <div className="pt-4 mt-2 border-t border-white/10">
                        <button
                            onClick={() => {
                                setExportOpen(true);
                                handleClose();
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                        >
                            Export & Backup Shelf (.md / .json)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
