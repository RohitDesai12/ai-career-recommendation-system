import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./components/root";
import { AppLayout } from "./components/app-layout";
import { LandingPage } from "./pages/landing-page";
import { AssessmentForm } from "./pages/assessment-form";
import { CareerResults } from "./pages/career-results";
import { ResumeAnalyzer } from "./pages/resume-analyzer";
import { ResumeStudioOverview } from "./pages/resume-studio-overview";
import { ResumeCreateHub } from "./pages/resume-create-hub";
import { ResumeTemplatesGallery } from "./pages/resume-templates-gallery";
import { ResumeBuilder } from "./pages/resume-builder";
import { ResumeTailor } from "./pages/resume-tailor";
import { CoverLetterGenerator } from "./pages/cover-letter-generator";
import { MyResumes } from "./pages/my-resumes";
import { ResumeSettings } from "./pages/resume-settings";
import { ScoreHistoryPage } from "./pages/score-history";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { Courses } from "./pages/courses";
import { RoadmapPage } from "./pages/roadmap";
import { InterviewPrepPage } from "./pages/interview-prep";
import { MockInterviewPage } from "./pages/mock-interview";
import { SavedPrepsPage } from "./pages/saved-preps";
import { JobsPage } from "./pages/jobs";
import { ProfilePage } from "./pages/profile";
import { CareerProgressPage } from "./pages/career-progress";
import { CareerPreferencesPage } from "./pages/career-preferences";
import { NotificationsPage } from "./pages/notifications";
import { SettingsPage } from "./pages/settings";
import { SearchResultsPage } from "./pages/search-results";
import { AdminLayout } from "./components/admin-layout";
import { AdminDashboard } from "./pages/admin-dashboard";
import { AdminUsers } from "./pages/admin-users";
import { AdminApplications } from "./pages/admin-applications";
import { AdminJobAlerts } from "./pages/admin-job-alerts";
import { AdminContent } from "./pages/admin-content";
import { AdminAIRecommendations } from "./pages/admin-ai-recommendations";
import { AdminReportsAnalytics } from "./pages/admin-reports-analytics";
import { AdminModeration } from "./pages/admin-moderation";
import { AdminAuditLogs } from "./pages/admin-audit-logs";
import { AdminSystem } from "./pages/admin-system";
import { AdminSettings } from "./pages/admin-settings";
import { AdminJobSources } from "./pages/admin-job-sources";
import { RouteErrorBoundary } from "./components/route-error-boundary";
import { PublicPortfolioPage } from "./pages/public-portfolio";
import { PrivacyPolicyPage } from "./pages/legal/privacy-policy-page";
import { TermsPage } from "./pages/legal/terms-page";
import { CookiePolicyPage } from "./pages/legal/cookie-policy-page";
import { AITransparencyPage } from "./pages/legal/ai-transparency-page";
import { DisclaimerPage } from "./pages/legal/disclaimer-page";
import { SecurityPolicyPage } from "./pages/legal/security-policy-page";
import { DataDeletionPolicyPage } from "./pages/legal/data-deletion-page";
import { CopyrightPolicyPage } from "./pages/legal/copyright-page";
import { AccessibilityPage } from "./pages/legal/accessibility-page";
import { ContactPage } from "./pages/legal/contact-page";
import { HelpCenterPage } from "./pages/legal/help-center-page";
import { FAQsPage } from "./pages/legal/faqs-page";
import { AdminPrivacyRequests } from "./pages/admin-privacy-requests";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "search", Component: SearchResultsPage },
      { path: "portfolio/:id", Component: PublicPortfolioPage },
      { path: "privacy-policy", Component: PrivacyPolicyPage },
      { path: "terms", Component: TermsPage },
      { path: "cookie-policy", Component: CookiePolicyPage },
      { path: "ai-transparency", Component: AITransparencyPage },
      { path: "disclaimer", Component: DisclaimerPage },
      { path: "security", Component: SecurityPolicyPage },
      { path: "data-deletion", Component: DataDeletionPolicyPage },
      { path: "copyright", Component: CopyrightPolicyPage },
      { path: "accessibility", Component: AccessibilityPage },
      { path: "contact", Component: ContactPage },
      { path: "help", Component: HelpCenterPage },
      { path: "faqs", Component: FAQsPage },
      { path: "employer/*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: "/",
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "search", Component: SearchResultsPage },
      { path: "profile", Component: ProfilePage },
      { path: "portfolio", Component: PublicPortfolioPage },
      { path: "career-progress", Component: CareerProgressPage },
      { path: "career-preferences", Component: CareerPreferencesPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "settings", Component: SettingsPage },
      { path: "jobs", Component: JobsPage },
      { path: "jobs/:id", Component: JobsPage },
      { path: "assessment", Component: AssessmentForm },
      { path: "results", Component: CareerResults },
      
      // Resume Studio Routes
      { path: "resume", Component: ResumeAnalyzer },
      { path: "resume-studio", Component: ResumeStudioOverview },
      { path: "resume-studio/overview", Component: ResumeStudioOverview },
      { path: "resume-studio/create", Component: ResumeCreateHub },
      { path: "resume-studio/templates", Component: ResumeTemplatesGallery },
      { path: "resume-studio/builder", Component: ResumeBuilder },
      { path: "resume-studio/tailor", Component: ResumeTailor },
      { path: "resume-studio/cover-letter", Component: CoverLetterGenerator },
      { path: "resume-studio/my-resumes", Component: MyResumes },
      { path: "resume-studio/settings", Component: ResumeSettings },
      { path: "resume-studio/portfolio", element: <Navigate to="/resume-studio/my-resumes" replace /> },
      { path: "resume-studio/score-history", Component: ScoreHistoryPage },

      { path: "chatbot", element: <Navigate to="/dashboard" replace /> },
      { path: "courses", Component: Courses },
      { path: "roadmap", Component: RoadmapPage },
      { path: "roadmap/overview", Component: RoadmapPage },
      { path: "roadmap/roadmaps", Component: RoadmapPage },
      { path: "roadmap/history", Component: RoadmapPage },
      { path: "mock-interview", Component: MockInterviewPage },
      { path: "interview-prep", Component: InterviewPrepPage },
      { path: "saved-preps", Component: SavedPrepsPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "dashboard", Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "companies", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "jobs", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "applications", Component: AdminApplications },
      { path: "job-alerts", Component: AdminJobAlerts },
      { path: "job-sources", Component: AdminJobSources },
      { path: "content", Component: AdminContent },
      { path: "analytics", Component: AdminReportsAnalytics },
      { path: "ai-models", Component: AdminAIRecommendations },
      { path: "moderation", Component: AdminModeration },
      { path: "privacy-requests", Component: AdminPrivacyRequests },
      { path: "audit-logs", Component: AdminAuditLogs },
      { path: "system", Component: AdminSystem },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);
