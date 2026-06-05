import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Activity, Moon, BookOpen, Brain, Clock, Monitor, PenTool } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    stress: 5,
    motivation: 5,
    energy: 5,
    sleepQuality: 5,
    academicSatisfaction: 5,
    // Step 2
    gpa: '',
    attendance: '',
    totalAssignments: '',
    backlog: '',
    // Step 3
    sleepHours: '',
    studyHours: '',
    exerciseDuration: '',
    screenTime: '',
    // Step 4
    journalEntry: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Assessment completed:', formData);
    // Simulate submission delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  // Helper component for 1-10 scale questions
  const RangeSlider = ({ name, label, icon: Icon, description, leftLabel, rightLabel }) => (
    <div className="mb-8 p-6 bg-background rounded-xl border border-border">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <label className="text-lg font-bold text-foreground block">{label}</label>
          <p className="text-sm text-foreground-muted mt-1">{description}</p>
        </div>
        <div className="ml-auto bg-primary text-white font-bold h-10 w-10 rounded-lg flex items-center justify-center text-lg shrink-0">
          {formData[name]}
        </div>
      </div>
      
      <div className="px-2 mt-6">
        <input 
          type="range" 
          name={name}
          min="1" 
          max="10" 
          value={formData[name]} 
          onChange={handleSliderChange}
          className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary" 
        />
        <div className="flex justify-between text-xs font-medium text-foreground-muted mt-3">
          <span>1 - {leftLabel}</span>
          <span>10 - {rightLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Weekly Burnout Assessment</h1>
          <p className="text-foreground-muted text-lg">Help us understand your current academic and emotional state.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-foreground-muted mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-border rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-card p-6 md:p-10 border border-border">
          
          {/* Step 1: Psychological & Core Indicators */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Psychological Wellness</h2>
              
              <RangeSlider 
                name="stress" 
                label="Stress Level" 
                icon={Brain}
                description="Rate your overall stress level over the past week."
                leftLabel="Very Calm"
                rightLabel="Extremely Stressed"
              />

              <RangeSlider 
                name="motivation" 
                label="Study Motivation" 
                icon={BookOpen}
                description="How motivated are you to study and attend classes?"
                leftLabel="Zero Motivation"
                rightLabel="Highly Motivated"
              />

              <RangeSlider 
                name="energy" 
                label="Daily Energy" 
                icon={Activity}
                description="How energetic and active do you feel on an average day?"
                leftLabel="Exhausted"
                rightLabel="Full of Energy"
              />

              <RangeSlider 
                name="sleepQuality" 
                label="Sleep Quality" 
                icon={Moon}
                description="Rate the overall quality of your sleep last night."
                leftLabel="Terrible"
                rightLabel="Excellent"
              />

              <RangeSlider 
                name="academicSatisfaction" 
                label="Academic Satisfaction" 
                icon={BookOpen}
                description="How satisfied are you with your academic progress right now?"
                leftLabel="Unsatisfied"
                rightLabel="Very Satisfied"
              />

              <div className="mt-8 flex justify-end">
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-primary text-white rounded-md h-12 px-8 font-medium transition-shadow hover:shadow-hover flex items-center gap-2 cursor-pointer"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Academic Metrics */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Academic Data</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Current GPA / Percentage</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 3.8 or 85"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Attendance Percentage (%)</label>
                  <input 
                    type="number" 
                    name="attendance"
                    value={formData.attendance}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 85"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Total Assignments Given</label>
                  <input 
                    type="number" 
                    name="totalAssignments"
                    value={formData.totalAssignments}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Total assignments assigned"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Pending Assignments (Backlog)</label>
                  <input 
                    type="number" 
                    name="backlog"
                    value={formData.backlog}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="How many are incomplete?"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="bg-transparent border border-border text-foreground rounded-md h-12 px-8 font-medium transition-colors hover:bg-background cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-primary text-white rounded-md h-12 px-8 font-medium transition-shadow hover:shadow-hover flex items-center gap-2 cursor-pointer"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle Tracking */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Lifestyle Tracking</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Average Sleep Hours / Night</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Moon className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <input 
                      type="number" 
                      step="0.5"
                      name="sleepHours"
                      value={formData.sleepHours}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 7.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Self-Study Hours / Day</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <input 
                      type="number" 
                      step="0.5"
                      name="studyHours"
                      value={formData.studyHours}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Exercise Duration (Mins / Day)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Activity className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <input 
                      type="number" 
                      name="exerciseDuration"
                      value={formData.exerciseDuration}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">Screen Time (Hours / Day)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Monitor className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <input 
                      type="number" 
                      step="0.5"
                      name="screenTime"
                      value={formData.screenTime}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 6.5"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="bg-transparent border border-border text-foreground rounded-md h-12 px-8 font-medium transition-colors hover:bg-background cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-primary text-white rounded-md h-12 px-8 font-medium transition-shadow hover:shadow-hover flex items-center gap-2 cursor-pointer"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Mood Journal */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Mood Journal</h2>
              
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <PenTool className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <label className="text-lg font-bold text-foreground block">How are you feeling this week?</label>
                    <p className="text-sm text-foreground-muted mt-1">Write a short journal entry about your academic stress, exhaustion, or victories. We use sentiment analysis to track your mood.</p>
                  </div>
                </div>
                
                <textarea 
                  name="journalEntry"
                  value={formData.journalEntry}
                  onChange={handleChange}
                  rows="5"
                  className="w-full p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mt-2"
                  placeholder="e.g. I feel exhausted and overwhelmed by assignments right now..."
                  required
                ></textarea>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="bg-transparent border border-border text-foreground rounded-md h-12 px-8 font-medium transition-colors hover:bg-background cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="bg-success text-white rounded-md h-12 px-8 font-medium transition-shadow hover:shadow-hover flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-5 w-5" />
                  Submit Assessment
                </button>
              </div>
            </div>
          )}

        </form>
      </main>
    </div>
  );
};

export default Assessment;
