import SpiralRenderer from '@/components/SpiralRenderer';

export default function ExplorePage() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-black">
            <SpiralRenderer />

            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h1 className="text-4xl font-bold text-white/90 tracking-tight">
                    何も
                </h1>
                <p className="text-sm text-white/50 mt-1">
                    nanimo: discover anime
                </p>
            </div>

            <div className="absolute bottom-8 left-8 z-10 pointer-events-none">
                <p className="text-xs text-white/30">
                    drag to pan • hover to reveal
                </p>
            </div>
        </main>
    );
}
