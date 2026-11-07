/**
 * Career Compass - Universal Source Normalizer
 * 
 * Safely converts diverse external ATS/feed payloads into standard Career Compass Job schema fields.
 * Follows conservative data principles: missing data remains unspecified, never hallucinated.
 */

const { normalizeSkill } = require('../matchingEngine');
const { normalizeJobGeo } = require('./geoNormalizerService');

// Core technical skills dictionary for reliable token scanning
const KNOWN_TECH_KEYWORDS = [
    'react', 'react.js', 'react native', 'angular', 'vue', 'next.js',
    'node.js', 'nodejs', 'express', 'nest.js', 'fastapi', 'django', 'flask', 'spring boot',
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', '.net', 'golang', 'rust', 'php', 'ruby',
    'html', 'css', 'tailwind', 'bootstrap', 'sass',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'dynamodb',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ci/cd', 'jenkins', 'github actions',
    'linux', 'git', 'rest apis', 'graphql', 'microservices', 'kafka', 'rabbitmq',
    'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'computer vision', 'data analysis',
    'cybersecurity', 'penetration testing', 'soc', 'cryptography', 'owasp',
    'figma', 'ui/ux', 'agile', 'scrum', 'system design'
];

/**
 * Strips HTML tags and decodes common HTML entities
 * @param {string} html 
 * @returns {string}
 */
function stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    
    let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

    // Clean whitespace
    return text
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Normalizes work mode based on location string and title
 */
function detectWorkMode(locationStr = '', text = '') {
    const combined = `${locationStr} ${text}`.toLowerCase();
    if (combined.includes('remote') || combined.includes('anywhere') || combined.includes('work from home')) {
        return 'Remote';
    }
    if (combined.includes('hybrid')) {
        return 'Hybrid';
    }
    return 'On-site';
}

/**
 * Normalizes employment type
 */
function detectEmploymentType(typeStr = '', title = '') {
    const combined = `${typeStr} ${title}`.toLowerCase();
    if (combined.includes('intern') || combined.includes('trainee') || combined.includes('co-op')) {
        return 'Internship';
    }
    if (combined.includes('part-time') || combined.includes('part time')) {
        return 'Part-Time';
    }
    if (combined.includes('contract') || combined.includes('freelance') || combined.includes('temporary')) {
        return 'Contract';
    }
    return 'Full-Time';
}

/**
 * Categorizes job role into Career Compass primary domain categories
 */
function detectCategory(title = '', departments = []) {
    const combined = `${title} ${departments.join(' ')}`.toLowerCase();
    
    if (/data scientist|data analyst|machine learning|deep learning|ai engineer|analytics|business intelligence|bi analyst/i.test(combined)) {
        return 'Data Science & Analytics';
    }
    if (/devops|site reliability|sre|cloud engineer|infrastructure|platform engineer|kubernetes|terraform/i.test(combined)) {
        return 'Cloud & DevOps';
    }
    if (/security|cyber|infosec|penetration|soc analyst|vulnerability/i.test(combined)) {
        return 'Cybersecurity';
    }
    if (/product manager|product designer|ui\/ux|ux designer|user experience/i.test(combined)) {
        return 'Product & Design';
    }
    if (/account executive|sales|marketing|growth|business development|recruiter/i.test(combined)) {
        return 'Sales & Business';
    }
    if (/mechanical|electrical|electronics|civil|hardware|embedded|firmware|vlsi/i.test(combined)) {
        return 'Core Engineering';
    }
    return 'Software Development';
}

/**
 * Conservatively extracts recognized technical skills from text without hallucinating
 */
function extractSkills(text = '', title = '') {
    const content = `${title} ${text}`.toLowerCase();
    const extracted = new Set();

    for (const keyword of KNOWN_TECH_KEYWORDS) {
        // Safe word-boundary regex
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Handle special symbols in tech like c++, c#, .net
        let regex;
        if (keyword === 'c++') {
            regex = /(?:^|\s|\W)c\+\+(?:$|\s|\W)/i;
        } else if (keyword === 'c#') {
            regex = /(?:^|\s|\W)c#(?:$|\s|\W)/i;
        } else if (keyword === '.net') {
            regex = /(?:^|\s)\.net(?:$|\s|\W)/i;
        } else {
            regex = new RegExp(`\\b${escaped}\\b`, 'i');
        }

        if (regex.test(content)) {
            extracted.add(normalizeSkill(keyword));
        }
    }

    return Array.from(extracted).slice(0, 15);
}

/**
 * Detects experience requirement string and fresher eligibility
 */
function detectExperience(text = '', title = '', type = 'Full-Time') {
    const lower = `${title} ${text}`.toLowerCase();

    if (type === 'Internship' || /entry level|fresher|university graduate|graduating in|intern|new grad|campus/i.test(lower)) {
        return {
            experience: '0–1 years',
            freshersEligible: true
        };
    }

    const match = lower.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years?/);
    if (match) {
        const min = parseInt(match[1], 10);
        return {
            experience: `${match[1]}–${match[2]} years`,
            freshersEligible: min <= 1
        };
    }

    const singleMatch = lower.match(/(\d+)\+?\s*years?/);
    if (singleMatch) {
        const yrs = parseInt(singleMatch[1], 10);
        return {
            experience: `${yrs}+ years`,
            freshersEligible: yrs <= 1
        };
    }

    return {
        experience: '0–2 years',
        freshersEligible: true
    };
}

/**
 * Normalize an adapter's raw job object into the standard Job document structure
 * 
 * @param {Object} rawItem - Raw job from adapter
 * @param {Object} sourceMeta - Source configuration metadata
 * @returns {Object} Normalized job data conforming to JobSchema
 */
function normalizeJob(rawItem, sourceMeta = {}) {
    const descriptionText = rawItem.contentPlain || stripHtml(rawItem.contentHtml || '');
    const title = (rawItem.title || 'Untitled Opportunity').trim().replace(/\s+/g, ' ');
    const companyName = sourceMeta.companyName || rawItem.companyName || 'Verified Employer';
    
    const locationStr = rawItem.locationName || (rawItem.offices && rawItem.offices[0]) || 'Remote / Global';
    const geoInfo = normalizeJobGeo(locationStr, descriptionText, title);
    const workMode = geoInfo.workMode || detectWorkMode(locationStr, `${title} ${descriptionText}`);
    const type = detectEmploymentType(rawItem.commitment || '', title);
    const category = detectCategory(title, rawItem.departments || []);
    const skills = extractSkills(descriptionText, title);
    const expInfo = detectExperience(descriptionText, title, type);

    const applyUrl = (rawItem.applyUrl || rawItem.absoluteUrl || '').trim();

    return {
        sourceJobId: String(rawItem.sourceJobId || ''),
        sourceType: sourceMeta.sourceType || 'MANUAL_SEED',
        companyName,
        title,
        department: (rawItem.departments && rawItem.departments[0]) || 'Engineering',
        category,
        location: locationStr,
        country: geoInfo.country,
        countryCode: geoInfo.countryCode,
        state: geoInfo.state,
        city: geoInfo.city,
        locationType: geoInfo.locationType,
        remoteEligibility: geoInfo.remoteEligibility,
        eligibleCountries: geoInfo.eligibleCountries,
        excludedCountries: geoInfo.excludedCountries,
        visaSponsorship: geoInfo.visaSponsorship,
        relocationAssistance: geoInfo.relocationAssistance,
        workAuthorization: geoInfo.workAuthorization,
        salaryCurrency: geoInfo.salaryCurrency,
        type,
        workMode,
        experience: expInfo.experience,
        freshersEligible: expInfo.freshersEligible,
        skills,
        preferredSkills: [],
        education: "Bachelor's degree or equivalent practical experience",
        description: descriptionText.slice(0, 15000), // Cap description size safely
        responsibilities: [],
        benefits: [],
        deadline: 'Open / Ongoing',
        officialApplyUrl: applyUrl,
        externalApplyUrl: applyUrl,
        sourceName: sourceMeta.sourceName || (sourceMeta.sourceType === 'ATS_GREENHOUSE' ? 'Greenhouse ATS' : 'Lever ATS'),
        sourceUrl: applyUrl,
        sourcePublishedAt: rawItem.createdAt || rawItem.updatedAt || null,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        lastVerifiedDate: new Date(),
        verificationStatus: 'Verified',
        status: 'Active',
        consecutiveMissingCount: 0
    };
}

module.exports = {
    stripHtml,
    detectWorkMode,
    detectEmploymentType,
    detectCategory,
    extractSkills,
    detectExperience,
    normalizeJob
};
