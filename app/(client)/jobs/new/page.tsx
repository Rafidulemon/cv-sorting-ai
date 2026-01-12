'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  FileUp,
  Linkedin,
  LinkIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  fallbackCurrencyOptions,
  fallbackEmploymentTypeOptions,
  fallbackExperienceOptions,
  jobPromptFields,
  jobPromptRequiredKeys,
  jobPromptSchemas,
  jobPromptSkippableKeys,
  type JobPromptFieldKey,
} from '@/app/constants/jobCreation';

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.replace(/^[•-]\s*/, '').trim())
    .filter(Boolean);

const steps = [
  {
    id: 1,
    key: 'description' as const,
    title: 'Craft your role',
    description: 'Use AI or upload an existing description, then add details in step 6.',
  },
  { id: 2, key: 'upload' as const, title: 'Upload candidates', description: 'Add CVs and fine tune how many to shortlist.' },
];

export default function NewJobPage() {
  const [currentSection, setCurrentSection] = useState<'description' | 'upload'>('description');
  const [mode, setMode] = useState<'ai' | 'upload'>('ai');
  const [aiStep, setAiStep] = useState(0);
  const [aiForm, setAiForm] = useState<Record<JobPromptFieldKey, string>>({
    title: '',
    responsibilities: '',
    skills: '',
    experienceLevel: 'Mid-level',
    companyCulture: '',
  });
  const [generatedJD, setGeneratedJD] = useState('');
  const [uploadedJdFileName, setUploadedJdFileName] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [topCandidates, setTopCandidates] = useState(25);

  const [employmentType, setEmploymentType] = useState<string>('');
  const [locationsInput, setLocationsInput] = useState('');
  const [openings, setOpenings] = useState(1);
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState<string>('BDT');
  const [experienceOptions, setExperienceOptions] = useState<string[]>([...fallbackExperienceOptions]);
  const [employmentTypeOptions, setEmploymentTypeOptions] = useState<string[]>([...fallbackEmploymentTypeOptions]);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([...fallbackCurrencyOptions]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [draftJobId, setDraftJobId] = useState<string | null>(null);
  const [draftError, setDraftError] = useState('');

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<JobPromptFieldKey, string>>({
    title: '',
    responsibilities: '',
    skills: '',
    experienceLevel: '',
    companyCulture: '',
  });
  const totalPromptSteps = jobPromptFields.length + 1;
  const isDetailsStep = aiStep === jobPromptFields.length;
  const currentField = isDetailsStep ? null : jobPromptFields[aiStep];
  const currentFieldType = currentField && 'type' in currentField ? currentField.type : 'text';
  const isCurrentFieldValid = useMemo(() => {
    if (!currentField) return true;
    return jobPromptSchemas[currentField.key].safeParse(aiForm[currentField.key]).success;
  }, [aiForm, currentField?.key]);
  const canSkipCurrent = Boolean(currentField && jobPromptSkippableKeys.includes(currentField.key));

  const requiredFieldsValid = useMemo(
    () => jobPromptRequiredKeys.every((key) => jobPromptSchemas[key].safeParse(aiForm[key]).success),
    [aiForm]
  );

  const costUsage = useMemo(() => {
    const base = uploadedFiles.length || 47;
    return { consumed: base, total: 500 };
  }, [uploadedFiles.length]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('/api/jobs/options');
        const payload = await response.json();
        const experiences = Array.isArray(payload?.experienceLevels) && payload.experienceLevels.length
          ? payload.experienceLevels
          : [...fallbackExperienceOptions];
        const employment = Array.isArray(payload?.employmentTypes) && payload.employmentTypes.length
          ? payload.employmentTypes
          : [...fallbackEmploymentTypeOptions];
        const currencies = Array.isArray(payload?.currencies) && payload.currencies.length
          ? payload.currencies
          : [...fallbackCurrencyOptions];

        setExperienceOptions(experiences);
        setEmploymentTypeOptions(employment);
        setCurrencyOptions(currencies);
        setCurrency((prev) => (currencies.includes(prev) ? prev : currencies[0] ?? prev));
      } catch (error) {
        console.warn('Failed to load options, using defaults', error);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!experienceOptions.length) return;
    if (!experienceOptions.includes(aiForm.experienceLevel)) {
      setAiForm((prev) => ({ ...prev, experienceLevel: experienceOptions[0] }));
    }
  }, [aiForm.experienceLevel, experienceOptions]);

  const previewText = useMemo(() => {
    if (mode === 'ai') {
      return generatedJD.trim();
    }

    if (uploadedJdFileName) {
      const linkPart = driveLink.trim().length ? ` (link: ${driveLink.trim()})` : '';
      return `Uploaded description: ${uploadedJdFileName}${linkPart}`;
    }

    return '';
  }, [driveLink, generatedJD, mode, uploadedJdFileName]);

  const titleReady = jobPromptSchemas.title.safeParse(aiForm.title).success;

  const canProceedToUpload =
    currentSection === 'description' &&
    titleReady &&
    (mode === 'ai' ? Boolean(generatedJD) : Boolean(uploadedJdFileName));

  const canStartSorting = useMemo(() => {
    if (!titleReady) return false;
    if (mode === 'upload') return Boolean(uploadedJdFileName);
    return requiredFieldsValid;
  }, [mode, requiredFieldsValid, titleReady, uploadedJdFileName]);

  const canSaveDraft = useMemo(() => {
    if (!titleReady) return false;
    if (mode === 'upload') return Boolean(uploadedJdFileName);
    return requiredFieldsValid;
  }, [mode, requiredFieldsValid, titleReady, uploadedJdFileName]);

  const validateField = (key: JobPromptFieldKey, value: string) => {
    const result = jobPromptSchemas[key].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [key]: result.success ? '' : result.error.issues[0]?.message || 'Invalid value',
    }));
    return result.success;
  };

  const handleAiChange = (value: string) => {
    if (!currentField) return;
    setAiForm((prev) => ({ ...prev, [currentField.key]: value }));
    validateField(currentField.key, value);
  };

  const handleNext = () => {
    if (!currentField) {
      setAiStep((prev) => Math.min(totalPromptSteps - 1, prev + 1));
      return;
    }

    const isValid = validateField(currentField.key, aiForm[currentField.key]);
    if (!isValid) return;
    setAiStep((prev) => Math.min(totalPromptSteps - 1, prev + 1));
  };

  const handleSkip = () => {
    if (!currentField || !canSkipCurrent) return;
    setErrors((prev) => ({ ...prev, [currentField.key]: '' }));
    setAiStep((prev) => Math.min(totalPromptSteps - 1, prev + 1));
  };

  const goToRoleDetailsStep = () => {
    setCurrentSection('description');
    setAiStep(totalPromptSteps - 1);
  };

  const buildAiTemplate = () => {
    return [
      `${aiForm.title || 'Role TBD'}`,
      '',
      'Key responsibilities:',
      ...splitList(aiForm.responsibilities).map((item) => `- ${item}`),
      '',
      'Required skills:',
      ...splitList(aiForm.skills).map((item) => `- ${item}`),
      '',
      `Experience level: ${aiForm.experienceLevel}`,
      '',
      'Company culture & environment:',
      aiForm.companyCulture || 'Add more context to tailor the AI screening.',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const buildDocTemplate = () => {
    const escapeRtf = (value: string) =>
      value
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\n/g, '\\line ');

    const title = aiForm.title.trim() || 'Job Description';
    const responsibilities = splitList(aiForm.responsibilities);
    const skills = splitList(aiForm.skills);
    const experience = aiForm.experienceLevel || 'N/A';
    const culture = aiForm.companyCulture.trim() || 'Add more context to tailor the AI screening.';
    const description = (generatedJD || previewText || buildAiTemplate()).trim() || 'Description forthcoming.';

    const listBlock = (items: string[]) =>
      items.length ? items.map((item) => `\\bullet\\tab ${escapeRtf(item)}\\line`).join('') : '\\i To be defined.\\i0\\line';

    return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}}
\\fs28\\b ${escapeRtf(title)}\\b0\\line
\\fs22 Experience level: ${escapeRtf(experience)}\\line\\line
\\b Overview\\b0\\line ${escapeRtf(description)}\\line\\line
\\b Key Responsibilities\\b0\\line ${listBlock(responsibilities)}\\line
\\b Required Skills\\b0\\line ${listBlock(skills)}\\line
\\b Culture & Environment\\b0\\line ${escapeRtf(culture)}\\line
}`;
  };

  const handleDownloadDraft = () => {
    if (!generatedJD) return;
    const docContent = buildDocTemplate();
    const blob = new Blob([docContent], { type: 'application/rtf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${aiForm.title.trim() || 'job-description'}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareLinkedIn = () => {
    if (!generatedJD) return;
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&summary=${encodeURIComponent(generatedJD)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const names = Array.from(event.target.files).map((file) => file.name);
    setUploadedFiles((prev) => [...prev, ...names]);
  };

  const handleZipUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setZipFileName(file.name);
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((name) => name !== fileName));
  };

  useEffect(() => {
    if (processingState !== 'processing') return;

    const duration = 6000;
    const start = performance.now();
    let frameId = requestAnimationFrame(step);

    function step(now: number) {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / duration) * 100);
      setProgress(next);

      if (elapsed >= duration) {
        setProgress(100);
        setProcessingState('complete');
        return;
      }

      frameId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(frameId);
  }, [processingState]);

  const handleCloseOverlay = () => {
    setShowConfirmation(false);
    setProcessingState('idle');
    setProgress(0);
    setSubmitError('');
    setCreatedJobId(null);
  };

  const createJobInDb = async (previewOverride?: string, descriptionOverride?: string) => {
    const title = aiForm.title.trim();
    const preview = (previewOverride ?? previewText).trim();
    const responsibilities = splitList(aiForm.responsibilities);
    const skills = splitList(aiForm.skills);

    if (!title || !preview) {
      throw new Error('Add a job title and preview before saving.');
    }

    const locationList = splitList(locationsInput);
    const openingsValue = Number(openings) || undefined;
    const salaryMinValue = salaryMin === '' ? undefined : Number(salaryMin);
    const salaryMaxValue = salaryMax === '' ? undefined : Number(salaryMax);

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: descriptionOverride ?? (mode === 'ai' ? generatedJD || preview : previewText),
        previewText: preview,
        responsibilities,
        skills,
        experienceLevel: aiForm.experienceLevel,
        companyCulture: aiForm.companyCulture,
        source: mode,
        topCandidates,
        driveLink: driveLink.trim() || undefined,
        uploadedDescriptionFile: uploadedJdFileName ?? undefined,
        employmentType: employmentType || undefined,
        locations: locationList,
        openings: openingsValue,
        salaryMin: salaryMinValue,
        salaryMax: salaryMaxValue,
        currency,
      }),
    });

    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) : {};
    if (!response.ok) {
      const message = payload?.error ?? response.statusText ?? 'Failed to create job';
      throw new Error(message);
    }

    return payload?.job?.id as string | undefined;
  };

  const handleSaveDraft = async () => {
    if (savingDraft) return;
    setSavingDraft(true);
    setDraftError('');
    setDraftJobId(null);
    try {
      let preview = previewText.trim();
      let description = generatedJD;

      if (mode === 'ai') {
        const allValid = jobPromptRequiredKeys.every((key) => validateField(key, aiForm[key]));
        if (!allValid) {
          throw new Error('Fill in the required fields before saving.');
        }
        if (!preview.length) {
          const template = buildAiTemplate();
          setGeneratedJD(template);
          preview = template;
          description = template;
        }
      }

      if (!preview) {
        throw new Error('Add a job title and preview before saving.');
      }

      const jobId = await createJobInDb(preview, description ?? undefined);
      setDraftJobId(jobId ?? null);
    } catch (error) {
      setDraftError((error as Error)?.message ?? 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleConfirmRun = async () => {
    setSubmitError('');
    setCreatedJobId(null);
    setProgress(10);
    setProcessingState('processing');

    try {
      let preview = previewText.trim();
      let description = generatedJD;

      if (mode === 'ai' && !preview) {
        const allValid = jobPromptRequiredKeys.every((key) => validateField(key, aiForm[key]));
        if (!allValid) {
          throw new Error('Fill in the required fields before starting.');
        }
        const template = buildAiTemplate();
        setGeneratedJD(template);
        preview = template;
        description = template;
      }

      if (!preview) {
        throw new Error('Add a job title and preview before starting.');
      }

      const jobId = await createJobInDb(preview, description ?? undefined);
      setCreatedJobId(jobId ?? null);
      setProgress(100);
      setProcessingState('complete');
    } catch (error) {
      setSubmitError((error as Error)?.message ?? 'Failed to create job');
      setProcessingState('error');
    }
  };

  return (
    <>
      <div className="space-y-12 text-[#181B31]">
        <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -top-24 right-8 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
                Launch a new sorting workflow
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
                Guide the AI recruiter with rich job context, upload your candidate pool, and tailor the shortlist in a
                couple of focused steps.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Guided workflow
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Privacy safe
                </span>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-80">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Run summary preview</p>
              <div className="space-y-3 text-sm text-[#4B5563]">
                <div className="flex items-center justify-between">
                  <span>CVs ready</span>
                  <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                    {uploadedFiles.length || 47}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target shortlist</span>
                  <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                    {topCandidates}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8A94A6]">
                You can revisit and edit job settings at any time once the workflow is live.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft md:grid-cols-2">
          {steps.map((step) => {
            const isActive = currentSection === step.key;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentSection(step.key)}
                className={`group flex flex-col items-start gap-2 rounded-2xl border border-[#DCE0E0] p-5 text-left transition ${
                  isActive
                    ? 'bg-gradient-to-br from-[#3D64FF]/20 via-[#FFFFFF] to-[#F5F7FB] text-[#3D64FF] shadow-card-soft'
                    : 'bg-[#FFFFFF] text-[#4B5563] hover:bg-[#F0F2F8] hover:text-[#3D64FF]'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold ${
                    isActive
                      ? 'border-transparent bg-[#3D64FF] text-[#FFFFFF]'
                      : 'border-[#DCE0E0] bg-[#F5F7FB] text-[#4B5563]'
                  }`}
                >
                  {step.id}
                </span>
                <p className="text-base font-semibold text-[#181B31]">{step.title}</p>
                <p className="text-sm leading-relaxed text-[#8A94A6]">{step.description}</p>
              </button>
            );
          })}
        </section>

        <section className="space-y-8">
          {currentSection === 'description' ? (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('ai')}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      mode === 'ai'
                        ? 'border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary'
                        : 'border-[#DCE0E0] bg-[#FFFFFF] text-[#4B5563] hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                    Compose with AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      mode === 'upload'
                        ? 'border-[#3D64FF]/60 bg-[#3D64FF]/12 text-[#3D64FF] shadow-glow-accent'
                        : 'border-[#DCE0E0] bg-[#FFFFFF] text-[#4B5563] hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Upload description
                  </button>
                </div>

                {mode === 'ai' ? (
                  <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft backdrop-blur">
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute -top-10 right-0 h-36 w-36 rounded-full bg-[#3D64FF]/15 blur-3xl" />
                    </div>
                    <div className="relative space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                            Step {aiStep + 1} of {totalPromptSteps}
                          </p>
                          <h2 className="mt-2 text-lg font-semibold text-[#181B31]">
                            {isDetailsStep ? 'Role details (optional)' : currentField?.label}
                          </h2>
                          {isDetailsStep && <p className="text-sm text-[#4B5563]">Save structured details with your draft.</p>}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">
                          <button
                            type="button"
                            className="rounded-full border border-[#DCE0E0] bg-[#F5F7FB] px-3 py-1.5 text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                            onClick={() => setAiStep((prev) => Math.max(0, prev - 1))}
                            disabled={aiStep === 0}
                          >
                            Back
                          </button>
                          {aiStep < totalPromptSteps - 1 && (
                            <button
                              type="button"
                              className={`rounded-full px-3 py-1.5 transition ${
                                isCurrentFieldValid
                                  ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                                  : 'border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6] cursor-not-allowed'
                              }`}
                              onClick={handleNext}
                              disabled={!isCurrentFieldValid}
                            >
                              Next
                            </button>
                          )}
                          {!isDetailsStep && (
                            <button
                              type="button"
                              onClick={handleSkip}
                              disabled={!canSkipCurrent}
                              className={`rounded-full px-3 py-1.5 transition ${
                                canSkipCurrent
                                  ? 'border border-[#FFA500]/40 bg-[#FFF2E0] text-[#9A5B00] hover:border-[#FFA500]/60 hover:bg-[#FFE4C2]'
                                  : 'border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6] cursor-not-allowed'
                              }`}
                            >
                              Skip
                            </button>
                          )}
                        </div>
                      </div>

                      {isDetailsStep ? (
                        <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="space-y-1 text-[13px]">
                              <span className="font-medium text-[#181B31]">Employment type (optional)</span>
                              <select
                                value={employmentType}
                                onChange={(event) => setEmploymentType(event.target.value)}
                                className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                              >
                                <option value="" className="bg-[#F7F8FC] text-[#8A94A6]">
                                  Select type (optional)
                                </option>
                                {employmentTypeOptions.map((option) => (
                                  <option key={option} value={option} className="bg-[#F7F8FC] text-[#181B31]">
                                    {option.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-1 text-[13px]">
                              <span className="font-medium text-[#181B31]">Locations</span>
                              <input
                                value={locationsInput}
                                onChange={(event) => setLocationsInput(event.target.value)}
                                placeholder="Dhaka, Remote"
                                className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                              />
                            </label>
                            <label className="space-y-1 text-[13px]">
                              <span className="font-medium text-[#181B31]">Openings</span>
                              <input
                                type="number"
                                min={1}
                                value={openings}
                                onChange={(event) => setOpenings(Number(event.target.value) || 1)}
                                className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                              />
                            </label>
                            <div className="grid gap-3 md:grid-cols-2 md:col-span-1">
                              <label className="space-y-1 text-[13px]">
                                <span className="font-medium text-[#181B31]">Salary min</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={salaryMin}
                                  onChange={(event) => setSalaryMin(event.target.value === '' ? '' : Number(event.target.value))}
                                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                                />
                              </label>
                              <label className="space-y-1 text-[13px]">
                                <span className="font-medium text-[#181B31]">Salary max</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={salaryMax}
                                  onChange={(event) => setSalaryMax(event.target.value === '' ? '' : Number(event.target.value))}
                                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                                />
                              </label>
                            </div>
                            <label className="space-y-1 text-[13px]">
                              <span className="font-medium text-[#181B31]">Currency</span>
                              <select
                                value={currency}
                                onChange={(event) => setCurrency(event.target.value)}
                                className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                              >
                                {currencyOptions.map((option) => (
                                  <option key={option} value={option} className="bg-[#F7F8FC] text-[#181B31]">
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      ) : currentField ? (
                        currentFieldType === 'textarea' ? (
                          <textarea
                            rows={5}
                            value={aiForm[currentField.key]}
                            onChange={(event) => handleAiChange(event.target.value)}
                            placeholder={currentField.placeholder}
                            className="min-h-[160px] w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                          />
                        ) : currentFieldType === 'select' ? (
                          <select
                            value={aiForm[currentField.key]}
                            onChange={(event) => handleAiChange(event.target.value)}
                            className="w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                          >
                            {experienceOptions.map((option) => (
                              <option key={option} value={option} className="bg-[#F7F8FC] text-[#181B31]">
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={aiForm[currentField.key]}
                            onChange={(event) => handleAiChange(event.target.value)}
                            placeholder={currentField.placeholder}
                            className="w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                          />
                        )
                      ) : null}
                      {currentField && errors[currentField.key] && (
                        <p className="text-xs font-semibold text-red-500">{errors[currentField.key]}</p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-[#8A94A6]">
                          We&apos;ll stitch the answers together and auto-fill any gaps with best-practice language.
                        </p>
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          disabled={!canSaveDraft || savingDraft}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                            canSaveDraft && !savingDraft
                              ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                              : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                          }`}
                        >
                          {savingDraft ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4" />
                              Save draft
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563] shadow-card-soft">
                      <p className="text-base font-semibold text-[#181B31]">Job title</p>
                      <p className="mt-1 text-xs text-[#8A94A6]">Required so we can save the job in your workspace.</p>
                      <input
                        value={aiForm.title}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAiForm((prev) => ({ ...prev, title: value }));
                          validateField('title', value);
                        }}
                        placeholder="e.g. Senior Backend Engineer"
                        className="mt-3 w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                      />
                      {errors.title && <p className="mt-2 text-xs font-semibold text-red-500">{errors.title}</p>}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-4xl border border-dashed border-[#DCE0E0] bg-[#FFFFFF] p-8 text-center text-sm text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]">
                        <UploadCloud className="h-10 w-10 text-[#3D64FF]" />
                        <div>
                          <p className="text-base font-semibold text-[#181B31]">Drag &amp; drop</p>
                          <p className="mt-1 text-xs text-[#8A94A6]">
                            Upload a PDF or DOCX job description to brief the AI.
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setUploadedJdFileName(file.name);
                          }}
                        />
                      </label>
                      <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563] shadow-card-soft">
                        <p className="text-base font-semibold text-[#181B31]">Prefer a link?</p>
                        <p className="mt-2 text-xs text-[#8A94A6]">
                          Paste the public URL to your job specification and we&apos;ll fetch it securely.
                        </p>
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#DCE0E0] bg-[#F5F7FB] px-4">
                          <LinkIcon className="h-4 w-4 text-[#3D64FF]" />
                          <input
                            type="url"
                            placeholder="https://company.com/jobs/backend-engineer"
                            className="flex-1 bg-transparent py-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
                          />
                        </div>
                        {uploadedJdFileName && (
                          <div className="mt-6 rounded-2xl border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-3 text-xs font-medium text-[#3D64FF]">
                            Uploaded: {uploadedJdFileName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-8 left-16 h-32 w-32 rounded-full bg-[#3D64FF]/15 blur-3xl" />
                  </div>
                  <div className="relative space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FileSearch className="h-5 w-5 text-[#3D64FF]" />
                        <h2 className="text-lg font-semibold text-[#181B31]">Preview draft</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                        <button
                          type="button"
                          onClick={handleDownloadDraft}
                          disabled={!generatedJD}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                            generatedJD
                              ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                              : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                          }`}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={handleShareLinkedIn}
                          disabled={!generatedJD}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                            generatedJD
                              ? 'border border-[#0A66C2]/40 bg-[#0A66C2]/15 text-[#0A66C2] hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/25'
                              : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                          }`}
                        >
                          <Linkedin className="h-4 w-4" />
                          Upload to LinkedIn
                        </button>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs leading-relaxed text-[#4B5563]">
                      {mode === 'ai' ? (
                        generatedJD ? (
                          <pre className="whitespace-pre-wrap font-sans text-[#4B5563]">{generatedJD}</pre>
                        ) : (
                          <p className="text-[#8A94A6]">
                            Complete the prompts and generate a draft to review the AI&apos;s language.
                          </p>
                        )
                      ) : uploadedJdFileName ? (
                        <p className="text-[#4B5563]">
                          <span className="font-semibold text-[#181B31]">{uploadedJdFileName}</span> ready. We&apos;ll parse
                          this description automatically.
                        </p>
                      ) : (
                        <p className="text-[#8A94A6]">Upload a description to preview it here.</p>
                      )}
                    </div>
                    {draftJobId && (
                      <p className="text-xs font-semibold text-[#1B806A]">Draft saved. Job ID: {draftJobId}</p>
                    )}
                    {draftError && <p className="text-xs font-semibold text-red-500">{draftError}</p>}
                    <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
                      <p className="font-semibold text-[#181B31]">Tips for higher signal</p>
                      <ul className="mt-2 space-y-2">
                        <li>- Specify success metrics or KPIs for the first 90 days.</li>
                        <li>- Highlight collaboration rituals: standups, pairing, async updates.</li>
                        <li>- Call out unique perks or culture markers to boost relevance.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Next step</p>
                  <p className="text-sm text-[#4B5563]">
                    Move to uploads once your description and role details feel complete. You can toggle back without losing any
                    progress.
                  </p>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentSection('upload')}
                      disabled={!canProceedToUpload}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        canProceedToUpload
                          ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                          : 'border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6] cursor-not-allowed'
                      }`}
                    >
                      Proceed to upload candidates
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-12 right-16 h-40 w-40 rounded-full bg-[#3D64FF]/15 blur-3xl" />
                  </div>
                  <div className="relative space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[#181B31]">Candidate intake</h2>
                        <p className="text-sm text-[#4B5563]">Upload CVs or share a drive folder.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSection('description')}
                          className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Edit description
                        </button>
                        <button
                          type="button"
                          onClick={goToRoleDetailsStep}
                          className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Edit role details
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                    <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#DCE0E0] bg-[#FFFFFF] p-8 text-center text-sm text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]">
                        <FileUp className="h-10 w-10 text-[#3D64FF]" />
                        <div>
                          <p className="text-base font-semibold text-[#181B31]">Drag &amp; drop CVs</p>
                          <p className="mt-1 text-xs text-[#8A94A6]">PDF, DOCX, or TXT up to 20MB each.</p>
                        </div>
                        <input type="file" multiple className="hidden" onChange={handleUploadFiles} />
                      </label>
                      <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
                        <p className="text-base font-semibold text-[#181B31]">Upload a ZIP</p>
                        <p className="mt-2 text-xs text-[#8A94A6]">
                          Bundle a folder of CVs. We&apos;ll unpack and deduplicate automatically.
                        </p>
                        <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25">
                          <UploadCloud className="h-4 w-4" />
                          Choose ZIP
                          <input type="file" accept=".zip" className="hidden" onChange={handleZipUpload} />
                        </label>
                        {zipFileName && (
                          <p className="mt-4 rounded-2xl border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-2 text-xs font-medium text-[#3D64FF]">
                            {zipFileName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                        Optional drive link
                      </p>
                      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#DCE0E0] bg-[#F5F7FB] px-4">
                        <LinkIcon className="h-4 w-4 text-[#3D64FF]" />
                        <input
                          value={driveLink}
                          onChange={(event) => setDriveLink(event.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="flex-1 bg-transparent py-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
                        />
                      </div>
                      <p className="mt-3 text-xs text-[#8A94A6]">
                        We&apos;ll sync new CVs from this location before each rerun.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -bottom-14 right-12 h-40 w-40 rounded-full bg-[#3D64FF]/10 blur-3xl" />
                  </div>
                  <div className="relative space-y-6">
                    <h3 className="text-lg font-semibold text-[#181B31]">Files queued</h3>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-sm text-[#8A94A6]">No CVs added yet. Drop files above to populate the list.</p>
                    ) : (
                      <ul className="space-y-3 text-sm">
                        {uploadedFiles.map((file) => (
                          <li
                            key={file}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-3 text-[#4B5563]"
                          >
                            <span className="truncate">{file}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file)}
                              className="rounded-full border border-[#DCE0E0] p-1 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
                  <h3 className="text-lg font-semibold text-[#181B31]">Ranking configuration</h3>
                  <p className="mt-1 text-sm text-[#4B5563]">
                    Choose how many candidates to surface for the first pass. You can rerun with different limits whenever
                    you like.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#181B31]">Number of top candidates</span>
                        <span className="rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                          {topCandidates} candidates
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={50}
                        step={5}
                        value={topCandidates}
                        onChange={(event) => setTopCandidates(Number(event.target.value))}
                        className="mt-4 w-full accent-[#3D64FF]"
                      />
                      <div className="mt-2 flex justify-between text-[11px] text-[#8A94A6]">
                        {[10, 25, 50].map((mark) => (
                          <span key={mark}>{mark}</span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
                      <p className="text-sm font-semibold text-[#181B31]">Usage preview</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span>Estimated credits consumed</span>
                        <span className="rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-1 text-xs font-semibold text-[#3D64FF]">
                          {costUsage.consumed} of {costUsage.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
                  <p>
                    The AI will normalise each CV, score against your job factors, and provide reasoning for every
                    recommendation.
                  </p>
                  <p className="text-xs text-[#8A94A6]">
                    Not ready to sort yet? Save the job and kick off sorting from the Jobs list or job details later.
                  </p>
                  <div className="flex flex-wrap justify-end gap-3">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                    >
                      Start later from jobs
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCurrentSection('description')}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError('');
                        setCreatedJobId(null);
                        setShowConfirmation(true);
                        setProcessingState('idle');
                        setProgress(0);
                      }}
                      disabled={!canStartSorting}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        canStartSorting
                          ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                          : 'cursor-not-allowed border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]'
                      }`}
                    >
                      Start Sorting
                      <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181B31]/60 px-4 backdrop-blur">
          <div className="w-full max-w-xl overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft">
            {processingState === 'idle' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#181B31]">Confirm run</h3>
                    <p className="mt-1 text-sm text-[#4B5563]">
                      We&apos;ll rank all uploaded CVs against your description. This takes a few minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseOverlay}
                    className="rounded-full border border-[#DCE0E0] p-2 text-[#8A94A6] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]">
                  <div className="flex items-center justify-between">
                    <span>CVs queued</span>
                    <span className="font-semibold text-[#181B31]">{uploadedFiles.length || 47}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Top candidates requested</span>
                    <span className="font-semibold text-[#181B31]">{topCandidates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits consumed</span>
                    <span className="font-semibold text-[#3D64FF]">
                      {costUsage.consumed} of {costUsage.total}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={handleCloseOverlay}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRun}
                    disabled={!canStartSorting}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 transition ${
                      canStartSorting
                        ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                        : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                    }`}
                  >
                    Confirm &amp; run
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </button>
                </div>
              </div>
            )}

            {processingState === 'processing' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#3D64FF]" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Creating job</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  Saving your job, storing the preview as HTML, and queuing the first sorting run. This should only take
                  a moment.
                </p>
                <div className="space-y-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#DCE0E0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/60 to-[#3D64FF] transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#8A94A6]">Progress - {progress.toFixed(0)}%</p>
                </div>
              </div>
            )}

            {processingState === 'error' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Couldn&apos;t create job</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  {submitError || 'Something went wrong saving this job. Try again in a moment.'}
                </p>
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => {
                      setProcessingState('idle');
                      setSubmitError('');
                      setProgress(0);
                    }}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRun}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                  >
                    Retry
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </button>
                </div>
              </div>
            )}

            {processingState === 'complete' && (
              <div className="space-y-6 p-8 text-[#181B31]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success-500" />
                  <h3 className="text-lg font-semibold text-[#181B31]">Job created</h3>
                </div>
                <p className="text-sm text-[#4B5563]">
                  We saved the role, including your preview HTML, and queued the initial sorting. You can review and edit
                  it from the Jobs area.
                </p>
                {createdJobId && (
                  <p className="text-xs text-[#8A94A6]">Job ID: {createdJobId}</p>
                )}
                <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={handleCloseOverlay}
                    className="rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    Close
                  </button>
                  <Link
                    href="/jobs"
                    onClick={handleCloseOverlay}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-[#3D64FF] shadow-glow-primary transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                  >
                    Go to jobs
                    <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
