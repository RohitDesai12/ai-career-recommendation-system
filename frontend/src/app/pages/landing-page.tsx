import { useState, useRef, useEffect } from "react";
import { Navbar } from "../components/navbar";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/theme-context";
import backgroundVideo from "../../assets/background_video.mp4";
import careerHeroImg from "../../assets/career_hero.jpg";
import careerInterviewImg from "../../assets/career_interview.jpg";

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay waiting for user gesture:", err);
      });
    }
  }, []);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);

      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
        setShowVolumeToast(true);
        setTimeout(() => setShowVolumeToast(false), 3000);
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const CORE_CAPABILITIES = [
    {
      to: "/resume",
      title: "AI Resume Analysis",
      icon: "description",
      badgeColor: "bg-[#1F5C45]/10 text-[#1F5C45] border-[#1F5C45]/20",
      hoverBorder: "hover:border-[#1F5C45]/60 hover:shadow-[#1F5C45]/10",
      btnText: "Analyze Resume",
      description: "Upload your resume and let our analysis dissect it. We identify strengths, highlight missing keywords, and suggest optimizations tailored to target roles.",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80"
    },
    {
      to: "/assessment",
      title: "Predictive Career Matching",
      icon: "bolt",
      badgeColor: "bg-[#D6A85F]/15 text-[#9E732A] border-[#D6A85F]/30",
      hoverBorder: "hover:border-[#D6A85F]/70 hover:shadow-[#D6A85F]/10",
      btnText: "Take Career Test",
      description: "Stop searching blindly. Our algorithms predict which roles and industries align best with your evolving skill set, academic background, and preferences.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80"
    },
    {
      to: "/roadmap",
      title: "Interactive Career Roadmap",
      icon: "map",
      badgeColor: "bg-[#1F5C45]/10 text-[#1F5C45] border-[#1F5C45]/20",
      hoverBorder: "hover:border-[#1F5C45]/60 hover:shadow-[#1F5C45]/10",
      btnText: "View Your Roadmap",
      description: "Step-by-step guidance tailored to your target engineering role with milestone checklists, timeline expectations, and progress tracking.",
      image: careerHeroImg
    },
    {
      to: "/courses",
      title: "Curated Courses & Skills",
      icon: "school",
      badgeColor: "bg-[#C8754D]/15 text-[#C8754D] border-[#C8754D]/25",
      hoverBorder: "hover:border-[#C8754D]/60 hover:shadow-[#C8754D]/10",
      btnText: "Browse Courses",
      description: "Explore curated video courses, certifications, and resources across Coursera, Udemy, and top platforms to level up your engineering skills.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
    },
    {
      to: "/interview-prep",
      title: "AI Mock Interviews & Prep",
      icon: "work",
      badgeColor: "bg-[#D6A85F]/15 text-[#9E732A] border-[#D6A85F]/30",
      hoverBorder: "hover:border-[#D6A85F]/70 hover:shadow-[#D6A85F]/10",
      btnText: "Start Interview Prep",
      description: "Practice branch-specific mock interviews with our interactive voice/text mentor, get real-time feedback, and build interview confidence.",
      image: careerInterviewImg
    },
    {
      to: "/chatbot",
      title: "24/7 AI Career Mentor",
      icon: "smart_toy",
      badgeColor: "bg-[#1F5C45]/10 text-[#1F5C45] border-[#1F5C45]/20",
      hoverBorder: "hover:border-[#1F5C45]/60 hover:shadow-[#1F5C45]/10",
      btnText: "Chat with Mentor",
      description: "Ask anything about industry trends, technical preparation, career transitions, and receive instant personalized advice anytime.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground relative overflow-x-hidden flex flex-col justify-between transition-colors duration-300">
      <Navbar variant="video" />

      <main className="w-full flex-grow">
        <div className="flex flex-col w-full">

          {/* Hero Section with Live Background Video */}
          <section className="relative w-full min-h-screen flex flex-col justify-between text-center px-6 md:px-12 pt-28 pb-12 overflow-hidden bg-black">
            
            {/* Background Video Layer */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <video
                ref={videoRef}
                src={backgroundVideo}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                preload="auto"
                className="w-full h-full object-cover scale-[1.02]"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>

              {/* Scrim Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_100%)]" />
            </div>

            {/* Hero Main Content */}
            <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 my-auto">
              
              {/* Tag Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/25 mb-8 shadow-2xl"
              >
                <span className="material-symbols-outlined text-[#D6A85F] text-[18px] animate-pulse">auto_awesome</span>
                <span className="font-label-sm text-xs text-[#F7F3EA] uppercase tracking-widest font-bold">The Future of Career Guidance</span>
              </motion.div>

              {/* Hero Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="font-display-lg text-4xl sm:text-5xl md:text-[68px] leading-[1.08] font-extrabold text-white max-w-4xl mb-6 tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              >
                Discover Your Dream Career
                <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] via-[#D6A85F] to-[#C8754D]">
                  with Precision Intelligence
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-body-lg text-base sm:text-lg md:text-[20px] text-[#F7F3EA]/90 max-w-2xl mb-10 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              >
                Navigate the complexities of the modern job market with clarity. Our intelligent platform analyzes your unique skills, passions, and industry trends to chart a personalized path to professional fulfillment.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-5 items-center z-10"
              >
                <Link 
                  to="/assessment" 
                  className="px-9 py-4 bg-[#1F5C45] hover:bg-[#1F5C45]/90 text-white rounded-full font-label-sm text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(31,92,69,0.8)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-2xl border border-emerald-400/30"
                >
                  Get Started Free
                </Link>
                <a 
                  href="#features" 
                  className="px-9 py-4 bg-black/40 backdrop-blur-md text-[#F7F3EA] border border-white/30 rounded-full font-label-sm text-xs font-bold uppercase tracking-wider hover:bg-black/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-xl"
                >
                  Explore Features
                </a>
              </motion.div>
            </div>

            {/* Bottom Audio & Video Controller Toolbar */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between relative z-20 pt-8">
              
              {/* Minimal status indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-[#F7F3EA] shadow-xl">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-semibold">Cinematic Video Background</span>
              </div>

              {/* Audio & Play Controls */}
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {showVolumeToast && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#1F5C45] border border-emerald-400/30 text-[#F7F3EA] text-xs font-semibold rounded-full shadow-2xl"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                      Audio Unmuted
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dark / Light Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/25 text-[#D6A85F] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer group"
                  title={theme === "dark" ? "Switch to Warm Cream (Light) Mode" : "Switch to Deep Forest (Dark) Mode"}
                  aria-label="Toggle dark/light theme"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                    {theme === "dark" ? "light_mode" : "dark_mode"}
                  </span>
                </button>

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/25 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer group"
                  title={isPlaying ? "Pause Video" : "Play Video"}
                >
                  <span className="material-symbols-outlined text-[22px] group-hover:text-[#D6A85F] transition-colors">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>

                {/* Mute / Unmute Audio Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 ${
                    isMuted
                      ? "bg-black/70 border-white/30 text-[#F7F3EA] hover:border-[#D6A85F]"
                      : "bg-[#1F5C45] border-emerald-400/50 text-white shadow-[0_0_25px_rgba(31,92,69,0.7)]"
                  }`}
                >
                  {isMuted ? (
                    <span className="material-symbols-outlined text-[20px] text-red-400">volume_off</span>
                  ) : (
                    <div className="flex items-center gap-0.5 h-4 select-none">
                      <span className="w-0.5 bg-white rounded-full h-2 animate-[bounce_0.8s_infinite_100ms]"></span>
                      <span className="w-0.5 bg-white rounded-full h-4 animate-[bounce_0.8s_infinite_300ms]"></span>
                      <span className="w-0.5 bg-white rounded-full h-3 animate-[bounce_0.8s_infinite_200ms]"></span>
                      <span className="w-0.5 bg-white rounded-full h-4 animate-[bounce_0.8s_infinite_400ms]"></span>
                    </div>
                  )}

                  <span className="font-label-sm text-xs font-bold tracking-wider">
                    {isMuted ? "Unmute Audio" : "Mute Audio"}
                  </span>
                </button>
              </div>

            </div>
          </section>

          {/* Clickable Core Capabilities Grid Section */}
          <section className="py-28 px-6 md:px-12 w-full relative border-t border-border/40 bg-surface-container-low" id="features">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                <span className="text-primary text-xs font-extrabold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full mb-4">Core Capabilities</span>
                <h2 className="font-headline-md text-3xl md:text-4xl font-extrabold text-foreground mb-4">Intelligent Tools for Modern Professionals</h2>
                <p className="font-body-md text-on-surface-variant text-base">Click any tool below to explore interactive AI assessments, career roadmaps, interview simulators, and curated courses.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CORE_CAPABILITIES.map((feature) => (
                  <Link
                    key={feature.title}
                    to={feature.to}
                    className={`bg-card rounded-3xl border border-border/80 ${feature.hoverBorder} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group flex flex-col overflow-hidden h-full cursor-pointer`}
                  >
                    {/* Header visual image */}
                    <div 
                      className="h-48 w-full bg-cover bg-center group-hover:scale-[1.04] transition-transform duration-500 relative"
                      style={{ backgroundImage: `url('${feature.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-grow flex flex-col justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${feature.badgeColor} flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 duration-300`}>
                          <span className="material-symbols-outlined text-[24px]">{feature.icon}</span>
                        </div>
                        <h3 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          <span>{feature.title}</span>
                          <span className="material-symbols-outlined text-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary">arrow_forward</span>
                        </h3>
                        <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Footer Action Button */}
                      <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                        <span className="font-label-sm text-xs font-bold text-primary group-hover:underline uppercase tracking-wider">
                          {feature.btnText}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-surface-2 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <span className="material-symbols-outlined text-[16px]">north_east</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Alternating Showcase Highlights */}
          <section className="py-28 px-6 md:px-12 w-full bg-background border-t border-border/40">
            <div className="max-w-7xl mx-auto space-y-32">
              
              {/* Highlight Row 1 - Roadmap */}
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <Link to="/roadmap" className="w-full lg:w-1/2 relative group block cursor-pointer">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-md opacity-20 group-hover:opacity-35 transition duration-500"></div>
                  <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-xl bg-card aspect-video">
                    <img 
                      src={careerHeroImg} 
                      alt="Career Roadmap Planning" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit border border-primary/20">Dynamic Learning Paths</span>
                  <h3 className="font-headline-md text-3xl font-extrabold text-foreground leading-tight">Interactive Career Roadmap Builder</h3>
                  <p className="font-body-lg text-on-surface-variant text-base leading-relaxed">
                    Map out your career route with granular accuracy. Our roadmap builder provides stage-by-stage directions, timeline expectations, checklist completions, and handpicked resources dynamically curated for your profile.
                  </p>
                  <ul className="space-y-3.5 text-sm font-semibold text-on-surface mb-2">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Personalized stage-by-stage checklists
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Curated links to leading industry learning platforms
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Real-time progression tracking & milestone rewards
                    </li>
                  </ul>
                  <Link 
                    to="/roadmap"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-label-sm text-xs font-bold uppercase tracking-wider w-fit hover:bg-primary/90 shadow-md shadow-primary/20 hover:gap-3 transition-all"
                  >
                    Open Roadmap Builder
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Highlight Row 2 - Interview Prep */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                <Link to="/interview-prep" className="w-full lg:w-1/2 relative group block cursor-pointer">
                  <div className="absolute -inset-2 bg-gradient-to-r from-secondary to-accent rounded-3xl blur-md opacity-20 group-hover:opacity-35 transition duration-500"></div>
                  <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-xl bg-card aspect-video">
                    <img 
                      src={careerInterviewImg} 
                      alt="Mock Interview Mentorship" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                  <span className="text-secondary text-xs font-bold uppercase tracking-widest bg-secondary/15 px-3 py-1 rounded-full w-fit border border-secondary/25">Mock Interview Simulator</span>
                  <h3 className="font-headline-md text-3xl font-extrabold text-foreground leading-tight">AI Mock Interviews & Coaching</h3>
                  <p className="font-body-lg text-on-surface-variant text-base leading-relaxed">
                    Practice makes perfect. Converse with our custom conversational mentor, designed to ask you branch-specific mock questions, diagnose your answers, and build interview confidence.
                  </p>
                  <ul className="space-y-3.5 text-sm font-semibold text-on-surface mb-2">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Field-specific technical & behavioral questions
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Real-time interactive diagnostic feedback
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      Save practice sessions and track confidence metrics
                    </li>
                  </ul>
                  <Link 
                    to="/interview-prep"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F5C45] text-white rounded-full font-label-sm text-xs font-bold uppercase tracking-wider w-fit hover:bg-[#1F5C45]/90 shadow-md shadow-primary/20 hover:gap-3 transition-all"
                  >
                    Start AI Mock Interview
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

            </div>
          </section>

          {/* Proven Results Section */}
          <section className="py-24 px-6 md:px-12 w-full bg-surface-container-low border-t border-border/40 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="col-span-1 lg:col-span-1 flex flex-col justify-center gap-2">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">Measurable impact</span>
                  <h2 className="font-headline-md text-3xl font-extrabold text-foreground">Proven Results</h2>
                  <div className="w-16 h-1.5 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <Link to="/assessment" className="flex flex-col p-8 rounded-3xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 block">
                    <span className="font-display-lg text-[48px] font-extrabold text-primary mb-1">95<span className="text-2xl font-bold">%</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-bold">Success Rate</span>
                  </Link>
                  <Link to="/courses" className="flex flex-col p-8 rounded-3xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-lg hover:-translate-y-1 block">
                    <span className="font-display-lg text-[48px] font-extrabold text-secondary mb-1">1M<span className="text-2xl font-bold">+</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-bold">Active Learners</span>
                  </Link>
                  <Link to="/roadmap" className="flex flex-col p-8 rounded-3xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1 block">
                    <span className="font-display-lg text-[48px] font-extrabold text-accent mb-1">500<span className="text-2xl font-bold">+</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-bold">Mapped Paths</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Premium CTA Banner */}
          <section className="py-24 px-6 md:px-12 w-full bg-background border-t border-border/40 flex justify-center">
            <div className="w-full max-w-5xl rounded-3xl bg-card border border-border/80 p-12 md:p-16 relative overflow-hidden flex flex-col items-center text-center gap-8 shadow-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-primary text-[36px] bg-primary/10 border border-primary/20 p-3 rounded-2xl shadow-sm">rocket_launch</span>
                <h2 className="font-display-md text-3xl md:text-4xl font-extrabold text-foreground tracking-tight max-w-2xl leading-tight">
                  Shape the Future of Your Professional Career
                </h2>
                <p className="font-body-lg text-on-surface-variant text-base max-w-lg leading-relaxed">
                  Join ambitious students and professionals mapping out their skill progression, optimizing their resumes, and landing top opportunities.
                </p>
              </div>

              <div className="relative z-10">
                <Link 
                  to="/signup" 
                  className="px-10 py-4.5 bg-primary text-white rounded-full font-label-sm text-xs font-bold uppercase tracking-wider hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(31,92,69,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-md"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-12 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center gap-6">
          <div className="flex gap-8">
            <a className="text-on-surface-variant hover:text-foreground font-label-sm text-xs uppercase tracking-wider font-semibold transition-colors" href="#">About</a>
            <a className="text-on-surface-variant hover:text-foreground font-label-sm text-xs uppercase tracking-wider font-semibold transition-colors" href="#">Terms</a>
            <a className="text-on-surface-variant hover:text-foreground font-label-sm text-xs uppercase tracking-wider font-semibold transition-colors" href="#">Privacy</a>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">share</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">public</span>
          </div>
          <div className="px-4 py-1.5 bg-surface-container-high rounded-full border border-border/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
            <span className="text-on-surface-variant font-label-sm text-xs font-semibold">Career Compass</span>
          </div>
          <div className="text-on-surface-variant/70 font-label-sm text-xs">© {new Date().getFullYear()} Career Compass. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
