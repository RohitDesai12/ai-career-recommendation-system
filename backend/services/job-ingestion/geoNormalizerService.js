/**
 * Career Compass - Geo Normalizer & Application Eligibility Intelligence Service
 * 
 * Provides deterministic parsing, categorization, and eligibility assessment for:
 * 1. Domestic Indian Opportunities (cities, states, domestic remote)
 * 2. International Opportunities (USA, UK, Canada, Germany, Australia, Singapore, etc.)
 * 3. Remote Worldwide Opportunities (Worldwide, India Eligible, Country-Specific, Unclear)
 * 4. Application Eligibility Assessment (GREEN, YELLOW, RED) based on academic qualifications,
 *    graduation year, experience, country, visa sponsorship, and work authorization.
 */

// Major Indian tech hubs and cities
const INDIAN_CITIES = [
    { name: 'Bengaluru', aliases: ['bengaluru', 'bangalore'] },
    { name: 'Hyderabad', aliases: ['hyderabad', 'secunderabad'] },
    { name: 'Pune', aliases: ['pune', 'pcmc'] },
    { name: 'Mumbai', aliases: ['mumbai', 'bombay', 'navi mumbai', 'thane'] },
    { name: 'Delhi / NCR', aliases: ['delhi', 'new delhi', 'noida', 'greater noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'ncr'] },
    { name: 'Chennai', aliases: ['chennai', 'madras'] },
    { name: 'Kolkata', aliases: ['kolkata', 'calcutta'] },
    { name: 'Ahmedabad', aliases: ['ahmedabad', 'gandhinagar'] },
    { name: 'Jaipur', aliases: ['jaipur'] },
    { name: 'Kochi', aliases: ['kochi', 'cochin'] },
    { name: 'Thiruvananthapuram', aliases: ['thiruvananthapuram', 'trivandrum'] },
    { name: 'Indore', aliases: ['indore'] },
    { name: 'Chandigarh', aliases: ['chandigarh', 'mohali', 'panchkula'] },
    { name: 'Coimbatore', aliases: ['coimbatore'] },
    { name: 'Bhubaneswar', aliases: ['bhubaneswar'] },
    { name: 'Surat', aliases: ['surat'] },
    { name: 'Lucknow', aliases: ['lucknow'] },
    { name: 'Vadodara', aliases: ['vadodara', 'baroda'] },
    { name: 'Visakhapatnam', aliases: ['visakhapatnam', 'vizag'] },
    { name: 'Nagpur', aliases: ['nagpur'] }
];

const INDIAN_STATES = [
    'karnataka', 'telangana', 'maharashtra', 'tamil nadu', 'delhi', 'uttar pradesh',
    'haryana', 'west bengal', 'gujarat', 'rajasthan', 'kerala', 'madhya pradesh',
    'punjab', 'andhra pradesh', 'odisha'
];

// Major International Countries and Tech Hubs
const INTERNATIONAL_COUNTRIES = [
    {
        country: 'United States',
        code: 'US',
        currency: 'USD',
        aliases: ['united states', 'usa', 'u.s.a.', 'u.s.', 'us'],
        cities: [
            'san francisco', 'new york', 'seattle', 'austin', 'boston', 'los angeles',
            'chicago', 'atlanta', 'denver', 'san jose', 'sunnyvale', 'mountain view',
            'palo alto', 'san diego', 'dallas', 'houston', 'portland', 'redmond',
            'menlo park', 'cupertino', 'cambridge', 'santa clara', 'raleigh', 'salt lake city'
        ],
        stateCodes: ['ca', 'ny', 'wa', 'tx', 'ma', 'il', 'ga', 'co', 'fl', 'dc', 'va', 'nc', 'nj', 'pa', 'oh', 'mi', 'az', 'ut', 'or']
    },
    {
        country: 'United Kingdom',
        code: 'GB',
        currency: 'GBP',
        aliases: ['united kingdom', 'uk', 'u.k.', 'great britain', 'england', 'scotland', 'wales', 'northern ireland'],
        cities: ['london', 'manchester', 'edinburgh', 'cambridge', 'oxford', 'bristol', 'birmingham', 'leeds', 'glasgow', 'reading']
    },
    {
        country: 'Canada',
        code: 'CA',
        currency: 'CAD',
        aliases: ['canada'],
        cities: ['toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton', 'waterloo', 'quebec city', 'victoria'],
        stateCodes: ['on', 'bc', 'qc', 'ab', 'ontario', 'british columbia', 'quebec', 'alberta']
    },
    {
        country: 'Germany',
        code: 'DE',
        currency: 'EUR',
        aliases: ['germany', 'deutschland'],
        cities: ['berlin', 'munich', 'frankfurt', 'hamburg', 'cologne', 'stuttgart', 'dusseldorf', 'bonn', 'leipzig']
    },
    {
        country: 'Japan',
        code: 'JP',
        currency: 'JPY',
        aliases: ['japan', 'nippon'],
        cities: ['tokyo', 'osaka', 'kyoto', 'yokohama', 'fukuoka', 'nagoya']
    },
    {
        country: 'Singapore',
        code: 'SG',
        currency: 'SGD',
        aliases: ['singapore'],
        cities: ['singapore']
    },
    {
        country: 'Ireland',
        code: 'IE',
        currency: 'EUR',
        aliases: ['ireland', 'republic of ireland'],
        cities: ['dublin', 'cork', 'galway', 'limerick']
    },
    {
        country: 'Netherlands',
        code: 'NL',
        currency: 'EUR',
        aliases: ['netherlands', 'holland'],
        cities: ['amsterdam', 'rotterdam', 'utrecht', 'the hague', 'eindhoven']
    },
    {
        country: 'Australia',
        code: 'AU',
        currency: 'AUD',
        aliases: ['australia'],
        cities: ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra']
    },
    {
        country: 'United Arab Emirates',
        code: 'AE',
        currency: 'AED',
        aliases: ['united arab emirates', 'uae', 'u.a.e.'],
        cities: ['dubai', 'abu dhabi', 'sharjah']
    },
    {
        country: 'France',
        code: 'FR',
        currency: 'EUR',
        aliases: ['france'],
        cities: ['paris', 'lyon', 'toulouse', 'marseille', 'bordeaux', 'nantes']
    },
    {
        country: 'Switzerland',
        code: 'CH',
        currency: 'CHF',
        aliases: ['switzerland', 'swiss'],
        cities: ['zurich', 'geneva', 'basel', 'lausanne', 'bern']
    },
    {
        country: 'Spain',
        code: 'ES',
        currency: 'EUR',
        aliases: ['spain', 'espana'],
        cities: ['madrid', 'barcelona', 'valencia', 'seville', 'malaga']
    },
    {
        country: 'Poland',
        code: 'PL',
        currency: 'PLN',
        aliases: ['poland', 'polska'],
        cities: ['warsaw', 'krakow', 'wroclaw', 'gdansk', 'poznan']
    },
    {
        country: 'Sweden',
        code: 'SE',
        currency: 'SEK',
        aliases: ['sweden', 'sverige'],
        cities: ['stockholm', 'gothenburg', 'malmo']
    },
    {
        country: 'Israel',
        code: 'IL',
        currency: 'ILS',
        aliases: ['israel'],
        cities: ['tel aviv', 'jerusalem', 'haifa', 'herzliya']
    },
    {
        country: 'Brazil',
        code: 'BR',
        currency: 'BRL',
        aliases: ['brazil', 'brasil'],
        cities: ['sao paulo', 'rio de janeiro', 'curitiba', 'florianopolis']
    },
    {
        country: 'South Korea',
        code: 'KR',
        currency: 'KRW',
        aliases: ['south korea', 'korea'],
        cities: ['seoul', 'busan', 'incheon']
    },
    {
        country: 'New Zealand',
        code: 'NZ',
        currency: 'NZD',
        aliases: ['new zealand'],
        cities: ['auckland', 'wellington', 'christchurch']
    }
];

/**
 * Normalizes location string into deterministic structured geographic fields.
 * 
 * @param {string} rawLocationStr 
 * @param {string} descriptionText 
 * @param {string} title 
 * @returns {Object} Structured geo metadata
 */
function normalizeJobGeo(rawLocationStr = '', descriptionText = '', title = '') {
    const locClean = (rawLocationStr || '').trim();
    const locLower = locClean.toLowerCase();
    const textLower = `${title} ${descriptionText}`.toLowerCase();

    // Defaults
    let country = '';
    let countryCode = '';
    let state = '';
    let city = '';
    let locationType = 'Unspecified';
    let workMode = 'On-site';
    let remoteEligibility = 'Eligibility Unclear';
    const eligibleCountries = [];
    const excludedCountries = [];
    let visaSponsorship = 'Unspecified';
    let relocationAssistance = 'Unspecified';
    let workAuthorization = '';
    let salaryCurrency = 'INR';

    // 1. Detect Work Mode
    const isRemote = (
        locLower.includes('remote') ||
        locLower.includes('anywhere') ||
        locLower.includes('distributed') ||
        locLower.includes('work from home') ||
        title.toLowerCase().includes('remote')
    );
    const isHybrid = locLower.includes('hybrid') || title.toLowerCase().includes('hybrid');

    if (isRemote) {
        workMode = 'Remote';
    } else if (isHybrid) {
        workMode = 'Hybrid';
    } else {
        workMode = 'On-site';
    }

    // 2. Check for India detection
    let isIndia = false;
    let detectedIndianCity = null;

    // Check city aliases
    for (const item of INDIAN_CITIES) {
        for (const alias of item.aliases) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(locLower)) {
                isIndia = true;
                detectedIndianCity = item.name;
                break;
            }
        }
        if (isIndia) break;
    }

    // Check India state or country keywords
    if (!isIndia) {
        if (/\bindia\b|\bindian\b/i.test(locLower)) {
            isIndia = true;
        } else {
            for (const st of INDIAN_STATES) {
                if (new RegExp(`\\b${st}\\b`, 'i').test(locLower)) {
                    isIndia = true;
                    state = st.charAt(0).toUpperCase() + st.slice(1);
                    break;
                }
            }
        }
    }

    // 3. Process India Locations
    if (isIndia) {
        country = 'India';
        countryCode = 'IN';
        salaryCurrency = 'INR';
        if (detectedIndianCity) {
            city = detectedIndianCity;
        } else if (workMode === 'Remote') {
            city = 'India (Remote)';
        } else {
            city = 'India (Multiple Cities)';
        }
        
        if (workMode === 'Remote') {
            locationType = 'Domestic';
            remoteEligibility = 'India Eligible';
            eligibleCountries.push('India');
        } else {
            locationType = 'Domestic';
        }
    } else {
        // 4. Check for International Locations
        let detectedCountry = null;
        let detectedCity = null;

        for (const ic of INTERNATIONAL_COUNTRIES) {
            // Check country aliases
            for (const alias of ic.aliases) {
                const aliasRegex = new RegExp(`\\b${alias}\\b`, 'i');
                if (aliasRegex.test(locLower)) {
                    detectedCountry = ic;
                    break;
                }
            }

            // Check cities
            if (!detectedCountry) {
                for (const c of ic.cities) {
                    const cityRegex = new RegExp(`\\b${c}\\b`, 'i');
                    if (cityRegex.test(locLower)) {
                        detectedCountry = ic;
                        detectedCity = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        break;
                    }
                }
            }

            // Check state codes (e.g. "San Francisco, CA", "Austin, TX")
            if (!detectedCountry && ic.stateCodes) {
                for (const st of ic.stateCodes) {
                    const stRegex = new RegExp(`[,•\\s-]\\s*${st}\\b`, 'i');
                    if (stRegex.test(locLower)) {
                        detectedCountry = ic;
                        break;
                    }
                }
            }

            if (detectedCountry) break;
        }

        if (detectedCountry) {
            country = detectedCountry.country;
            countryCode = detectedCountry.code;
            salaryCurrency = detectedCountry.currency;
            city = detectedCity || (locClean.includes(',') ? locClean.split(',')[0].trim() : detectedCountry.country);

            if (workMode === 'Remote') {
                locationType = 'Remote_Country_Specific';
                remoteEligibility = 'Specific Countries Only';
                eligibleCountries.push(country);
            } else {
                locationType = 'International';
            }
        } else {
            // 5. Check if Remote Worldwide / Global / Anywhere
            const isWorldwide = (
                locLower.includes('worldwide') ||
                locLower.includes('anywhere') ||
                locLower.includes('global') ||
                locLower.includes('work from anywhere') ||
                locLower.includes('remote - worldwide') ||
                locLower.includes('remote worldwide') ||
                textLower.includes('work from anywhere in the world') ||
                textLower.includes('hire globally') ||
                textLower.includes('anywhere in the world')
            );

            if (isWorldwide) {
                workMode = 'Remote';
                locationType = 'Remote_Worldwide';
                remoteEligibility = 'Worldwide Eligible';
                city = 'Worldwide';
                salaryCurrency = 'USD';
            } else if (workMode === 'Remote') {
                // Remote without specified geography
                locationType = 'Remote_Worldwide';
                remoteEligibility = 'Eligibility Unclear';
                city = 'Remote';
                salaryCurrency = 'USD';
            } else if (locClean && locClean !== 'Remote' && locClean !== 'Hybrid') {
                // Has some text like "Distributed", "Unspecified", etc.
                locationType = 'Unspecified';
                city = locClean;
            } else {
                locationType = 'Unspecified';
                city = 'Location not specified';
            }
        }
    }

    // 6. Visa Sponsorship & Relocation Extraction
    // Check negative restrictions first to prevent "no visa sponsorship is available" from matching positive patterns
    const isNegativeVisa = /no visa sponsorship|not provide visa sponsorship|unable to sponsor|cannot sponsor|we do not sponsor|not able to sponsor|without (?:the )?need for sponsorship|must be authorized to work.*without sponsorship|requires? (?:u\.?s\.?|us) citizenship|permanent work authorization required/i.test(textLower);

    const isPositiveVisa = !isNegativeVisa && (/visa sponsorship (?:is )?available|we (?:can )?sponsor visas|offer visa sponsorship|visa support (?:is )?provided|sponsorship (?:is )?offered/i.test(textLower));

    const isPositiveReloc = /relocation assistance|relocation package|relocation support|provide relocation|relocation stipend/i.test(textLower);

    if (isNegativeVisa) {
        visaSponsorship = 'Not Available';
        relocationAssistance = 'Not Available';
    } else if (isPositiveVisa) {
        visaSponsorship = 'Available';
        if (isPositiveReloc) {
            relocationAssistance = 'Available';
        }
    } else if (isPositiveReloc) {
        relocationAssistance = 'Available';
    } else {
        visaSponsorship = 'Unspecified';
        relocationAssistance = 'Unspecified';
    }

    // 7. Work Authorization Signals
    if (/u\.?s\.? citizenship required|us citizens only/i.test(textLower)) {
        workAuthorization = 'US Citizenship Required';
    } else if (/must have (?:the )?right to work in ireland/i.test(textLower)) {
        workAuthorization = 'Ireland Right to Work Required';
    } else if (/must be legally authorized to work in the united states|u\.?s\.? work authorization required/i.test(textLower)) {
        workAuthorization = 'US Work Authorization Required';
    } else if (/must be legally authorized to work in the uk|right to work in the uk/i.test(textLower)) {
        workAuthorization = 'UK Right to Work Required';
    } else if (/must be legally authorized to work in canada|canadian work permit/i.test(textLower)) {
        workAuthorization = 'Canadian Work Permit Required';
    } else if (/eu work permit|right to work in the eu/i.test(textLower)) {
        workAuthorization = 'EU Right to Work Required';
    } else if (/u\.?s\.? government security clearance/i.test(textLower)) {
        workAuthorization = 'US Security Clearance Required';
    }

    // 8. Currency Refinement from text
    if (/₹|inr|lakh|lpa/i.test(textLower) || country === 'India') {
        salaryCurrency = 'INR';
    } else if (/\$|usd/i.test(textLower) || country === 'United States') {
        salaryCurrency = 'USD';
    } else if (/£|gbp/i.test(textLower) || country === 'United Kingdom') {
        salaryCurrency = 'GBP';
    } else if (/€|eur/i.test(textLower) || ['Germany', 'Netherlands', 'Ireland', 'France', 'Spain'].includes(country)) {
        salaryCurrency = 'EUR';
    }

    return {
        country,
        countryCode,
        state,
        city,
        locationType,
        workMode,
        remoteEligibility,
        eligibleCountries,
        excludedCountries,
        visaSponsorship,
        relocationAssistance,
        workAuthorization,
        salaryCurrency
    };
}

/**
 * Evaluates Application Eligibility (GREEN, YELLOW, RED) based on student profile and job opportunity.
 * Kept completely distinct from technical match score.
 * 
 * @param {Object} studentProfile - Student profile document
 * @param {Object} job - Standardized job document
 * @returns {Object} Structured eligibility assessment
 */
function evaluateApplicationEligibility(studentProfile = {}, job = {}) {
    const reasons = [];
    let isRed = false;
    let isYellow = false;

    // Student attributes
    const studentCountry = (studentProfile?.country || 'India').trim();
    const studentEducation = (studentProfile?.education || '').toLowerCase();
    const studentGradYear = parseInt(studentProfile?.graduationYear, 10) || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const hasWorkAuthAbroad = Boolean(studentProfile?.internationalWorkAuthorization);

    // Job attributes
    const jobCountry = (job.country || '').trim();
    const jobLocationType = job.locationType || 'Unspecified';
    const remoteEligibility = job.remoteEligibility || 'Eligibility Unclear';
    const visaSponsorship = job.visaSponsorship || 'Unspecified';
    const workAuthReq = job.workAuthorization || '';
    const jobWorkMode = (job.workMode || '').toLowerCase();
    const jobExp = (job.experience || '').toLowerCase();
    const isFresher = job.freshersEligible !== false;

    // ---------------------------------------------------------
    // CRITERIA 1: GEOGRAPHIC & WORK AUTHORIZATION RESTRICTIONS
    // ---------------------------------------------------------
    const isInternationalJob = (jobLocationType === 'International' || (jobCountry && jobCountry.toLowerCase() !== 'india'));
    const isDomesticJob = (jobLocationType === 'Domestic' || jobCountry.toLowerCase() === 'india' || remoteEligibility === 'India Eligible');

    if (isInternationalJob && studentCountry.toLowerCase() === 'india' && !hasWorkAuthAbroad) {
        if (visaSponsorship === 'Not Available') {
            isRed = true;
            reasons.push(`Employer explicitly states visa sponsorship is NOT available for this ${jobCountry || 'international'} position. Candidates without existing work authorization in ${jobCountry || 'the destination country'} cannot be hired.`);
        } else if (workAuthReq && (workAuthReq.includes('Citizenship') || workAuthReq.includes('Required'))) {
            isRed = true;
            reasons.push(`Role requires existing local authorization (${workAuthReq}). Indian applicants without this authorization face a legal hiring restriction.`);
        } else if (visaSponsorship === 'Available') {
            reasons.push(`Employer offers visa sponsorship/relocation assistance for qualified candidates applying to this ${jobCountry} role.`);
        } else {
            isYellow = true;
            reasons.push(`Position is located in ${jobCountry || 'an international location'} with unconfirmed visa sponsorship. International applicants must independently verify if the employer supports visa petitions for this role.`);
        }
    } else if (jobLocationType === 'Remote_Country_Specific' && studentCountry.toLowerCase() === 'india') {
        if (job.eligibleCountries && job.eligibleCountries.length > 0 && !job.eligibleCountries.includes('India')) {
            isRed = true;
            reasons.push(`Remote opportunity is strictly restricted to residents of ${job.eligibleCountries.join(', ')}. Remote work from India is not supported by the employer.`);
        } else {
            isYellow = true;
            reasons.push(`Remote position with country-specific restrictions. Remote residency eligibility from India needs employer confirmation.`);
        }
    } else if (remoteEligibility === 'Worldwide Eligible') {
        reasons.push(`Worldwide remote position. Eligible for candidates worldwide, including applicants based in India.`);
    } else if (isDomesticJob) {
        reasons.push(`Domestic opportunity physically or remotely accessible within India.`);
    }

    // ---------------------------------------------------------
    // CRITERIA 2: EXPERIENCE REQUIREMENTS & FRESHER SUITABILITY
    // ---------------------------------------------------------
    const isSeniorRole = (jobExp.includes('5+') || jobExp.includes('7+') || jobExp.includes('senior') || jobExp.includes('lead') || jobExp.includes('principal') || jobExp.includes('director'));
    const yearsSinceGrad = currentYear - studentGradYear;

    if (isSeniorRole && isFresher && yearsSinceGrad <= 1) {
        isYellow = true;
        reasons.push(`Position seeks senior-level professional experience (${jobExp}). Freshers or recent graduates may face experience pre-requisite challenges.`);
    } else if (jobExp.includes('3+') && yearsSinceGrad < 1 && !isFresher) {
        isYellow = true;
        reasons.push(`Job seeks 3+ years experience, whereas profile indicates recent graduate / early career.`);
    } else {
        reasons.push(isFresher ? `Entry-level & fresher friendly: Suitable for students and recent university graduates.` : `Experience requirement (${jobExp}) aligns with typical career progression.`);
    }

    // ---------------------------------------------------------
    // CRITERIA 3: ACADEMIC QUALIFICATION & DISCIPLINE
    // ---------------------------------------------------------
    const jobTitle = (job.title || '').toLowerCase();
    const isCoreMechanicalJob = /mechanical engineer|cad designer|thermal engineer|automotive engineer/i.test(jobTitle);
    const isCoreCivilJob = /civil engineer|structural engineer|site engineer/i.test(jobTitle);

    if (isCoreMechanicalJob && studentEducation && !studentEducation.includes('mechanical') && !studentEducation.includes('automobile')) {
        isRed = true;
        reasons.push(`Strict discipline requirement: Role requires a Mechanical/Automotive Engineering qualification, which diverges from ${studentProfile?.education || 'your profile'}.`);
    } else if (isCoreCivilJob && studentEducation && !studentEducation.includes('civil')) {
        isRed = true;
        reasons.push(`Strict discipline requirement: Role requires a Civil/Structural Engineering qualification, which diverges from ${studentProfile?.education || 'your profile'}.`);
    }

    // ---------------------------------------------------------
    // COMPOSE FINAL STATUS
    // ---------------------------------------------------------
    let status = 'GREEN';
    let label = 'Appears Eligible';

    if (isRed) {
        status = 'RED';
        label = 'Known Eligibility Conflict';
    } else if (isYellow) {
        status = 'YELLOW';
        label = 'Eligibility Needs Verification';
    }

    return {
        status,
        label,
        reasons,
        disclaimer: 'Advisory notice: This assessment is an automated check based on public job requirements and student profile. Legal eligibility and final hiring decisions rest exclusively with the hiring organization.'
    };
}

module.exports = {
    INDIAN_CITIES,
    INDIAN_STATES,
    INTERNATIONAL_COUNTRIES,
    normalizeJobGeo,
    evaluateApplicationEligibility
};
