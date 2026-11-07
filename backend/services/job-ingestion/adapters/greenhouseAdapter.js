const https = require('https');

/**
 * Greenhouse Job Board Public API Adapter
 * 
 * Endpoint: GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
 * Documentation: Greenhouse Job Board API (Public access, no API key required for public job boards)
 */
class GreenhouseAdapter {
    /**
     * @param {Object} config
     * @param {string} config.boardToken - Verified Greenhouse board identifier (e.g., 'cloudflare', 'figma')
     * @param {number} [config.timeoutMs=10000] - Request timeout
     */
    constructor(config = {}) {
        this.boardToken = config.boardToken;
        this.timeoutMs = config.timeoutMs || 10000;
    }

    /**
     * Fetch jobs from public Greenhouse board API
     * @returns {Promise<{ success: boolean, jobs?: Array, error?: string, statusCode?: number }>}
     */
    async fetchJobs() {
        if (!this.boardToken || typeof this.boardToken !== 'string') {
            return { success: false, error: 'Invalid or missing Greenhouse boardToken' };
        }

        const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(this.boardToken.trim())}/jobs?content=true`;

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
                            const rawJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
                            
                            const normalized = rawJobs.map(j => ({
                                sourceJobId: String(j.id),
                                title: j.title || 'Untitled Opportunity',
                                absoluteUrl: j.absolute_url || '',
                                locationName: j.location ? (j.location.name || '') : '',
                                offices: Array.isArray(j.offices) ? j.offices.map(o => o.name || o.location).filter(Boolean) : [],
                                departments: Array.isArray(j.departments) ? j.departments.map(d => d.name).filter(Boolean) : [],
                                contentHtml: j.content || '',
                                updatedAt: j.updated_at ? new Date(j.updated_at) : null,
                                raw: {
                                    internalJobId: j.internal_job_id,
                                    requisitionId: j.requisition_id,
                                    updatedAt: j.updated_at
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
                                error: `Failed to parse Greenhouse JSON response: ${err.message}`
                            });
                        }
                    } else if (res.statusCode === 404) {
                        resolve({
                            success: false,
                            statusCode: 404,
                            error: `Greenhouse board '${this.boardToken}' not found (404). Check boardToken identifier.`
                        });
                    } else if (res.statusCode === 429) {
                        resolve({
                            success: false,
                            statusCode: 429,
                            error: 'Greenhouse rate limit reached (HTTP 429). Retrying after backoff recommended.'
                        });
                    } else {
                        resolve({
                            success: false,
                            statusCode: res.statusCode,
                            error: `Greenhouse returned unexpected HTTP ${res.statusCode}: ${body.slice(0, 200)}`
                        });
                    }
                });
            });

            req.on('error', (err) => {
                resolve({
                    success: false,
                    error: `Network error connecting to Greenhouse API: ${err.message}`
                });
            });

            req.setTimeout(this.timeoutMs, () => {
                req.destroy();
                resolve({
                    success: false,
                    error: `Timeout (${this.timeoutMs}ms) reached while querying Greenhouse API`
                });
            });
        });
    }
}

module.exports = GreenhouseAdapter;

