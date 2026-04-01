import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const BackendWarmup = () => {
    const [isWarmingUp, setIsWarmingUp] = useState(true);

    useEffect(() => {
        const checkBackend = async () => {
            const toastId = toast.loading('Waking up the server... Please wait.', {
                id: 'backend-warmup', // Force a specific ID to avoid duplicates
            });

            try {
                // Ping a lightweight route to check if backend is ready
                await api.get('/auth/check-auth');
                toast.dismiss(toastId);
                toast.success('Server is ready!', { id: 'backend-ready' });
                setIsWarmingUp(false);
            } catch (error) {
                // If it's a 401 (Unauthorized) or 404 (User not found), server IS running
                if (error.response && [401, 404].includes(error.response.status)) {
                    toast.dismiss(toastId);
                    toast.success('Server is ready!', { id: 'backend-ready' });
                    setIsWarmingUp(false);
                    return;
                }

                // Network error or server down - retry
                console.log('Backend not ready yet...', error.message);
                setTimeout(() => {
                    checkBackend();
                }, 3000);
            }
        };

        checkBackend();
    }, []);

    return null; // This component doesn't render anything visible, just handles the toast
};

export default BackendWarmup;
