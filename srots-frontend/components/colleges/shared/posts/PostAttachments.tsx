
import React from 'react';
import { FileText } from 'lucide-react';

/**
 * Component Name: PostAttachments
 * Directory: components/colleges/shared/posts/PostAttachments.tsx
 * 
 * Functionality:
 * - Renders the Image Grid (1, 2, 3, 4+ layout logic).
 * - Renders the list of attached documents (PDFs, etc.).
 * - Triggers the Image Viewer lightbox when an image is clicked.
 * 
 * Used In: PostCard
 */

interface PostAttachmentsProps {
    images?: string[];
    documents?: { name: string; url: string }[];
    onImageClick: (index: number) => void;
}

export const PostAttachments: React.FC<PostAttachmentsProps> = ({ images = [], documents = [], onImageClick }) => {
    
    const renderImageGrid = () => {
        const count = images.length;
        if (count === 0) return null;

        // Single Image
        if (count === 1) {
            return (
                <div 
                  className="mb-4 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => onImageClick(0)}
                >
                    <img src={images[0]} alt="Post Attachment" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                </div>
            );
        }

        // 2, 3, 4, or 5+ Images Grid
        let gridClass = '';
        let imageMap: { src: string, idx: number, span?: string, height: string, overlay?: number }[] = [];

        if (count === 2) {
            gridClass = 'grid-cols-2';
            imageMap = [
                { src: images[0], idx: 0, height: 'h-64' },
                { src: images[1], idx: 1, height: 'h-64' }
            ];
        } else if (count === 3) {
            gridClass = 'grid-cols-2';
            imageMap = [
                { src: images[0], idx: 0, span: 'col-span-2', height: 'h-64' },
                { src: images[1], idx: 1, height: 'h-40' },
                { src: images[2], idx: 2, height: 'h-40' }
            ];
        } else if (count >= 4) {
            gridClass = 'grid-cols-2';
            imageMap = [
                { src: images[0], idx: 0, height: 'h-40' },
                { src: images[1], idx: 1, height: 'h-40' },
                { src: images[2], idx: 2, height: 'h-40' },
                { src: images[3], idx: 3, height: 'h-40', overlay: count > 4 ? count - 4 : undefined }
            ];
        }

        return (
            <div className={`grid ${gridClass} gap-0.5 mb-4 rounded-xl overflow-hidden border border-gray-200`}>
                {imageMap.map((item) => (
                    <div 
                      key={item.idx} 
                      className={`relative overflow-hidden bg-gray-100 cursor-pointer group ${item.span || ''} ${item.height}`} 
                      onClick={() => onImageClick(item.idx)}
                    >
                        <img src={item.src} alt={`Attachment ${item.idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                        {/* +N Overlay for the last cell if applicable */}
                        {item.overlay && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold backdrop-blur-[1px] transition-colors hover:bg-black/70">
                                +{item.overlay}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {renderImageGrid()}
            
            {documents && documents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded text-xs text-blue-600 font-bold hover:bg-blue-50">
                            <FileText size={14}/> {doc.name}
                        </a>
                    ))}
                </div>
            )}
        </>
    );
};
