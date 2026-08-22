'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useEffect, useRef } from 'react';

export default function AmbientAudioPlayer() {
    const { isAudioPlaying, currentFloor, playerPosition } = useBookstoreStore();
    const audioCtxRef = useRef<AudioContext | null>(null);
    const rainNodeRef = useRef<AudioNode | null>(null);
    const chordsIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastFloorRef = useRef<number>(currentFloor);
    const lastPosRef = useRef<[number, number, number]>(playerPosition);
    const stepTimerRef = useRef<number>(0);

    const playFloorChime = (ctx: AudioContext) => {
        const notes = [587.33, 493.88, 392.00, 440.00, 587.33];
        const now = ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.18);

            gain.gain.setValueAtTime(0, now + idx * 0.18);
            gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.18 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.18);
            osc.stop(now + idx * 0.18 + 0.65);
        });
    };

    const playFootstep = (ctx: AudioContext, floor: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const now = ctx.currentTime;

        if (floor === 1) {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(450, now);

            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        } else if (floor === 2) {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, now);

            gain.gain.setValueAtTime(0.015, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        } else {
            osc.type = 'square';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(800, now);

            gain.gain.setValueAtTime(0.012, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        }

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    };

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
        chordsIntervalRef.current = setInterval(playChord, 8000);

        return () => {
            if (chordsIntervalRef.current) {
                clearInterval(chordsIntervalRef.current);
                chordsIntervalRef.current = null;
            }
        };
    }, [isAudioPlaying]);

    useEffect(() => {
        if (currentFloor !== lastFloorRef.current) {
            lastFloorRef.current = currentFloor;
            if (isAudioPlaying && audioCtxRef.current && audioCtxRef.current.state === 'running') {
                playFloorChime(audioCtxRef.current);
            }
        }
    }, [currentFloor, isAudioPlaying]);

    useEffect(() => {
        if (!isAudioPlaying || !audioCtxRef.current || audioCtxRef.current.state !== 'running') return;

        const dx = playerPosition[0] - lastPosRef.current[0];
        const dz = playerPosition[2] - lastPosRef.current[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        lastPosRef.current = playerPosition;

        if (dist > 0.08) {
            const now = performance.now();
            if (now - stepTimerRef.current > 280) {
                stepTimerRef.current = now;
                playFootstep(audioCtxRef.current, currentFloor);
            }
        }
    }, [playerPosition, isAudioPlaying, currentFloor]);

    return null;
}
