import { useState } from "react";
import { useNavigate } from "react-router";
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
  const { user } = useAuth();

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to results
      setSaving(true);
      try {
        if (user) {
           await axios.put("http://localhost:5000/api/profile", {
             education: `${formData.branch} - ${formData.year}`,
             skills: formData.skills,
             interests: formData.interestAreas,
             skill_ratings: formData.skillRatings || {}
           });
        }
      } catch (err) {
        console.error("Failed to save profile on completion");
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
      <div className="w-full py-12 px-6">
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
                          ? "bg-primary border-primary"
                          : currentStep === step.id
                          ? "border-primary bg-card"
                          : "border-border bg-card"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span
                          className={`${
                            currentStep === step.id ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center hidden sm:block ${
                        currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 mx-2">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: currentStep > step.id ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            className="relative p-8 rounded-2xl bg-card border border-border backdrop-blur-xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(79, 142, 247, 0.05) 0%, transparent 50%)",
            }}
          >
            {/* Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500 rounded-t-2xl" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <div className="text-muted-foreground text-sm">
                Step {currentStep} of {STEPS.length}
              </div>

              <button
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === STEPS.length ? "Get Results" : "Next"}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </DndProvider>
  );
}
