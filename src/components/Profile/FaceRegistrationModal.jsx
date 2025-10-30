// /src/components/Profile/FaceRegistrationModal.js

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader } from 'lucide-react';

const FaceRegistrationModal = ({ isOpen, onClose, onFaceRegistered }) => {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const setupWebcam = async () => {
            try {
                setStatus('Loading models...');
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);

                setStatus('Requesting camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus('Ready to capture');
                }
            } catch (err) {
                setError('Could not access camera or load models. Please check permissions.');
                setStatus('Error');
            }
        };

        setupWebcam();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleCapture = async () => {
        setIsProcessing(true);
        setError('');
        setStatus('Detecting face...');

        if (videoRef.current) {
            const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
            
            if (detection) {
                setStatus('Face captured successfully! Saving...');
                onFaceRegistered(detection.descriptor);
            } else {
                setError('No face detected. Please position your face in the center.');
                setStatus('Ready to capture');
                setIsProcessing(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Register Your Face</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 text-center space-y-4">
                    <p className="text-sm text-slate-500">Position your face in the center of the frame and click capture.</p>
                    <div className="relative w-64 h-48 mx-auto bg-gray-200 rounded-lg overflow-hidden">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]"></video>
                    </div>
                    <p className="text-sm h-5">{status}</p>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button 
                        onClick={handleCapture} 
                        disabled={isProcessing || status !== 'Ready to capture'}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader className="animate-spin" /> : <Camera />}
                        <span>{isProcessing ? status : 'Capture & Save Face'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FaceRegistrationModal;