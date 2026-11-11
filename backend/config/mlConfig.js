/**
 * Career Compass - ML Service Configuration
 *
 * Centralizes retrieval and normalization of the ML Service URL.
 * Ensures consistent behavior across local development and Render production environments.
 */

function getMlServiceUrl() {
    const rawUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let url = rawUrl.trim().replace(/\/+$/, '');
    if (url.includes('localhost')) {
        url = url.replace('localhost', '127.0.0.1');
    }
    return url;
}

module.exports = {
    getMlServiceUrl
};
