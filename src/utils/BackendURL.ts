let backendUrl: string;

if (process.env.NODE_ENV === 'dev') {
    backendUrl = 'http://localhost:5173';
} else {
    backendUrl = 'https://project-manager-app-6rbg.onrender.com';
}

export const URL = backendUrl;