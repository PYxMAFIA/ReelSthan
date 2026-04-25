import mongoose from 'mongoose';
import { getEnv } from '../config/env.js';

mongoose.set('bufferCommands', false);

const CONNECTION_STATES = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

let isEventsBound = false;
let pendingConnection = null;

function bindConnectionEvents() {
    if (isEventsBound) {
        return;
    }

    isEventsBound = true;

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
    });

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });
}

export function getDbReadyState() {
    return mongoose.connection.readyState;
}

export function getDbStateLabel() {
    return CONNECTION_STATES[getDbReadyState()] || 'unknown';
}

export function isDbConnected() {
    return getDbReadyState() === 1;
}

async function connectDB() {
    bindConnectionEvents();

    if (isDbConnected()) {
        return mongoose.connection;
    }

    if (pendingConnection) {
        return pendingConnection;
    }

    const mongoUrl = getEnv('MONGODB_URL', { required: true });

    pendingConnection = mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
    })
        .then((connection) => {
            console.log("MongoDB connected successfully");
            return connection;
        })
        .finally(() => {
            pendingConnection = null;
        });

    return pendingConnection;
}

export default connectDB;
