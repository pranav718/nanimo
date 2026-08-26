'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface KaraokeSong {
    id: string;
    title: string;
    titleJp: string;
    anime: string;
    artist: string;
    lyrics: { jp: string; romaji: string; en: string }[];
    tempo: number;
}

export default function AnimeKaraokeModal() {
    const { isKaraokeOpen, setKaraokeOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedSongIdx, setSelectedSongIdx] = useState<number>(0);
    const [currentLine, setCurrentLine] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [score, setScore] = useState<number>(94);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const songs: KaraokeSong[] = [
        {
            id: 'evangelion',
            title: "A Cruel Angel's Thesis",
            titleJp: '残酷な天使のテーゼ',
            anime: 'Neon Genesis Evangelion',
            artist: 'Yoko Takahashi',
            tempo: 128,
            lyrics: [
                { jp: '残酷な天使のように 少年よ 神話になれ', romaji: 'Zankoku na tenshi no you ni, shounen yo shinwa ni nare', en: 'Like a cruel angel, young boy, become a legend' },
                { jp: '蒼い風がいま 胸のドアを叩いても', romaji: 'Aoi kaze ga ima, mune no doa wo tataitemo', en: 'Even if the blue wind knocks upon the door of your heart now' },
                { jp: '私だけをただ見つめて 微笑んでるあなた', romaji: 'Watashi dake wo tada mitsumete, hohoenderu anata', en: 'Gazing only at me, you are smiling gently' },
                { jp: 'そっとふれるもの もとめることに夢中で', romaji: 'Sotto fureru mono, motomeru koto ni muchuu de', en: 'So engrossed in seeking things to touch softly' },
            ],
        },
        {
            id: 'gurenge',
            title: 'Gurenge (Red Lotus)',
            titleJp: '紅蓮華',
            anime: 'Demon Slayer: Kimetsu no Yaiba',
            artist: 'LiSA',
            tempo: 135,
            lyrics: [
                { jp: '強くなれる理由を知った 僕を連れて進め', romaji: 'Tsuyoku nareru riyuu wo shitta, boku wo tsurete susume', en: 'I found the reason to become stronger, take me forward' },
                { jp: '泥だらけの走馬灯に酔う こわばる心', romaji: 'Dorodarake no soumatou ni you, kowabaru kokoro', en: 'Drunk on the muddy kaleidoscope of memories, a trembling heart' },
                { jp: '震える手は掴みたいものがある それだけさ', romaji: 'Furueru te wa tsukamitai mono ga aru, sore dake sa', en: 'My trembling hands have something they want to grasp, that is all' },
            ],
        },
        {
            id: 'bluebird',
            title: 'Blue Bird',
            titleJp: 'ブルーバード',
            anime: 'Naruto Shippuden',
            artist: 'Ikimonogakari',
            tempo: 152,
            lyrics: [
                { jp: '飛翔いたら 戻らないと言って', romaji: 'Habataitara modoranai to itte', en: 'If you take flight, say that you will never return' },
                { jp: '目指したのは 蒼い 蒼い あの空', romaji: 'Mezashita no wa aoi aoi ano sora', en: 'What you aimed for was that blue, blue sky' },
                { jp: '悲しみはまだ覚えられず 切なさは今つかみはじめた', romaji: 'Kanashimi wa mada oboerarezu, setsunasa wa ima tsukami hajimeta', en: 'Having not yet learned sorrow, only now beginning to grasp heartbreak' },
            ],
        },
    ];

    const currentSong = songs[selectedSongIdx];

    const handleClose = useCallback(() => {
        setIsPlaying(false);
        setKaraokeOpen(false);
    }, [setKaraokeOpen]);

    const playNote = (freq: number) => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);
    };

    const nextLyric = () => {
        playNote(440 + currentLine * 55);
        if (currentLine < currentSong.lyrics.length - 1) {
            setCurrentLine((prev) => prev + 1);
            setScore((prev) => Math.min(100, prev + 1));
        } else {
            setCurrentLine(0);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isKaraokeOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isKaraokeOpen, handleClose]);

    if (!isKaraokeOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#240a18]/95 to-[#0b0308]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-pink-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 border border-pink-400/40 text-pink-300 font-bold font-mono">
                        MIC
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Anime Karaoke Rhythm Studio
                        </h2>
                        <p className="text-xs text-pink-400 font-medium">
                            Floor 2 Screening Lounge • Live Lyrics & Pitch Scoring
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                    {songs.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => {
                                setSelectedSongIdx(idx);
                                setCurrentLine(0);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                                selectedSongIdx === idx
                                    ? 'border-pink-400 bg-pink-500/20 shadow-md ring-1 ring-pink-400'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <span className="text-[10px] font-mono font-bold text-pink-300 block truncate">
                                {s.anime}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                                {s.title}
                            </h4>
                        </button>
                    ))}
                </div>

                <div className="bg-black/60 rounded-2xl p-6 border border-white/10 mb-6 flex flex-col space-y-4 text-center">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-pink-400 font-bold">
                            {currentSong.artist} • {currentSong.tempo} BPM
                        </span>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                            Pitch Score: {score} pts
                        </span>
                    </div>

                    <div className="py-4 space-y-2">
                        <h3 className="text-2xl font-bold text-white tracking-wide">
                            {currentSong.lyrics[currentLine].jp}
                        </h3>
                        <p className="text-sm font-mono text-pink-300">
                            {currentSong.lyrics[currentLine].romaji}
                        </p>
                        <p className="text-xs text-white/50 italic">
                            &quot;{currentSong.lyrics[currentLine].en}&quot;
                        </p>
                    </div>

                    <button
                        onClick={nextLyric}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-pink-400 hover:to-rose-400 transition-all"
                    >
                        Sing Next Lyric Phrase
                    </button>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Exit Karaoke Booth
                </button>
            </div>
        </div>
    );
}
