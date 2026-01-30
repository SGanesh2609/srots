
import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Component Name: PostImageViewer
 * Directory: components/colleges/shared/posts/PostImageViewer.tsx
 * 
 * Functionality:
 * - Fullscreen overlay to view post images.
 * - Supports keyboard navigation (Left/Right/Esc).
 * - Shows thumbnails strip at the bottom.
 * 
 * Used In: PostCard
 */

interface PostImageViewerProps {
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: (e: React.MouseEvent) => void;
    onPrev: (e: React.MouseEvent) => void;
    onSelectIndex: (index: number) => void;
}

export const PostImageViewer: React.FC<PostImageViewerProps> = ({ 
    isOpen, images, currentIndex, onClose, onNext, onPrev, onSelectIndex 
}) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev(e as any);
            if (e.key === 'ArrowRight') onNext(e as any);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onNext, onPrev, onClose]);

    if (!isOpen || images.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Controls */}
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50"
            >
                <X size={24} />
            </button>

            {/* Main Image Area */}
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
                {images.length > 1 && (
                    <button 
                        onClick={onPrev}
                        className="absolute left-2 md:left-8 p-3 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-sm transition-all z-50 group"
                    >
                        <ChevronLeft size={32} className="group-active:scale-90 transition-transform" />
                    </button>
                )}
                
                <img 
                    src={images[currentIndex]} 
                    alt={`View ${currentIndex + 1}`} 
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-200"
                />

                {images.length > 1 && (
                    <button 
                        onClick={onNext}
                        className="absolute right-2 md:right-8 p-3 rounded-full bg-black/50 text-white hover:bg-white/20 backdrop-blur-sm transition-all z-50 group"
                    >
                        <ChevronRight size={32} className="group-active:scale-90 transition-transform" />
                    </button>
                )}
            </div>
            
            {/* Thumbnails Strip */}
            {images.length > 1 && (
                <div 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[90vw] p-3 bg-black/60 rounded-2xl backdrop-blur-md border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => onSelectIndex(idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${currentIndex === idx ? 'border-blue-500 scale-110 opacity-100 ring-2 ring-blue-500/50' : 'border-transparent opacity-50 hover:opacity-80'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
