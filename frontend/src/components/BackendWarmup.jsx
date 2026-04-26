import React, { useEffect } from 'react';
import api from '../lib/api';

const BackendWarmup = () => {
    useEffect(() => {
        // Warmup ping without showing a recurring loader/toast
        api.get('/health', { skipGlobalError: true }).catch(() => {});
    }, []);

    return null;
};

export default BackendWarmup;
