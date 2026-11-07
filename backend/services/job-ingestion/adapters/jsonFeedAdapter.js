const https = require('https');
const http = require('http');

/**
 * Structured JSON Feed Adapter
 * Supports authorized company JSON feeds or third-party aggregations conforming to standard structures
 */
class JsonFeedAdapter {
    /**
     * @param {Object} config
     * @param {string} config.feedUrl - Full URL to JSON feed
     * @param {number} [config.timeoutMs=10000]
     */
    constructor(config = {}) {
        this.feedUrl = config.feedUrl;
        this.timeoutMs = config.timeoutMs || 10000;
    }

    async fetchJobs() {
        if (!this.feedUrl || (!this.feedUrl.startsWith('https://') && !this.feedUrl.startsWith('http://'))) {
            return { success: false, error: 'Invalid or missing feedUrl' };
        }

        const client = this.feedUrl.startsWith('https://') ? https : http;

        return new Promise((resolve) => {
            const req = client.get(this.feedUrl, {
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
                            const rawJobs = Array.isArray(parsed) ? parsed : (parsed.jobs || parsed.items || []);
                            
                            const normalized = rawJobs.map((j, idx) => ({
                                sourceJobId: String(j.id || j.jobId || j.slug || `feed_${idx}`),
                                title: j.title || j.role || 'Untitled Opportunity',
                                absoluteUrl: j.url || j.applyUrl || j.link || '',
                                applyUrl: j.applyUrl || j.url || j.link || '',
                                locationName: j.location || (typeof j.locations === 'object' ? JSON.stringify(j.locations) : ''),
                                departments: Array.isArray(j.departments) ? j.departments : [j.department || j.category].filter(Boolean),
                                contentPlain: j.description || j.summary || '',
                                contentHtml: j.descriptionHtml || '',
                                updatedAt: j.updatedAt || j.date ? new Date(j.updatedAt || j.date) : null,
                                raw: j
                            }));

                            resolve({
                                success: true,
                                statusCode: 200,
                                totalCount: normalized.length,
                                jobs: normalized
                            });
                        } catch (err) {
                            resolve({ success: false, statusCode: 200, error: `Invalid JSON feed content: ${err.message}` });
                        }
                    } else {
                        resolve({ success: false, statusCode: res.statusCode, error: `Feed returned HTTP ${res.statusCode}` });
                    }
                });
            });

            req.on('error', (err) => resolve({ success: false, error: `Feed network error: ${err.message}` }));
            req.setTimeout(this.timeoutMs, () => {
                req.destroy();
                resolve({ success: false, error: `Feed request timed out (${this.timeoutMs}ms)` });
            });
        });
    }
}

module.exports = JsonFeedAdapter;

