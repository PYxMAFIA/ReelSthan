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
                // If it fails (likely 500 or network error if server is sleeping/down), retry
                // For now, we just dismiss the loading toast if it's a specific error we expect
                // or keep showing it if we want to simulate "waiting".
                // Let's assume onRender cold start will just timeout or return 503 until ready.

                // If it's a 401 (Unauthorized) or 404 (User not found but server reachable), 
                // it means server IS running. That's a success for "server is up".
                if (error.response && [401, 403, 404].includes(error.response.status)) {
                    toast.dismiss(toastId);
                    if (error.response.status !== 401) {
                        toast.success('Server is ready!', { id: 'backend-ready' });
                    }
                    setIsWarmingUp(false);
                    return;
                }

                console.log('Backend not ready yet...', error);
                // Simple retry logic could go here, but for now let's just leave the loading state
                // or dismiss it to not annoy the user if it takes too long.
                // Let's retry once after 3 seconds.
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
