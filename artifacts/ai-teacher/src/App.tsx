import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleAlert, CircleHelp, ClipboardCheck, Clock3, Compass, FileText, Globe2, GraduationCap, Lightbulb, Play, Sparkles, Target, TimerReset, Upload, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

type SetupValues = {
  topic: string;
  level: string;
  language: string;
  availableTime: string;
  learningGoal: string;
};

type LessonPlan = {
  title: string;
  summary: string;
  objectives: string[];
  concepts: string[];
  teachingOrder: { title: string; minutes: number; description: string }[];
  examples: string[];
  questions: string[];
  assessmentPlan: string;
};

type LessonResponse = {
  mode: 'gemini' | 'demo';
  plan: LessonPlan;
};

function Home() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('Marathi');
  const [availableTime, setAvailableTime] = useState('20 minutes');
  const [learningGoal, setLearningGoal] = useState('Understand the basics');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topicError, setTopicError] = useState('');
  const [fileError, setFileError] = useState('');
  const [started, setStarted] = useState(false);
  const [screen, setScreen] = useState<'setup' | 'loading' | 'plan' | 'error'>('setup');
  const [lessonResponse, setLessonResponse] = useState<LessonResponse | null>(null);
  const [lessonError, setLessonError] = useState('');
  const [submittedSetup, setSubmittedSetup] = useState<SetupValues | null>(null);
  const requestVersionRef = useRef(0);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestLessonPlan = async (values: SetupValues) => {
    const requestVersion = ++requestVersionRef.current;
    setScreen('loading');
    setLessonError('');
    setLessonResponse(null);
    setSubmittedSetup(values);

    try {
      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.plan) {
        throw new Error(payload?.error || payload?.message || 'We could not prepare your lesson plan right now.');
      }
      if (requestVersion !== requestVersionRef.current) return;
      setLessonResponse(payload as LessonResponse);
      setScreen('plan');
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      setLessonError(error instanceof Error ? error.message : 'We could not prepare your lesson plan right now.');
      setScreen('error');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic.trim()) {
      setTopicError('Tell us what you would like to learn first.');
      setStarted(false);
      topicInputRef.current?.focus();
      return;
    }
    setTopicError('');
    setStarted(true);
    void requestLessonPlan({
      topic: topic.trim(),
      level,
      language,
      availableTime,
      learningGoal: learningGoal.trim() || 'Understand the basics',
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setSelectedFile(null);
      setFileError('Please choose a PDF file.');
      event.target.value = '';
      return;
    }
    setFileError('');
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const backToSetup = () => {
    requestVersionRef.current += 1;
    setScreen('setup');
  };

  if (screen === 'loading') {
    return <LessonPlanLoading onBack={backToSetup} />;
  }

  if (screen === 'error') {
    return (
      <LessonPlanError
        message={lessonError}
        onBack={backToSetup}
        onRetry={submittedSetup ? () => void requestLessonPlan(submittedSetup) : undefined}
      />
    );
  }

  if (screen === 'plan' && lessonResponse) {
    return (
      <LessonPlanScreen
        response={lessonResponse}
        setup={{
          topic: topic.trim(),
          level,
          language,
          availableTime,
          learningGoal: learningGoal.trim() || 'Understand the basics',
        }}
        onBack={backToSetup}
      />
    );
  }

  return (
    <main className="setup-page relative min-h-[100dvh] overflow-hidden text-[hsl(var(--foreground))]">
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-14 lg:py-9">
        <header className="reveal-up flex items-center justify-between">
          <div className="flex items-center gap-3" data-testid="brand-ai-teacher">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-[4px_4px_0_hsl(var(--primary))]" aria-hidden="true">
              <Sparkles size={19} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-[15px] font-extrabold tracking-[0.18em]">AI TEACHER</p>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">Your Personal AI Educator</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.62)] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] shadow-sm sm:flex" data-testid="status-private">
            <span className="h-2 w-2 rounded-full bg-[hsl(168_44%_48%)]" aria-hidden="true" />
            A quiet place to learn
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1160px] flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(300px,0.82fr)_minmax(520px,1.18fr)] lg:gap-20 lg:py-16">
          <section className="reveal-up-delay relative max-w-[470px]" aria-labelledby="setup-title">
            <div className="floating-mark absolute -right-2 -top-12 hidden h-14 w-14 rotate-[-7deg] items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-[4px_4px_0_hsl(var(--secondary))] sm:flex" aria-hidden="true">
              <Lightbulb size={24} strokeWidth={1.8} />
            </div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--secondary-foreground))]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" aria-hidden="true" />
              Your next chapter starts here
            </p>
            <h1 id="setup-title" className="font-display max-w-[450px] text-[clamp(2.9rem,6vw,5.25rem)] font-extrabold leading-[0.98] tracking-[-0.065em]">
              Learn in a way that feels <span className="text-[hsl(var(--primary))]">like you.</span>
            </h1>
            <p className="mt-7 max-w-[390px] text-[16px] leading-7 text-[hsl(var(--muted-foreground))]">
              Give us a little direction. We’ll shape a focused learning session around your curiosity, your pace, and your day.
            </p>
            <div className="mt-10 grid max-w-[405px] grid-cols-3 gap-3 border-t border-[hsl(var(--border))] pt-5)">
              <div data-testid="benefit-focus"><BookOpen size={18} className="mb-3 text-[hsl(var(--primary))]" strokeWidth={1.8} /><p className="font-display text-sm font-bold">Focused</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">One topic, no noise.</p></div>
              <div data-testid="benefit-flexible"><Clock3 size={18} className="mb-3 text-[hsl(var(--primary))]" strokeWidth={1.8} /><p className="font-display text-sm font-bold">Flexible</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Your time, your pace.</p></div>
              <div data-testid="benefit-yours"><GraduationCap size={18} className="mb-3 text-[hsl(var(--primary))]" strokeWidth={1.8} /><p className="font-display text-sm font-bold">Yours</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Built for how you learn.</p></div>
            </div>
          </section>

          <section className="reveal-up-delay-2 w-full" aria-labelledby="form-title">
            <div className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.9)] p-5 shadow-[0_22px_65px_hsl(228_36%_18%_/_0.10)] backdrop-blur-sm sm:p-8 lg:p-10">
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Step 01 <span className="text-[hsl(var(--muted-foreground))]">/ 01</span></p>
                  <h2 id="form-title" className="font-display text-2xl font-extrabold tracking-[-0.04em] sm:text-[30px]">Set up your session</h2>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">A few choices help your teacher meet you where you are.</p>
                </div>
                <div className="hidden rounded-2xl bg-[hsl(var(--accent))] p-3 text-[hsl(var(--accent-foreground))] sm:block" aria-hidden="true"><CircleHelp size={22} strokeWidth={1.7} /></div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-7">
                  <div>
                    <label htmlFor="topic" className="mb-2.5 block text-sm font-bold">What do you want to learn? <span className="text-[hsl(var(--primary))]" aria-hidden="true">*</span></label>
                    <input ref={topicInputRef} id="topic" type="text" value={topic} onChange={(event) => { setTopic(event.target.value); if (event.target.value.trim()) setTopicError(''); }} placeholder="e.g. Newton's Laws" aria-invalid={Boolean(topicError)} aria-describedby={topicError ? 'topic-error' : undefined} data-testid="input-topic" className={`h-14 w-full rounded-2xl border bg-[hsl(var(--background)/.45)] px-4 text-[15px] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.72)] focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--ring)/.13)] ${topicError ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--input))]'}`} />
                    {topicError && <p id="topic-error" className="mt-2 text-sm font-medium text-[hsl(var(--destructive))]" data-testid="validation-topic">{topicError}</p>}
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-sm font-bold">Student level</legend>
                    <div className="grid grid-cols-3 gap-2.5">
                      {['Beginner', 'Intermediate', 'Advanced'].map((option) => (
                        <label key={option} className="option-card relative flex cursor-pointer items-center justify-center rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.35)] px-2 py-3.5 text-center text-sm font-semibold">
                          <input type="radio" name="student-level" value={option} checked={level === option} onChange={(event) => setLevel(event.target.value)} className="sr-only" data-testid={`radio-level-${option.toLowerCase()}`} />
                          <span className="radio-dot mr-2 h-3.5 w-3.5 shrink-0 rounded-full border border-[hsl(var(--muted-foreground)/.45)]" aria-hidden="true" />{option}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
                    <fieldset>
                      <legend className="mb-3 flex items-center gap-2 text-sm font-bold"><Globe2 size={16} className="text-[hsl(var(--primary))]" strokeWidth={1.8} />Language</legend>
                      <div className="flex flex-wrap gap-2">
                        {['English', 'Hindi', 'Marathi', 'Hinglish'].map((option) => (
                          <label key={option} className="option-card relative flex cursor-pointer items-center rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.35)] px-3 py-2.5 text-sm font-semibold">
                            <input type="radio" name="language" value={option} checked={language === option} onChange={(event) => setLanguage(event.target.value)} className="sr-only" data-testid={`radio-language-${option.toLowerCase()}`} />
                            <span className="radio-dot mr-2 h-3 w-3 shrink-0 rounded-full border border-[hsl(var(--muted-foreground)/.45)]" aria-hidden="true" />{option}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mb-3 flex items-center gap-2 text-sm font-bold"><Clock3 size={16} className="text-[hsl(var(--primary))]" strokeWidth={1.8} />Available time</legend>
                      <div className="flex flex-wrap gap-2">
                        {['5 minutes', '20 minutes', '60 minutes'].map((option) => (
                          <label key={option} className="option-card relative flex cursor-pointer items-center rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.35)] px-3 py-2.5 text-sm font-semibold">
                            <input type="radio" name="available-time" value={option} checked={availableTime === option} onChange={(event) => setAvailableTime(event.target.value)} className="sr-only" data-testid={`radio-time-${option.split(' ')[0]}`} />
                            <span className="radio-dot mr-2 h-3 w-3 shrink-0 rounded-full border border-[hsl(var(--muted-foreground)/.45)]" aria-hidden="true" />{option}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div>
                    <label htmlFor="learning-goal" className="mb-2.5 block text-sm font-bold">Learning goal</label>
                    <textarea id="learning-goal" value={learningGoal} onChange={(event) => setLearningGoal(event.target.value)} placeholder="e.g. Understand the basics" rows={2} data-testid="input-learning-goal" className="min-h-[76px] w-full resize-none rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.45)] px-4 py-3.5 text-[15px] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.72)] focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--ring)/.13)]" />
                  </div>

                  <div>
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <label htmlFor="study-material" className="text-sm font-bold">Study material <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></label>
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">PDF only</span>
                    </div>
                    <input ref={fileInputRef} id="study-material" type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="sr-only" data-testid="input-study-material" />
                    {!selectedFile ? (
                      <label htmlFor="study-material" className="lift-on-hover flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--input))] bg-[hsl(var(--background)/.28)] px-4 py-4 hover:border-[hsl(var(--primary)/.65)] hover:bg-[hsl(var(--primary)/.04)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Upload size={18} strokeWidth={1.8} /></span>
                        <span><span className="block text-sm font-bold">Add a PDF to guide your teacher</span><span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))]">Choose one file from your device</span></span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/.34)] px-4 py-3.5" data-testid="selected-pdf">
                        <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--card))] text-[hsl(var(--primary))]"><FileText size={19} strokeWidth={1.8} /></span><span className="min-w-0"><span className="block truncate text-sm font-bold">{selectedFile.name}</span><span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))]">Ready to use for this session</span></span></div>
                        <button type="button" onClick={removeFile} aria-label="Remove selected PDF" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--foreground))]" data-testid="button-remove-pdf"><X size={17} /></button>
                      </div>
                    )}
                    {fileError && <p className="mt-2 text-sm font-medium text-[hsl(var(--destructive))]" data-testid="validation-file">{fileError}</p>}
                  </div>
                </div>

                <button type="submit" className="lift-on-hover mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[hsl(var(--primary))] px-5 font-display text-sm font-extrabold tracking-[0.1em] text-[hsl(var(--primary-foreground))] shadow-[0_7px_0_hsl(11_73%_46%)] hover:shadow-[0_9px_0_hsl(11_73%_46%)] active:translate-y-1 active:shadow-[0_3px_0_hsl(11_73%_46%)]" data-testid="button-start-learning">START LEARNING <ArrowRight size={18} strokeWidth={2.5} /></button>
                {started && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/.35)] px-4 py-3.5 text-sm text-[hsl(var(--secondary-foreground))]" role="status" data-testid="status-learning-ready"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(168_44%_48%)] text-[hsl(var(--card))]"><Check size={13} strokeWidth={3} /></span><span><strong className="font-bold">You’re all set.</strong> Your {availableTime.toLowerCase()} session on {topic.trim()} is ready to begin.</span></div>}
              </form>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[hsl(var(--muted-foreground))]"><Sparkles size={13} className="text-[hsl(var(--primary))]" aria-hidden="true" /> No pressure. You can change these choices anytime.</p>
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-[hsl(var(--border)/.72)] pt-4 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
          <span data-testid="text-footer-note">Made for curious minds.</span>
          <span className="hidden sm:inline" data-testid="text-footer-version">A thoughtful start to every session</span>
        </footer>
      </div>
    </main>
  );
}

function LessonBrand() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-ai-teacher-lesson">
      <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-[4px_4px_0_hsl(var(--primary))]" aria-hidden="true">
        <Sparkles size={19} strokeWidth={2.5} />
      </div>
      <div>
        <p className="font-display text-[15px] font-extrabold tracking-[0.18em]">AI TEACHER</p>
        <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">Your Personal AI Educator</p>
      </div>
    </div>
  );
}

function ContextItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="lesson-context-item" data-testid={`context-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="text-[hsl(var(--primary))]" aria-hidden="true">{icon}</span>
      <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{label}</span><span className="mt-0.5 block truncate text-sm font-bold">{value}</span></span>
    </div>
  );
}

function LessonPlanScreen({ response, setup, onBack }: { response: LessonResponse; setup: SetupValues; onBack: () => void }) {
  const [teachingStarted, setTeachingStarted] = useState(false);
  const { plan } = response;
  const totalMinutes = plan.teachingOrder.reduce((total, step) => total + Number(step.minutes || 0), 0);

  return (
    <main className="lesson-page min-h-[100dvh] text-[hsl(var(--foreground))]">
      <div className="lesson-orbit lesson-orbit-one pointer-events-none" aria-hidden="true" />
      <div className="lesson-orbit lesson-orbit-two pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-6 sm:px-8 lg:px-12 lg:py-9">
        <header className="reveal-up flex items-center justify-between gap-5">
          <LessonBrand />
          <button type="button" onClick={onBack} className="lesson-back-button" data-testid="button-back-setup">
            <ArrowLeft size={16} strokeWidth={2.3} /> <span className="hidden sm:inline">BACK TO SETUP</span><span className="sm:hidden">BACK</span>
          </button>
        </header>

        <section className="reveal-up-delay lesson-hero" aria-labelledby="lesson-plan-title">
          <div className="flex flex-wrap items-center gap-2">
            <p className="lesson-kicker"><span className="lesson-kicker-dot" aria-hidden="true" /> Step 02 <span>/ Your plan</span></p>
            {response.mode === 'demo' && <span className="demo-badge" data-testid="status-demo-mode">DEMO MODE</span>}
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_310px] lg:items-end lg:gap-16">
            <div>
              <h1 id="lesson-plan-title" className="font-display max-w-[780px] text-[clamp(2.6rem,6vw,5.3rem)] font-extrabold leading-[0.98] tracking-[-0.07em]" data-testid="text-plan-title">{plan.title}</h1>
              <p className="mt-6 max-w-[720px] text-[17px] leading-8 text-[hsl(var(--muted-foreground))]" data-testid="text-plan-summary">{plan.summary}</p>
            </div>
            <div className="lesson-ready-card">
              <div className="flex items-center justify-between gap-3"><span className="lesson-ready-icon"><Compass size={18} strokeWidth={1.8} /></span><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--primary))]">A clear place to begin</span></div>
              <p className="mt-4 font-display text-xl font-extrabold leading-tight">Your path is ready.</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{totalMinutes || setup.availableTime.replace(/\D/g, '')} minutes, shaped around your goal.</p>
            </div>
          </div>
        </section>

        <section className="reveal-up-delay-2 lesson-context-grid" aria-label="Your session details">
          <ContextItem label="Topic" value={setup.topic} icon={<BookOpen size={16} />} />
          <ContextItem label="Level" value={setup.level} icon={<GraduationCap size={16} />} />
          <ContextItem label="Language" value={setup.language} icon={<Globe2 size={16} />} />
          <ContextItem label="Time" value={setup.availableTime} icon={<Clock3 size={16} />} />
          <ContextItem label="Goal" value={setup.learningGoal} icon={<Target size={16} />} />
        </section>

        <div className="lesson-layout">
          <div className="space-y-6">
            <section className="lesson-card lesson-objectives-card" aria-labelledby="objectives-heading">
              <div className="lesson-section-heading"><span className="lesson-number">01</span><div><p className="lesson-section-eyebrow">By the end</p><h2 id="objectives-heading">Learning objectives</h2></div></div>
              <ul className="mt-7 space-y-4" data-testid="list-objectives">
                {plan.objectives.map((objective, index) => <li key={`${objective}-${index}`} className="lesson-check-row" data-testid={`objective-${index}`}><span className="lesson-check"><Check size={14} strokeWidth={3} /></span><span>{objective}</span></li>)}
              </ul>
            </section>

            <section className="lesson-card" aria-labelledby="concepts-heading">
              <div className="lesson-section-heading"><span className="lesson-number lesson-number-teal">02</span><div><p className="lesson-section-eyebrow">The building blocks</p><h2 id="concepts-heading">Core concepts</h2></div></div>
              <div className="mt-7 flex flex-wrap gap-2.5" data-testid="list-concepts">
                {plan.concepts.map((concept, index) => <span key={`${concept}-${index}`} className="concept-pill" data-testid={`concept-${index}`}>{concept}</span>)}
              </div>
            </section>

            <section className="lesson-card" aria-labelledby="examples-heading">
              <div className="lesson-section-heading"><span className="lesson-number lesson-number-gold">03</span><div><p className="lesson-section-eyebrow">Make it concrete</p><h2 id="examples-heading">Examples to keep nearby</h2></div></div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2" data-testid="list-examples">
                {plan.examples.map((example, index) => <div key={`${example}-${index}`} className="lesson-example" data-testid={`example-${index}`}><span className="example-mark" aria-hidden="true"><Lightbulb size={16} /></span><span>{example}</span></div>)}
              </div>
            </section>

            <section className="lesson-card" aria-labelledby="questions-heading">
              <div className="lesson-section-heading"><span className="lesson-number lesson-number-coral">04</span><div><p className="lesson-section-eyebrow">Try it yourself</p><h2 id="questions-heading">Practice questions</h2></div></div>
              <ol className="mt-7 space-y-3" data-testid="list-questions">
                {plan.questions.map((question, index) => <li key={`${question}-${index}`} className="lesson-question" data-testid={`question-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{question}</p></li>)}
              </ol>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="lesson-card lesson-order-card" aria-labelledby="order-heading">
              <div className="lesson-section-heading"><span className="lesson-number lesson-number-navy">05</span><div><p className="lesson-section-eyebrow">Your route through it</p><h2 id="order-heading">Teaching order</h2></div></div>
              <div className="lesson-timeline mt-8" data-testid="list-teaching-order">
                {plan.teachingOrder.map((step, index) => <div className="lesson-timeline-step" key={`${step.title}-${index}`} data-testid={`teaching-step-${index}`}><div className="lesson-step-marker">{index + 1}</div><div className="min-w-0 flex-1 pb-7"><div className="flex items-start justify-between gap-3"><h3>{step.title}</h3><span className="step-minutes">{step.minutes} min</span></div><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{step.description}</p></div></div>)}
              </div>
              <div className="lesson-total"><TimerReset size={16} /><span>Total focus time</span><strong>{totalMinutes} min</strong></div>
            </section>

            <section className="lesson-assessment-card" aria-labelledby="assessment-heading">
              <div className="flex items-start gap-3"><span className="assessment-icon"><ClipboardCheck size={19} /></span><div><p className="lesson-section-eyebrow">Finish with confidence</p><h2 id="assessment-heading">How you’ll check in</h2></div></div>
              <p className="mt-5 text-sm leading-7 text-[hsl(var(--foreground)/.82)]" data-testid="text-assessment-plan">{plan.assessmentPlan}</p>
            </section>
          </aside>
        </div>

        <section className="lesson-start-panel" aria-live="polite">
          {!teachingStarted ? (
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div><p className="lesson-section-eyebrow">When you’re ready</p><h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em]">Take the first small step.</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">No pressure — this is a guided demo of your lesson path.</p></div>
              <button type="button" onClick={() => setTeachingStarted(true)} className="lesson-start-button" data-testid="button-start-teaching"><Play size={16} fill="currentColor" /> START TEACHING</button>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3"><span className="lesson-success-icon"><Check size={16} strokeWidth={3} /></span><div><p className="lesson-section-eyebrow">Demo lesson started</p><h2 className="mt-1 font-display text-xl font-extrabold">Begin with “{plan.teachingOrder[0]?.title || 'the first concept'}”.</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Read the outline above, then use the practice questions to make it yours.</p></div></div>
              <button type="button" onClick={() => setTeachingStarted(false)} className="lesson-secondary-button" data-testid="button-pause-teaching">VIEW PLAN AGAIN</button>
            </div>
          )}
        </section>

        <footer className="mt-12 flex items-center justify-between border-t border-[hsl(var(--border)/.72)] pt-4 text-[11px] font-medium tracking-wide text-[hsl(var(--muted-foreground))]">
          <span>Made for curious minds.</span><span className="hidden sm:inline">A thoughtful start to every session</span>
        </footer>
      </div>
    </main>
  );
}

function LessonPlanLoading({ onBack }: { onBack: () => void }) {
  return (
    <main className="lesson-page min-h-[100dvh] text-[hsl(var(--foreground))]">
      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-6 sm:px-8 lg:px-12 lg:py-9">
        <header className="flex items-center justify-between gap-5"><LessonBrand /><button type="button" onClick={onBack} className="lesson-back-button" data-testid="button-back-loading"><ArrowLeft size={16} strokeWidth={2.3} /> <span className="hidden sm:inline">BACK TO SETUP</span><span className="sm:hidden">BACK</span></button></header>
        <section className="lesson-loading-shell" aria-live="polite" aria-busy="true" data-testid="status-plan-loading">
          <div className="lesson-loading-icon"><Sparkles size={24} /></div>
          <p className="lesson-kicker"><span className="lesson-kicker-dot" aria-hidden="true" /> Step 02 / Preparing your plan</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,6vw,4.8rem)] font-extrabold leading-none tracking-[-0.07em]">Giving your curiosity<br /><span className="text-[hsl(var(--primary))]">a clear next step.</span></h1>
          <p className="mt-6 max-w-[500px] text-base leading-7 text-[hsl(var(--muted-foreground))]">Your teacher is arranging the ideas, examples, and practice into a path that fits your session.</p>
          <div className="mt-10 space-y-3"><div className="lesson-skeleton lesson-skeleton-wide" /><div className="lesson-skeleton lesson-skeleton-medium" /><div className="lesson-skeleton lesson-skeleton-short" /></div>
        </section>
      </div>
    </main>
  );
}

function LessonPlanError({ message, onBack, onRetry }: { message: string; onBack: () => void; onRetry?: () => void }) {
  return (
    <main className="lesson-page min-h-[100dvh] text-[hsl(var(--foreground))]">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1240px] flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-9">
        <header className="flex items-center justify-between gap-5"><LessonBrand /><button type="button" onClick={onBack} className="lesson-back-button" data-testid="button-back-error"><ArrowLeft size={16} strokeWidth={2.3} /> <span className="hidden sm:inline">BACK TO SETUP</span><span className="sm:hidden">BACK</span></button></header>
        <section className="lesson-error-shell my-auto" role="alert" data-testid="status-plan-error">
          <div className="lesson-error-icon"><CircleAlert size={26} /></div>
          <p className="lesson-kicker"><span className="lesson-kicker-dot" aria-hidden="true" /> One small pause</p>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.06em] sm:text-6xl">Your plan needs<br /><span className="text-[hsl(var(--primary))]">another moment.</span></h1>
          <p className="mt-6 max-w-[510px] text-base leading-7 text-[hsl(var(--muted-foreground))]">{message}</p>
          <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={onBack} className="lesson-secondary-button" data-testid="button-return-setup">RETURN TO SETUP</button>{onRetry && <button type="button" onClick={onRetry} className="lesson-start-button" data-testid="button-retry-plan"><ArrowRight size={16} /> TRY AGAIN</button>}</div>
        </section>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
