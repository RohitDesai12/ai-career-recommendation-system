import { Navbar } from "../components/navbar";
import { Link } from "react-router";
import { motion } from "motion/react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-background relative overflow-hidden flex flex-col justify-between">
      <Navbar />

      <main className="w-full pt-16 flex-grow">
        <div className="flex flex-col w-full relative overflow-hidden">
          {/* Top Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none"></div>

          {/* Hero Section */}
          <section className="relative w-full pt-24 pb-32 px-6 md:px-12 flex flex-col items-center justify-center text-center min-h-[716px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            
            {/* Tag Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container-highest/50 backdrop-blur-md rounded-full border border-outline-variant/30 mb-8 shadow-sm"
            >
              <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">auto_awesome</span>
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">AI-Powered Guidance</span>
            </motion.div>

            {/* Hero Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display-lg text-4xl md:text-[56px] leading-[1.1] font-bold text-on-background max-w-4xl mb-6 relative tracking-tight"
            >
              <span className="relative z-10">Discover Your Perfect Career</span>
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative z-10">
                with Precision AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-body-lg text-base md:text-[18px] text-on-surface-variant max-w-2xl mb-10 leading-relaxed"
            >
              Navigate the complexities of the modern job market. Our intelligent platform analyzes your unique skills, passions, and market trends to chart a personalized path to professional fulfillment.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 items-center z-10"
            >
              <Link 
                to="/assessment" 
                className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-label-sm text-xs font-semibold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300"
              >
                Get Started Now
              </Link>
              <a 
                href="#features" 
                className="px-8 py-3.5 bg-surface-container/50 backdrop-blur-sm text-on-surface border border-outline-variant/50 rounded-full font-label-sm text-xs font-semibold uppercase tracking-wider hover:bg-surface-container-highest transition-all duration-300"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Mockup Dashboard Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-20 w-full max-w-5xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative w-full h-[300px] md:h-[450px] bg-surface-container/80 backdrop-blur-xl rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden flex items-center justify-center bg-cover bg-center" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGGOpjGwL-ZHTkaEV87NIouOaIAomkFvjHZ3GuWA6QF8oBWX5AacUxLLLKDa0jLZQqs3OdSeL80NjCIVuDzmsk74341tSEbPVn5i6t7C5jnGraPvLD8TycmcF0_BmAeyA8zWw8MZyR1CEfwrKIYXWC-EKkwBOU-eskRw1mqXG1ZFMXqWLOERT81qVpyqFdxA85EaTqhZxfeHI7RCdoeKp7j2oNxNE-2PLywmS3cs-GVtToSYfbWNYs')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              </div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="py-24 px-6 md:px-12 w-full relative" id="features">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="max-w-2xl">
                  <h2 className="font-headline-md text-3xl font-bold text-on-background mb-4">Intelligent Tools for Ambitious Professionals</h2>
                  <p className="font-body-md text-on-surface-variant">Our suite of AI-driven features is designed to provide actionable insights, taking the guesswork out of your career trajectory.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl p-8 border border-outline-variant/20 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group shadow-md flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[28px]">description</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors">AI Resume Analysis</h3>
                  <p className="font-body-md text-on-surface-variant flex-grow">Upload your resume and let our AI dissect it. We identify strengths, highlight missing keywords, and suggest optimizations tailored to target roles.</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl p-8 border border-outline-variant/20 hover:border-secondary/50 hover:-translate-y-1 transition-all duration-300 group shadow-md flex flex-col h-full relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors"></div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors relative z-10">
                    <span className="material-symbols-outlined text-secondary text-[28px]">join_inner</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-semibold text-on-surface mb-3 group-hover:text-secondary transition-colors relative z-10">Predictive Job Matching</h3>
                  <p className="font-body-md text-on-surface-variant flex-grow relative z-10">Stop searching blindly. Our algorithms predict which roles and companies align best with your evolving skill set and cultural preferences.</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl p-8 border border-outline-variant/20 hover:border-tertiary/50 hover:-translate-y-1 transition-all duration-300 group shadow-md flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">troubleshoot</span>
                  </div>
                  <h3 className="font-headline-md text-xl font-semibold text-on-surface mb-3 group-hover:text-tertiary transition-colors">Skill Gap Identification</h3>
                  <p className="font-body-md text-on-surface-variant flex-grow">Visualize the exact skills standing between you and your dream job. Get personalized learning paths and course recommendations to bridge the gap.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Proven Results Section */}
          <section className="py-24 px-6 md:px-12 w-full bg-surface-container-lowest relative">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1 flex flex-col justify-center">
                  <h2 className="font-headline-md text-2xl font-semibold text-on-background mb-2">Proven Results</h2>
                  <div className="w-12 h-1 bg-primary rounded-full"></div>
                </div>
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="flex flex-col p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/10 shadow-sm">
                    <span className="font-display-lg text-[40px] font-bold text-primary mb-1">95<span className="text-2xl">%</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Success Rate</span>
                  </div>
                  <div className="flex flex-col p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/10 shadow-sm">
                    <span className="font-display-lg text-[40px] font-bold text-secondary mb-1">1M<span className="text-2xl">+</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Active Users</span>
                  </div>
                  <div className="flex flex-col p-6 rounded-2xl bg-surface-container/50 border border-outline-variant/10 shadow-sm">
                    <span className="font-display-lg text-[40px] font-bold text-tertiary mb-1">500<span className="text-2xl">+</span></span>
                    <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Mapped Paths</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-12 mt-12 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center gap-6">
          <div className="flex gap-8">
            <a className="text-on-surface-variant hover:text-on-surface font-label-sm text-xs uppercase tracking-wider" href="#">About</a>
            <a className="text-on-surface-variant hover:text-on-surface font-label-sm text-xs uppercase tracking-wider" href="#">Terms</a>
            <a className="text-on-surface-variant hover:text-on-surface font-label-sm text-xs uppercase tracking-wider" href="#">Privacy</a>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">share</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">public</span>
          </div>
          <div className="px-4 py-1.5 bg-surface-container-highest rounded-full border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
            <span className="text-on-surface-variant font-label-sm text-xs">Made with AI</span>
          </div>
          <div className="text-on-surface-variant/50 font-label-sm text-xs">© {new Date().getFullYear()} Career Compass. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
