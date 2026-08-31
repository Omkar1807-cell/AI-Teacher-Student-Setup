import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Check, CircleHelp, Clock3, FileText, Globe2, GraduationCap, Lightbulb, Sparkles, Upload, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

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
  const topicInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
