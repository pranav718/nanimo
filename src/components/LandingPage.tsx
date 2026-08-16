'use client';

import dynamic from 'next/dynamic';
import BookstoreHUD from './bookstore/BookstoreHUD';

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
        </main>
    );
}
