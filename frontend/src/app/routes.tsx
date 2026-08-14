import { createBrowserRouter } from "react-router";
import { Root } from "./components/root";
import { AppLayout } from "./components/app-layout";
import { LandingPage } from "./pages/landing-page";
import { AssessmentForm } from "./pages/assessment-form";
import { CareerResults } from "./pages/career-results";
import { ResumeAnalyzer } from "./pages/resume-analyzer";
import { ChatBot } from "./pages/chatbot";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { Courses } from "./pages/courses";
import { RoadmapPage } from "./pages/roadmap";
import { InterviewPrepPage } from "./pages/interview-prep";
import { SavedPrepsPage } from "./pages/saved-preps";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
    ],
  },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "assessment", Component: AssessmentForm },
      { path: "results", Component: CareerResults },
      { path: "resume", Component: ResumeAnalyzer },
      { path: "chatbot", Component: ChatBot },
      { path: "courses", Component: Courses },
      { path: "roadmap", Component: RoadmapPage },
      { path: "interview-prep", Component: InterviewPrepPage },
      { path: "saved-preps", Component: SavedPrepsPage },
    ],
  },
]);
