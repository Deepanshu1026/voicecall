import { useEffect, useCallback } from 'react';
import { HiXMark, HiArrowDownTray } from 'react-icons/hi2';
import { downloadFile } from '../../utils/helpers';

const ImageLightbox = ({ src, alt, isOpen, onClose }) => {
  const handleDownload = useCallback(() => {
    if (!src) return;
    downloadFile(src, alt || 'image');
  }, [src, alt]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-end p-4 gap-2 z-[101]">
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2.5 rounded-full text-white/90 hover:bg-white/20 transition-colors"
          title="Download"
        >
          <HiArrowDownTray className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2.5 rounded-full text-white/90 hover:bg-white/20 transition-colors"
          title="Close"
        >
          <HiXMark className="w-7 h-7" />
        </button>
      </div>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageLightbox;
