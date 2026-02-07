import { useState, useRef, useEffect } from 'react';

export function useGestures() {
    const [isActive, setIsActive] = useState(false);
    const [lastGesture, setLastGesture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsActive(true);
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Không thể truy cập webcam để nhận diện cử chỉ.");
        }
    };

    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsActive(false);
        }
    };

    const captureFrameAndDetect = async () => {
        if (!videoRef.current || !canvasRef.current || !isActive) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64 = canvas.toDataURL('image/jpeg', 0.5);

            // Logic call HF API would go here
            // For now, mock the detection
            setLoading(true);
            try {
                // Mock result after 500ms
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockGestures = ['palm', 'fist', 'pinch', 'ok'];
                const randomGesture = mockGestures[Math.floor(Math.random() * mockGestures.length)];
                setLastGesture(randomGesture);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(captureFrameAndDetect, 2000); // Detect every 2s to stay in free tier
        }
        return () => clearInterval(interval);
    }, [isActive]);

    return {
        isActive,
        lastGesture,
        loading,
        videoRef,
        canvasRef,
        startWebcam,
        stopWebcam,
        setIsActive
    };
}
