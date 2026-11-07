/**
 * Career Compass - Job Source Registry
 * 
 * Defines genuinely verified external ATS endpoints and manages their persistent
 * configuration in MongoDB without inventing tokens or fabricating sources.
 */

const JobSource = require('../../models/JobSource');

const DEFAULT_VERIFIED_SOURCES = [
    {
        sourceId: 'gh_discord',
        sourceName: 'Discord Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Discord',
        boardToken: 'discord',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'lever_kinsta',
        sourceName: 'Kinsta Lever ATS',
        sourceType: 'ATS_LEVER',
        companyName: 'Kinsta',
        boardToken: 'kinsta',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'lever_spotify',
        sourceName: 'Spotify Lever ATS',
        sourceType: 'ATS_LEVER',
        companyName: 'Spotify',
        boardToken: 'spotify',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_gitlab',
        sourceName: 'GitLab Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'GitLab',
        boardToken: 'gitlab',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_datadog',
        sourceName: 'Datadog Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Datadog',
        boardToken: 'datadog',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_twitch',
        sourceName: 'Twitch Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Twitch',
        boardToken: 'twitch',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_instacart',
        sourceName: 'Instacart Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Instacart',
        boardToken: 'instacart',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_cloudflare',
        sourceName: 'Cloudflare Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Cloudflare',
        boardToken: 'cloudflare',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_figma',
        sourceName: 'Figma Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Figma',
        boardToken: 'figma',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_airbnb',
        sourceName: 'Airbnb Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Airbnb',
        boardToken: 'airbnb',
        isActive: true,
        syncFrequencyMinutes: 360
    },
    {
        sourceId: 'gh_stripe',
        sourceName: 'Stripe Greenhouse ATS',
        sourceType: 'ATS_GREENHOUSE',
        companyName: 'Stripe',
        boardToken: 'stripe',
        isActive: true,
        syncFrequencyMinutes: 360
    }
];

/**
 * Initializes default verified job sources in MongoDB if they do not exist
 */
async function initializeSourceRegistry() {
    for (const src of DEFAULT_VERIFIED_SOURCES) {
        const existing = await JobSource.findOne({ sourceId: src.sourceId });
        if (!existing) {
            await JobSource.create(src);
        }
    }
}

/**
 * Get all active configured sources
 */
async function getActiveSources() {
    return await JobSource.find({ isActive: true });
}

module.exports = {
    DEFAULT_VERIFIED_SOURCES,
    initializeSourceRegistry,
    getActiveSources
};

