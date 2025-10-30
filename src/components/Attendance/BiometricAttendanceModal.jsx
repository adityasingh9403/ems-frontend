import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader, AlertTriangle } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';
import { apiMarkAttendance } from '../../apiService';

const BiometricAttendanceModal = ({ isOpen, onClose, onAttendanceMarked, currentUser, todayRecord }) => {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        if (!isOpen) return;

        // Reset state on open
        setStatus('Initializing...');
        setError('');
        setIsProcessing(false);
        
        if (!currentUser || !currentUser.faceDescriptor) {
            setError('Face not registered. Please go to "My Profile" to register your face first.');
            setStatus('Error');
            return;
        }

        const setupFaceAPI = async () => {
             try {
                setStatus('Loading recognition models...');
                // Ensure faceapi is available on the window object
                if (!window.faceapi) {
                    setError('Face detection library not loaded.');
                    setStatus('Error');
                    return;
                }

                await Promise.all([
                    window.faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);
                
                setStatus('Requesting camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus('Ready to scan');
                }
             } catch (err) {
                 setError('Could not load models or access camera. Please check permissions and refresh.');
                 setStatus('Error');
             }
        };

        setupFaceAPI();

        // Cleanup function to stop the camera stream when the modal is closed
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, currentUser]);

    const handleScanAndMark = async () => {
        setIsProcessing(true);
        setError('');
        setStatus('Scanning for face...');
        
        let locationString = null;
        try {
            const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
            locationString = `${position.coords.latitude},${position.coords.longitude}`;
        } catch (locError) {
            setError('Could not get location. Please enable location services.');
            setIsProcessing(false);
            setStatus('Ready to scan');
            return;
        }

        if (videoRef.current) {
            const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
            
            if (detection) {
                setStatus('Face detected, verifying...');
                try {
                    const descriptorFromDb = JSON.parse(currentUser.faceDescriptor);
                    const registeredDescriptor = new Float32Array(Object.values(descriptorFromDb));
                    
                    const faceMatcher = new faceapi.FaceMatcher([registeredDescriptor]);
                    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

                    if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.5) {
                        setStatus('Face Matched! Marking attendance...');
                        const payload = todayRecord ? { clockOutLocation: locationString } : { clockInLocation: locationString };
                        
                        await apiMarkAttendance(payload);
                        
                        showToast(`Attendance marked successfully!`, 'success');
                        onAttendanceMarked(); 
                        setTimeout(onClose, 1500);
                    } else {
                        setError('Face not matched. Please try again.');
                        setStatus('Ready to scan');
                        setIsProcessing(false);
                    }
                } catch (e) {
                    setError('Error verifying face. Your face data might be corrupted. Please try registering your face again.');
                    setStatus('Error');
                    setIsProcessing(false);
                }
            } else {
                setError('No face detected. Please position yourself clearly.');
                setStatus('Ready to scan');
                setIsProcessing(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Smart Attendance</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 text-center space-y-4">
                    <div className="relative w-64 h-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]"></video>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 h-5">{status}</p>
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-left text-sm flex items-start space-x-2">
                           <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                           <span>{error}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleScanAndMark} 
                        disabled={isProcessing || status !== 'Ready to scan' || !!error}
                        className="w-full bg-teal-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader className="animate-spin" /> : <Camera />}
                        <span>{isProcessing ? status : (todayRecord ? 'Verify Face & Clock Out' : 'Verify Face & Clock In')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BiometricAttendanceModal;