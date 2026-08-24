'use client';

import dynamic from 'next/dynamic';
import AmbientAudioPlayer from './bookstore/AmbientAudioPlayer';
import AnimeQuizModal from './bookstore/AnimeQuizModal';
import AnimeScreeningModal from './bookstore/AnimeScreeningModal';
import AnimeSoundboardModal from './bookstore/AnimeSoundboardModal';
import AnimeSynthesizerModal from './bookstore/AnimeSynthesizerModal';
import AnimeTriviaArcadeModal from './bookstore/AnimeTriviaArcadeModal';
import AvatarCustomizerModal from './bookstore/AvatarCustomizerModal';
import BookInspect3D from './bookstore/BookInspect3D';
import BookmarksDrawer from './bookstore/BookmarksDrawer';
import BookstoreHUD from './bookstore/BookstoreHUD';
import BookstorePassportModal from './bookstore/BookstorePassportModal';
import CafeSommelierModal from './bookstore/CafeSommelierModal';
import CosmicTelescopeModal from './bookstore/CosmicTelescopeModal';
import EmoteRadialWheel from './bookstore/EmoteRadialWheel';
import GachaponModal from './bookstore/GachaponModal';
import LofiRadioModal from './bookstore/LofiRadioModal';
import MangaReaderModal from './bookstore/MangaReaderModal';
import MangaSketchpadModal from './bookstore/MangaSketchpadModal';
import PetSelectorModal from './bookstore/PetSelectorModal';
import PhotoModeModal from './bookstore/PhotoModeModal';
import ReadingGoalModal from './bookstore/ReadingGoalModal';
import ShelfExportModal from './bookstore/ShelfExportModal';
import StoreSearchModal from './bookstore/StoreSearchModal';

const BookstoreScene = dynamic(() => import('./bookstore/BookstoreScene'), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-[#0a0808] flex items-center justify-center">
            <div className="text-white/40 text-sm tracking-widest uppercase animate-pulse">
                Entering Nanimo Bookstore...
            </div>
        </div>
    ),
});

export default function LandingPage() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#0a0808]">
            <BookstoreScene />
            <BookstoreHUD />
            <BookInspect3D />
            <AnimeScreeningModal />
            <AvatarCustomizerModal />
            <StoreSearchModal />
            <BookmarksDrawer />
            <GachaponModal />
            <MangaReaderModal />
            <CafeSommelierModal />
            <AnimeQuizModal />
            <PhotoModeModal />
            <EmoteRadialWheel />
            <ShelfExportModal />
            <AnimeSoundboardModal />
            <BookstorePassportModal />
            <AnimeSynthesizerModal />
            <MangaSketchpadModal />
            <PetSelectorModal />
            <LofiRadioModal />
            <ReadingGoalModal />
            <AnimeTriviaArcadeModal />
            <CosmicTelescopeModal />
            <AmbientAudioPlayer />
        </main>
    );
}
