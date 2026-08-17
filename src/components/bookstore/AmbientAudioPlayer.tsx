'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useEffect, useRef } from 'react';

export default function AmbientAudioPlayer() {
    const { isAudioPlaying } = useBookstoreStore();
    const audioCtxRef = useRef<AudioContext | null>(null);
    const rainNodeRef = useRef<AudioNode | null>(null);
    const chordsIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isAudioPlaying) {
            if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
                audioCtxRef.current.suspend();
            }
            if (chordsIntervalRef.current) {
                clearInterval(chordsIntervalRef.current);
                chordsIntervalRef.current = null;
            }
            return;
        }

        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        if (!rainNodeRef.current) {
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.04, ctx.currentTime);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();

            rainNodeRef.current = noise;
        }

        const chords = [
            [261.63, 329.63, 392.00, 493.88],
            [220.00, 261.63, 329.63, 392.00],
            [174.61, 220.00, 261.63, 329.63],
            [196.00, 246.94, 293.66, 349.23],
        ];

        let chordIndex = 0;

        const playChord = () => {
            if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
            const currentCtx = audioCtxRef.current;
            const chord = chords[chordIndex % chords.length];
            chordIndex++;

            chord.forEach((freq) => {
                const osc = currentCtx.createOscillator();
                const gain = currentCtx.createGain();
                const filter = currentCtx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, currentCtx.currentTime);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, currentCtx.currentTime);

                gain.gain.setValueAtTime(0, currentCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.015, currentCtx.currentTime + 1.5);
                gain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 5.5);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(currentCtx.destination);

                osc.start();
                osc.stop(currentCtx.currentTime + 6.0);
            });
        };

        playChord();
        chordsIntervalRef.current = setInterval(playChord, 5500);

        return () => {
            if (chordsIntervalRef.current) {
                clearInterval(chordsIntervalRef.current);
                chordsIntervalRef.current = null;
            }
        };
    }, [isAudioPlaying]);

    return null;
}
