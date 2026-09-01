import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import { Step1Academic } from "../components/assessment/step1-academic";
import { Step2Skills } from "../components/assessment/step2-skills";
import { Step3Priorities } from "../components/assessment/step3-priorities";
import { Step4WorkStyle } from "../components/assessment/step4-work-style";
import { Step5Goals } from "../components/assessment/step5-goals";

const STEPS = [
  { id: 1, label: "Academic Background" },
  { id: 2, label: "Skills & Experience" },
  { id: 3, label: "Priorities" },
  { id: 4, label: "Work Style" },
  { id: 5, label: "Goals & Aspirations" },
];

export function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    branch: "",
    specialization: "",
    year: "",
    cgpa: "",
    skills: [],
    projects: 0,
    certifications: 0,
    interestAreas: [],
    careerValues: [],
    workPreference: "",
    environment: "",
    remotePreference: "",
    postBTechGoal: "",
    salaryExpectation: "",
    softSkills: [],
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // If the user already has saved test results and did not explicitly click "Retake", redirect to their results!
  useEffect(() => {
    if (!location.state?.retake) {
      const savedFormData = localStorage.getItem("saved_career_assessment_formData");
      const savedResults = localStorage.getItem("saved_career_results");
      if (savedFormData || savedResults) {
        navigate("/results", { replace: true });
      }
    }
  }, [location.state, navigate]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete & save assessment
      setSaving(true);
      try {
        // Save to localStorage for persistence across navigation
        localStorage.setItem("saved_career_assessment_formData", JSON.stringify(formData));
        localStorage.removeItem("saved_career_results"); // Force recalculation with new inputs

        if (user) {
          await axios.put("http://localhost:5000/api/profile", {
            education: `${formData.branch} - ${formData.year}`,
            skills: formData.skills,
            interests: formData.interestAreas,
            skill_ratings: formData.skillRatings || {}
          });
        }
      } catch (err) {
        console.error("Failed to save profile on completion", err);
      } finally {
        setSaving(false);
        navigate("/results", { state: { formData } });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Academic data={formData} updateData={updateFormData} />;
      case 2:
        return <Step2Skills data={formData} updateData={updateFormData} />;
      case 3:
        return <Step3Priorities data={formData} updateData={updateFormData} />;
      case 4:
        return <Step4WorkStyle data={formData} updateData={updateFormData} />;
      case 5:
        return <Step5Goals data={formData} updateData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full py-12 px-6 bg-background text-foreground">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep > step.id
                          ? "bg-primary border-primary text-white"
                          : currentStep === step.id
                          ? "border-primary bg-card text-primary font-bold"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm font-semibold">{step.id}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 hidden sm:block font-medium">
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-all ${
                        currentStep > step.id ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center sm:hidden">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-card border border-border shadow-xl mb-8"
          >
            {renderStep()}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl border border-border hover:bg-surface-container transition-all flex items-center gap-2 text-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : currentStep === STEPS.length ? (
                <>
                  <span>Complete Assessment</span>
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
