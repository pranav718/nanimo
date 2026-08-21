'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useState } from 'react';

export default function ShelfExportModal() {
    const { isExportOpen, setExportOpen, savedMedia } = useBookstoreStore();
    const [copied, setCopied] = useState(false);
    const [format, setFormat] = useState<'md' | 'json' | 'csv'>('md');

    const handleClose = useCallback(() => {
        setExportOpen(false);
        setCopied(false);
    }, [setExportOpen]);

    const generateMarkdown = () => {
        let md = `# Nanimo Bookstore - Saved Archive\n\n`;
        md += `Exported on: ${new Date().toLocaleDateString()}\n`;
        md += `Total Volumes: ${savedMedia.length}\n\n`;
        md += `| Title | Format | Score | Genres | AniList Link |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;

        savedMedia.forEach((m) => {
            const title = m.title.english || m.title.romaji || 'Unknown';
            const score = m.averageScore ? `${m.averageScore}%` : 'N/A';
            const genres = m.genres.slice(0, 3).join(', ');
            const type = m.format || 'MANGA';
            const link = `https://anilist.co/${type.toLowerCase() === 'anime' ? 'anime' : 'manga'}/${m.id}`;
            md += `| ${title} | ${type} | ${score} | ${genres} | [View](${link}) |\n`;
        });
        return md;
    };

    const generateJSON = () => {
        return JSON.stringify(
            {
                exportedAt: new Date().toISOString(),
                totalSaved: savedMedia.length,
                items: savedMedia.map((m) => ({
                    id: m.id,
                    title: m.title,
                    format: m.format,
                    genres: m.genres,
                    score: m.averageScore,
                    episodes: m.episodes,
                    chapters: m.chapters,
                    description: m.description,
                    url: `https://anilist.co/manga/${m.id}`,
                })),
            },
            null,
            2
        );
    };

    const generateCSV = () => {
        let csv = `ID,Title,Format,Score,Genres,URL\n`;
        savedMedia.forEach((m) => {
            const title = `"${(m.title.english || m.title.romaji || '').replace(/"/g, '""')}"`;
            const genres = `"${m.genres.join('; ')}"`;
            const score = m.averageScore || '';
            const type = m.format || 'MANGA';
            const link = `https://anilist.co/manga/${m.id}`;
            csv += `${m.id},${title},${type},${score},${genres},${link}\n`;
        });
        return csv;
    };

    const getContent = () => {
        if (format === 'md') return generateMarkdown();
        if (format === 'json') return generateJSON();
        return generateCSV();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getContent());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const text = getContent();
        const mime = format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/markdown';
        const blob = new Blob([text], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nanimo-shelf-archive.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isExportOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExportOpen, handleClose]);

    if (!isExportOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412]/95 to-[#080706]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Export & Backup Shelf
                        </h2>
                        <p className="text-xs text-white/40 tracking-wider uppercase mt-0.5">
                            {savedMedia.length} Volumes in Archive
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 p-1 mr-10">
                        {(['md', 'json', 'csv'] as const).map((fmt) => (
                            <button
                                key={fmt}
                                onClick={() => setFormat(fmt)}
                                className={`rounded-full px-3 py-0.5 text-xs font-mono font-bold uppercase transition-all ${
                                    format === fmt
                                        ? 'bg-amber-400 text-black shadow-md'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-white/80 whitespace-pre leading-relaxed select-text">
                    {getContent()}
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-white/10">
                    <button
                        onClick={handleCopy}
                        className={`py-2.5 px-6 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                            copied
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                        }`}
                    >
                        {copied ? 'Copied to Clipboard' : 'Copy All'}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                        >
                            Download .{format} File
                        </button>
                        <button
                            onClick={handleClose}
                            className="py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
