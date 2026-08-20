'use client';

import dynamic from 'next/dynamic';
import AmbientAudioPlayer from './bookstore/AmbientAudioPlayer';
import AnimeScreeningModal from './bookstore/AnimeScreeningModal';
import AvatarCustomizerModal from './bookstore/AvatarCustomizerModal';
import BookInspect3D from './bookstore/BookInspect3D';
import BookmarksDrawer from './bookstore/BookmarksDrawer';
import BookstoreHUD from './bookstore/BookstoreHUD';
import GachaponModal from './bookstore/GachaponModal';
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
            <AmbientAudioPlayer />
        </main>
    );
}
