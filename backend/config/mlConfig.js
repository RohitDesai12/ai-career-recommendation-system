/**
 * Career Compass - ML Service Configuration
 *
 * Centralizes retrieval and normalization of the ML Service URL.
 * Ensures consistent behavior across local development and Render production environments.
 */

function getMlServiceUrl() {
    let rawUrl = process.env.ML_SERVICE_URL;
    if (!rawUrl || rawUrl.trim() === '') {
        rawUrl = process.env.NODE_ENV === 'production'
            ? 'https://career-compass-ml-q4f2.onrender.com'
            : 'http://127.0.0.1:8000';
    } else if (process.env.NODE_ENV === 'production' && (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1'))) {
        rawUrl = 'https://career-compass-ml-q4f2.onrender.com';
    }

    let url = rawUrl.trim().replace(/\/+$/, '');
    if (url.includes('localhost')) {
        url = url.replace('localhost', '127.0.0.1');
    }
    return url;
}

module.exports = {
    getMlServiceUrl
};
