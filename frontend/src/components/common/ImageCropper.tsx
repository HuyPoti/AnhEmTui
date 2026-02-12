
'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const { t, language } = useLanguageStore();

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImage) {
                    onCropComplete(croppedImage);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg h-[400px] bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropCompleteHandler}
                    classes={{
                        containerClassName: "bg-slate-900",
                        mediaClassName: "",
                        cropAreaClassName: "border-2 border-cyan-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                    }}
                />
            </div>

            <div className="w-full max-w-lg mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                <div className="flex items-center gap-4">
                    <ZoomOut className="w-5 h-5 text-slate-400" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <ZoomIn className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                        <Check className="w-5 h-5" />
                        {language === 'vi' ? 'Lưu Ảnh' : 'Save Photo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
