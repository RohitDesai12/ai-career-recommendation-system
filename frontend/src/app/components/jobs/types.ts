export interface ApplicationEligibility {
  status: 'GREEN' | 'YELLOW' | 'RED';
  label: string;
  reasons: string[];
  disclaimer: string;
}

export type GeoScope = 'india' | 'international' | 'remote' | 'all';

export interface MatchBreakdown {
  technicalSkills: number;
  educationRelevance: number;
  experienceCompatibility: number;
  careerInterest: number;
  locationPreference: number;
}

export interface CareerMatchInfo {
  matchScore: number;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  matchExplanation: string;
  readiness: {
    strongMatches: string[];
    skillsToImprove: string[];
    eligibilityConcerns: string[];
    recommendedPreparation: {
      type: 'roadmap' | 'resume' | 'courses' | 'interview';
      label: string;
      path: string;
    }[];
  };
}

export interface JobItem {
  _id: string;
  title: string;
  companyName: string;
  department?: string;
  category?: string;
  location: string;
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  locationType?: 'Domestic' | 'International' | 'Remote_Worldwide' | 'Remote_Country_Specific' | 'Unspecified';
  remoteEligibility?: 'India Eligible' | 'Worldwide Eligible' | 'Specific Countries Only' | 'Eligibility Unclear';
  eligibleCountries?: string[];
  excludedCountries?: string[];
  visaSponsorship?: 'Available' | 'Not Available' | 'Unspecified';
  relocationAssistance?: 'Available' | 'Not Available' | 'Unspecified';
  workAuthorization?: string;
  salaryCurrency?: string;
  applicationEligibility?: ApplicationEligibility;
  suitabilityScore?: number;
  type: string;
  workMode: string;
  experience: string;
  salary: string;
  skills: string[];
  preferredSkills?: string[];
  education?: string;
  description?: string;
  responsibilities?: string[];
  benefits?: string[];
  deadline?: string;
  officialApplyUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceType?: 'ATS_GREENHOUSE' | 'ATS_LEVER' | 'JSON_FEED' | 'MANUAL_SEED' | 'OFFICIAL_CAREER_PORTAL';
  sourcePublishedAt?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastVerifiedDate?: string;
  verificationStatus?: 'Verified' | 'Under Review' | 'Unverified';
  dataQualityStatus?: 'High Quality' | 'Acceptable' | 'Needs Review' | 'Invalid';
  freshersEligible?: boolean;
  status?: string;
  matchScore?: number;
  matchBreakdown?: MatchBreakdown;
  matchedSkills?: string[];
  relatedSkills?: { requiredSkill: string; relatedStudentSkill: string }[];
  missingSkills?: string[];
  matchExplanation?: string;
  readiness?: CareerMatchInfo['readiness'];
  whyItMatches?: string[];
  whatYouAreMissing?: string[];
  eligibilityConcerns?: string[];
  whatToLearnBeforeApplying?: { skill: string; priority: string; coursePath: string; roadmapPath: string }[];
  createdAt?: string;
}

export interface CompanyItem {
  _id?: string;
  companyName: string;
  logoUrl?: string;
  industry: string;
  category: string;
  description: string;
  officialWebsite: string;
  careerPageUrl: string;
  location?: string;
  companySize?: string;
  isVerified?: boolean;
  availableJobCount?: number;
  hasLiveIntegration?: boolean;
  integrationType?: 'GREENHOUSE' | 'LEVER' | 'FEED' | 'NONE';
  lastSyncAt?: string;
}

export interface SavedJobItem {
  savedId: string;
  savedAt: string;
  notes?: string;
  job: JobItem;
}

export interface TrackedApplication {
  _id: string;
  job?: JobItem;
  role: string;
  companyName: string;
  officialApplyUrl?: string;
  applicationType: 'External' | 'Direct';
  status: 'Saved' | 'Preparing' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  isManualStatus: boolean;
  notes?: string;
  nextFollowUpDate?: string;
  timeline?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  appliedAt: string;
  lastUpdated: string;
  matchScore?: number;
}

export interface JobAlertItem {
  _id: string;
  title: string;
  role?: string;
  company?: string;
  skills?: string[];
  location?: string;
  geoScope?: 'India' | 'International' | 'Remote Worldwide' | 'All';
  targetCountry?: string;
  targetCity?: string;
  visaSponsorshipOnly?: boolean;
  jobType?: string;
  workMode?: string;
  freshersOnly?: boolean;
  frequency: 'Daily' | 'Weekly' | 'Instant';
  minMatchScore?: number;
  notificationChannel?: 'IN_APP' | 'EMAIL' | 'BOTH';
  isActive: boolean;
  notificationsSent?: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

