"use client";

import { useState } from "react";

export default function Home() {
  // Skeleton state:
  // - "idle": Prompting user for upload
  // - "scanning": Showing breathing loader animation
  // - "dashboard": Showing scaffold dashboard view
  const [step, setStep] = useState<"idle" | "scanning" | "dashboard">("idle");

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Introduction Hero Section */}
      <section className="text-center py-6 md:py-10 max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl tracking-tight leading-tight">
          Translate stress into clear steps.
        </h1>
        <p className="text-lg text-ink/85 leading-relaxed font-sans">
          Upload any legal notice, bill, or confusing document. We'll simplify the jargon, highlight critical deadlines, and help you write a response.
        </p>
      </section>

      {/* Main Action Container */}
      <section className="card-calm p-8 md:p-12 transition-colors duration-300">
        {step === "idle" && (
          <div 
            onClick={() => setStep("scanning")}
            className="flex flex-col items-center justify-center border-2 border-dashed border-mist rounded-xl p-10 hover:border-calm-sage hover:bg-calm-sage/5 transition-all duration-300 cursor-pointer"
          >
            <svg 
              className="w-12 h-12 text-calm-sage mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="font-sans text-lg font-medium text-deep-pine dark:text-calm-sage">
              Drop your document here
            </p>
            <p className="font-sans text-sm text-ink/75 mt-1">
              or click to browse from files
            </p>
          </div>
        )}

        {step === "scanning" && (
          <div className="flex flex-col items-center justify-center py-10 gap-6">
            {/* The 4s Breathing Loader: Brand signature moment */}
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Outer pulsing ring */}
              <div className="absolute w-full h-full rounded-full bg-calm-sage opacity-25 animate-pulse-slow" />
              {/* Inner pulsing disc */}
              <div className="w-16 h-16 rounded-full bg-calm-sage flex items-center justify-center text-deep-pine">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
            
            <div className="text-center flex flex-col gap-2 max-w-sm mx-auto">
              <h3 className="text-xl font-medium text-deep-pine dark:text-calm-sage">
                Reading this carefully so you don't have to…
              </h3>
              <p className="text-sm text-ink/80">
                Simplifying legal terms and locating key deadlines.
              </p>
            </div>
            
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setStep("idle")} 
                className="px-4 py-2 border border-mist rounded-full hover:bg-calm-sage/10 text-sm transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => setStep("dashboard")} 
                className="btn-primary"
              >
                Proceed to Dashboard (Demo)
              </button>
            </div>
          </div>
        )}

        {step === "dashboard" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-mist pb-4">
              <h2 className="text-2xl text-deep-pine dark:text-calm-sage">
                Your Calm Dashboard
              </h2>
              <button 
                onClick={() => setStep("idle")} 
                className="text-sm text-calm-sage hover:underline"
              >
                Upload New Document
              </button>
            </div>
            <p className="text-ink/80 leading-relaxed">
              Document translation summary, step-by-step checklist, jargon decoder, response assistant, and emergency resources will assemble here in Milestones 2-4.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
