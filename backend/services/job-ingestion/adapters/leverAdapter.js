const https = require('https');

/**
 * Lever Postings Public API Adapter
 * 
 * Endpoint: GET https://api.lever.co/v0/postings/{site}?mode=json
 * Documentation: Lever Postings API (Public job postings for companies using Lever)
 */
class LeverAdapter {
    /**
     * @param {Object} config
     * @param {string} config.boardToken - Verified Lever site identifier (e.g., 'kinsta')
     * @param {number} [config.timeoutMs=10000] - Request timeout
     */
    constructor(config = {}) {
        this.boardToken = config.boardToken;
        this.timeoutMs = config.timeoutMs || 10000;
    }

    /**
     * Fetch jobs from public Lever postings API
     * @returns {Promise<{ success: boolean, jobs?: Array, error?: string, statusCode?: number }>}
     */
    async fetchJobs() {
        if (!this.boardToken || typeof this.boardToken !== 'string') {
            return { success: false, error: 'Invalid or missing Lever site boardToken' };
        }

        const url = `https://api.lever.co/v0/postings/${encodeURIComponent(this.boardToken.trim())}?mode=json`;

        return new Promise((resolve) => {
            const req = https.get(url, {
                headers: {
                    'User-Agent': 'CareerCompass-JobIngestion/1.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const parsed = JSON.parse(body);
                            const rawListings = Array.isArray(parsed) ? parsed : [];

                            const normalized = rawListings.map(item => ({
                                sourceJobId: String(item.id),
                                title: item.text || 'Untitled Opportunity',
                                absoluteUrl: item.hostedUrl || item.applyUrl || '',
                                applyUrl: item.applyUrl || item.hostedUrl || '',
                                locationName: item.categories ? (item.categories.location || '') : '',
                                offices: item.categories && Array.isArray(item.categories.allLocations) ? item.categories.allLocations : [],
                                departments: [
                                    item.categories?.department,
                                    item.categories?.team
                                ].filter(Boolean),
                                commitment: item.categories?.commitment || '',
                                contentPlain: item.descriptionPlain || '',
                                contentHtml: item.description || '',
                                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                                raw: {
                                    leverId: item.id,
                                    categories: item.categories,
                                    workplaceType: item.workplaceType
                                }
                            }));

                            resolve({
                                success: true,
                                statusCode: 200,
                                totalCount: normalized.length,
                                jobs: normalized
                            });
                        } catch (err) {
                            resolve({
                                success: false,
                                statusCode: 200,
                                error: `Failed to parse Lever JSON response: ${err.message}`
                            });
                        }
                    } else if (res.statusCode === 404) {
                        resolve({
                            success: false,
                            statusCode: 404,
                            error: `Lever site '${this.boardToken}' not found (404). Check boardToken identifier.`
                        });
                    } else if (res.statusCode === 429) {
                        resolve({
                            success: false,
                            statusCode: 429,
                            error: 'Lever rate limit reached (HTTP 429).'
                        });
                    } else {
                        resolve({
                            success: false,
                            statusCode: res.statusCode,
                            error: `Lever returned unexpected HTTP ${res.statusCode}: ${body.slice(0, 200)}`
                        });
                    }
                });
            });

            req.on('error', (err) => {
                resolve({
                    success: false,
                    error: `Network error connecting to Lever API: ${err.message}`
                });
            });

            req.setTimeout(this.timeoutMs, () => {
                req.destroy();
                resolve({
                    success: false,
                    error: `Timeout (${this.timeoutMs}ms) reached while querying Lever API`
                });
            });
        });
    }
}

module.exports = LeverAdapter;

