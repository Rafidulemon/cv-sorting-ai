'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
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

const JOB_DESCRIPTION_MAX_BYTES = 5 * 1024 * 1024;

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.replace(/^[•-]\s*/, '').trim())
    .filter(Boolean);

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const jobCreationSteps = [
  {
    id: 1,
    key: 'description' as const,
    title: 'Craft your role',
    description: 'Use AI or upload an existing description, then add details in step 6.',
  },
  { id: 2, key: 'upload' as const, title: 'Upload candidates', description: 'Add CVs and fine tune how many to shortlist.' },
];

type JobCreationContextValue = ReturnType<typeof useJobCreationState>;

const JobCreationContext = createContext<JobCreationContextValue | null>(null);

function useJobCreationState() {
  const [mode, setMode] = useState<'create' | 'upload'>('create');
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
  const [uploadedJdFileUrl, setUploadedJdFileUrl] = useState<string | null>(null);
  const [uploadedJdFileKey, setUploadedJdFileKey] = useState<string | null>(null);
  const [uploadedJdText, setUploadedJdText] = useState('');
  const [uploadedJdFileText, setUploadedJdFileText] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jdUploadState, setJdUploadState] = useState<'idle' | 'uploading' | 'uploaded'>('idle');
  const [jdUploadError, setJdUploadError] = useState('');
  const [jdSecurityNote, setJdSecurityNote] = useState('');
  const [jdVirusScanQueued, setJdVirusScanQueued] = useState(false);
  const [jdProcessing, setJdProcessing] = useState(false);
  const [jdProcessingProgress, setJdProcessingProgress] = useState(0);
  const [jdProcessingError, setJdProcessingError] = useState('');

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
  const hasHydratedFromQuery = useRef(false);

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
  const currentFieldType: 'text' | 'textarea' | 'select' =
    currentField && 'type' in currentField && currentField.type ? currentField.type : 'text';
  const isCurrentFieldValid = useMemo(() => {
    if (!currentField) return true;
    return jobPromptSchemas[currentField.key].safeParse(aiForm[currentField.key]).success;
  }, [aiForm, currentField]);
  const canSkipCurrent = Boolean(currentField && jobPromptSkippableKeys.includes(currentField.key));

  const requiredFieldsValid = useMemo(
    () => jobPromptRequiredKeys.every((key) => jobPromptSchemas[key].safeParse(aiForm[key]).success),
    [aiForm]
  );

  const costUsage = useMemo(() => {
    const base = uploadedFiles.length || 47;
    return { consumed: base, total: 500 };
  }, [uploadedFiles.length]);

  const resetUploadedFile = () => {
    setUploadedJdFileName(null);
    setUploadedJdFileUrl(null);
    setUploadedJdFileKey(null);
    setJdUploadState('idle');
    setJdUploadError('');
    setJdSecurityNote('');
    setJdVirusScanQueued(false);
    setUploadedJdFileText('');
    setJdProcessingError('');
    setJdProcessingProgress(0);
  };

  const handleJdTextChange = (value: string) => {
    setUploadedJdText(value);
    setJdProcessingError('');
    if (value.trim()) {
      resetUploadedFile();
    }
  };

  const isUploadingJd = jdUploadState === 'uploading';

  const showToast = (message: string, type: 'success' | 'error') => {
    void message;
    void type;
  };

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
    if (mode === 'create') {
      return generatedJD.trim();
    }

    const pasted = uploadedJdText.trim();
    if (pasted) {
      return pasted;
    }

    if (uploadedJdFileName) {
      const linkPart = driveLink.trim().length ? ` (link: ${driveLink.trim()})` : '';
      return `Uploaded description: ${uploadedJdFileName}${linkPart}`;
    }

    return '';
  }, [driveLink, generatedJD, mode, uploadedJdFileName, uploadedJdText]);

  const jdTextForProcessing = useMemo(() => {
    const pasted = uploadedJdText.trim();
    if (pasted) return pasted;
    return uploadedJdFileText.trim();
  }, [uploadedJdFileText, uploadedJdText]);

  const canProcessJd = useMemo(
    () => Boolean(jdTextForProcessing.length) && !jdProcessing && !isUploadingJd,
    [isUploadingJd, jdProcessing, jdTextForProcessing]
  );

  const titleReady = jobPromptSchemas.title.safeParse(aiForm.title).success;

  const canStartSorting = useMemo(() => {
    if (!titleReady) return false;
    if (mode === 'upload') return Boolean(uploadedJdFileName || uploadedJdText.trim());
    return requiredFieldsValid;
  }, [mode, requiredFieldsValid, titleReady, uploadedJdFileName, uploadedJdText]);

  const canSaveDraft = useMemo(() => {
    if (!titleReady) return false;
    if (mode === 'upload') return Boolean(uploadedJdFileName || uploadedJdText.trim());
    return requiredFieldsValid;
  }, [mode, requiredFieldsValid, titleReady, uploadedJdFileName, uploadedJdText]);

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

  const handlePreviousStep = () => {
    setAiStep((prev) => Math.max(0, prev - 1));
  };

  const handleTitleChange = (value: string) => {
    setAiForm((prev) => ({ ...prev, title: value }));
    validateField('title', value);
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
    setAiStep(totalPromptSteps - 1);
  };

  const buildJDTemplate = () => {
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
    const description = (generatedJD || previewText || buildJDTemplate()).trim() || 'Description forthcoming.';

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

  const uploadJobDescription = async (
    file: File
  ): Promise<{ success: boolean; error?: string; text?: string; jobId?: string | null }> => {
    setUploadedJdText('');
    setJdUploadError('');
    setJdSecurityNote('');
    setJdVirusScanQueued(false);
    setJdUploadState('uploading');
    setUploadedJdFileName(null);
    setUploadedJdFileUrl(null);
    setUploadedJdFileKey(null);
    setUploadedJdFileText('');
    setJdProcessingError('');
    setJdProcessingProgress(0);

    try {
      const jobTitle = aiForm.title.trim();
      const allowedExtensions = new Set(['pdf', 'docx', 'txt']);
      const allowedMimeTypes = new Set([
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]);
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
      if (!allowedExtensions.has(extension ?? '') && !allowedMimeTypes.has(file.type)) {
        throw new Error('Only PDF, DOCX, or TXT files are supported.');
      }

      if (file.size > JOB_DESCRIPTION_MAX_BYTES) {
        throw new Error('Job description must be 5MB or smaller.');
      }

      const fileText = (await file.text()).slice(0, 12000);
      setUploadedJdFileText(fileText);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('contentType', file.type || 'application/octet-stream');
      formData.append('scan', 'true');
      if (jobTitle) {
        formData.append('jobTitle', jobTitle);
      }
      if (jobId) {
        formData.append('jobId', jobId);
      }

      const prepareResponse = await fetch('/api/jobs/upload-url', {
        method: 'POST',
        body: formData,
      });

      const prepareText = await prepareResponse.text();
      const preparePayload = prepareText ? JSON.parse(prepareText) : {};

      if (!prepareResponse.ok) {
        const message = preparePayload?.error ?? 'Failed to prepare secure upload.';
        throw new Error(message);
      }

      const responseJobId = (preparePayload?.jobId as string | undefined) ?? null;
      if (responseJobId) {
        setJobId(responseJobId);
      }

      setUploadedJdFileKey((preparePayload?.key as string | undefined) ?? null);
      setUploadedJdFileName(preparePayload?.key ? file.name : preparePayload?.fileName ?? file.name);
      setUploadedJdFileUrl((preparePayload?.publicUrl as string | undefined) ?? null);
      setJdSecurityNote((preparePayload?.securityNote as string | undefined) ?? '');
      setJdVirusScanQueued(Boolean(preparePayload?.virusScanQueued));
      setJdUploadState('uploaded');
      showToast(`Uploaded ${file.name}`, 'success');
      return { success: true, text: fileText, jobId: responseJobId ?? null };
    } catch (error) {
      const message = (error as Error)?.message ?? 'Failed to upload job description.';
      setJdUploadError(message);
      setJdUploadState('idle');
      setUploadedJdFileName(null);
      setUploadedJdFileUrl(null);
      setUploadedJdFileKey(null);
      setUploadedJdFileText('');
      setJdProcessingProgress(0);
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const handleJobDescriptionUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void uploadJobDescription(file);
    event.target.value = '';
  };

  const processJobDescription = async (
    textOverride?: string,
    jobIdOverride?: string | null,
    fileOverride?: File | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (jdProcessing) return { success: false, error: 'Processing is already running.' };
    const jdText = (textOverride ?? jdTextForProcessing) || '';
    const fileToProcess = fileOverride ?? null;
    if (!jdText.trim().length && !fileToProcess) {
      const message = 'Upload or paste a job description before processing.';
      setJdProcessingError(message);
      return { success: false, error: message };
    }

    const targetJobId = jobIdOverride ?? jobId ?? undefined;
    if (jobIdOverride && jobIdOverride !== jobId) {
      setJobId(jobIdOverride);
    }

    setJdProcessing(true);
    setJdProcessingError('');
    setJdProcessingProgress(15);

    try {
      const source = uploadedJdText.trim() ? 'paste' : 'upload';
      let response: Response;

      if (fileToProcess) {
        const formData = new FormData();
        formData.append('source', source);
        formData.append('file', fileToProcess);
        formData.append('fileName', fileToProcess.name);
        if (targetJobId) {
          formData.append('jobId', targetJobId);
        }
        const uploadedReference = uploadedJdFileKey ?? uploadedJdFileUrl ?? uploadedJdFileName;
        if (uploadedReference) {
          formData.append('uploadedDescriptionFile', uploadedReference);
        }

        response = await fetch('/api/jobs/process-jd', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/jobs/process-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: targetJobId,
            text: jdText.trim(),
            source,
            fileName: uploadedJdFileName ?? undefined,
            uploadedDescriptionFile: uploadedJdFileKey ?? uploadedJdFileUrl ?? uploadedJdFileName ?? undefined,
          }),
        });
      }

      setJdProcessingProgress(55);

      const raw = await response.text();
      const payload = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        const message = payload?.error ?? 'Failed to process job description';
        throw new Error(message);
      }

      const structured = (payload?.structured ?? {}) as {
        title?: string;
        summary?: string;
        responsibilities?: string[];
        skills?: string[];
        seniority?: string;
        employmentType?: string | null;
        category?: string | null;
      };
      const jobPayload = payload?.job as { id?: string; description?: string } | undefined;

      if (jobPayload?.id) {
        setJobId(jobPayload.id);
      }

      if (structured.title?.trim()) {
        setAiForm((prev) => ({ ...prev, title: structured.title?.trim() || prev.title }));
      }
      const structuredResponsibilities = Array.isArray(structured.responsibilities) ? structured.responsibilities : [];
      if (structuredResponsibilities.length) {
        setAiForm((prev) => ({ ...prev, responsibilities: structuredResponsibilities.join('\n') }));
      }
      const structuredSkills = Array.isArray(structured.skills) ? structured.skills : [];
      if (structuredSkills.length) {
        setAiForm((prev) => ({ ...prev, skills: structuredSkills.join('\n') }));
      }
      if (structured.seniority?.trim()) {
        setAiForm((prev) => ({ ...prev, experienceLevel: structured.seniority?.trim() || prev.experienceLevel }));
      }
      if (structured.employmentType?.trim()) {
        setEmploymentType(structured.employmentType.trim());
      }
      if (structured.summary?.trim()) {
        const cleanSummary = structured.summary.trim();
        setGeneratedJD(cleanSummary);
        if (uploadedJdText.trim()) {
          setUploadedJdText(cleanSummary);
        }
      } else if (jobPayload?.description) {
        setGeneratedJD(jobPayload.description);
      }

      setJdProcessingProgress(100);
      showToast('Job description processed', 'success');
      return { success: true };
    } catch (error) {
      const message = (error as Error)?.message ?? 'Failed to process job description';
      setJdProcessingError(message);
      setJdProcessingProgress(0);
      showToast(message, 'error');
      return { success: false, error: message };
    } finally {
      setTimeout(() => {
        setJdProcessing(false);
        setJdProcessingProgress(0);
      }, 350);
    }
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
    const openingsValue = Number.isFinite(Number(openings)) && Number(openings) > 0 ? Number(openings) : undefined;
    const salaryMinValue = typeof salaryMin === 'number' && Number.isFinite(salaryMin) ? salaryMin : undefined;
    const salaryMaxValue = typeof salaryMax === 'number' && Number.isFinite(salaryMax) ? salaryMax : undefined;
    const trimmedDriveLink = driveLink.trim();
    if (trimmedDriveLink && !isValidHttpUrl(trimmedDriveLink)) {
      throw new Error('Enter a valid drive link (include https://).');
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: jobId ?? undefined,
        title,
        description: descriptionOverride ?? (mode === 'create' ? generatedJD || preview : previewText),
        previewText: preview,
        responsibilities,
        skills,
        experienceLevel: aiForm.experienceLevel,
        companyCulture: aiForm.companyCulture,
        source: mode === 'create' ? 'create' : 'upload',
        topCandidates,
        driveLink: trimmedDriveLink || undefined,
        uploadedDescriptionFile: uploadedJdFileKey ?? uploadedJdFileUrl ?? uploadedJdFileName ?? undefined,
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
      const fieldErrors = (payload?.details?.fieldErrors as Record<string, string[]> | undefined) ?? null;
      const detailMessage =
        (payload?.details?.formErrors as string[] | undefined)?.[0] ||
        (fieldErrors ? Object.values(fieldErrors)[0]?.[0] : null);
      const message = detailMessage ?? payload?.error ?? response.statusText ?? 'Failed to create job';
      throw new Error(message);
    }

    const createdOrUpdatedJobId = (payload?.job?.id as string | undefined) ?? jobId ?? undefined;
    if (createdOrUpdatedJobId) {
      setJobId(createdOrUpdatedJobId);
    }
    return createdOrUpdatedJobId;
  };

  const handleSaveDraft = async () => {
    if (savingDraft) return;
    setSavingDraft(true);
    setDraftError('');
    setDraftJobId(null);
    try {
      let preview = previewText.trim();
      let description = mode === 'upload' ? preview : generatedJD;

      if (mode === 'create') {
        const allValid = jobPromptRequiredKeys.every((key) => validateField(key, aiForm[key]));
        if (!allValid) {
          throw new Error('Fill in the required fields before saving.');
        }
        if (!preview.length) {
          const template = buildJDTemplate();
          setGeneratedJD(template);
          preview = template;
          description = template;
        }
      }

      if (!preview) {
        throw new Error('Add a job title and preview before saving.');
      }

      const nextJobId = await createJobInDb(preview, description ?? undefined);
      setDraftJobId(nextJobId ?? null);
      if (nextJobId) {
        setJobId(nextJobId);
      }
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
      let description = mode === 'upload' ? preview : generatedJD;

      if (mode === 'create' && !preview) {
        const allValid = jobPromptRequiredKeys.every((key) => validateField(key, aiForm[key]));
        if (!allValid) {
          throw new Error('Fill in the required fields before starting.');
        }
        const template = buildJDTemplate();
        setGeneratedJD(template);
        preview = template;
        description = template;
      }

      if (!preview) {
        throw new Error('Add a job title and preview before starting.');
      }

      const nextJobId = await createJobInDb(preview, description ?? undefined);
      setCreatedJobId(nextJobId ?? null);
      if (nextJobId) {
        setJobId(nextJobId);
      }
      setProgress(100);
      setProcessingState('complete');
    } catch (error) {
      setSubmitError((error as Error)?.message ?? 'Failed to create job');
      setProcessingState('error');
    }
  };

  const hydrateFromQuery = useCallback(
    (sectionParam: string | null, jobIdParam: string | null, titleParam: string | null) => {
      if (jobIdParam && jobIdParam !== jobId) {
        setJobId(jobIdParam);
      }
      if (titleParam) {
        setAiForm((prev) => (prev.title ? prev : { ...prev, title: titleParam }));
        setErrors((prev) => ({ ...prev, title: '' }));
      }
      if (!hasHydratedFromQuery.current && sectionParam === 'upload') {
        setMode((prev) => prev);
      }
      hasHydratedFromQuery.current = true;
    },
    [jobId]
  );

  return {
    aiStep,
    setAiStep,
    aiForm,
    setAiForm,
    mode,
    setMode,
    generatedJD,
    setGeneratedJD,
    uploadedJdFileName,
    setUploadedJdFileName,
    uploadedJdFileUrl,
    setUploadedJdFileUrl,
    uploadedJdFileKey,
    setUploadedJdFileKey,
    uploadedJdText,
    handleJdTextChange,
    jobId,
    setJobId,
    jdUploadState,
    jdUploadError,
    jdSecurityNote,
    jdVirusScanQueued,
    jdProcessing,
    jdProcessingProgress,
    jdProcessingError,
    canProcessJd,
    uploadedFiles,
    zipFileName,
    driveLink,
    setDriveLink,
    topCandidates,
    setTopCandidates,
    employmentType,
    setEmploymentType,
    locationsInput,
    setLocationsInput,
    openings,
    setOpenings,
    salaryMin,
    setSalaryMin,
    salaryMax,
    setSalaryMax,
    currency,
    setCurrency,
    experienceOptions,
    employmentTypeOptions,
    currencyOptions,
    savingDraft,
    draftJobId,
    draftError,
    showConfirmation,
    setShowConfirmation,
    processingState,
    setProcessingState,
    progress,
    setProgress,
    submitError,
    setSubmitError,
    createdJobId,
    setCreatedJobId,
    errors,
    totalPromptSteps,
    isDetailsStep,
    currentField,
    currentFieldType,
    isCurrentFieldValid,
    canSkipCurrent,
    requiredFieldsValid,
    costUsage,
    isUploadingJd,
    titleReady,
    canStartSorting,
    canSaveDraft,
    validateField,
    handleAiChange,
    handlePreviousStep,
    handleTitleChange,
    handleNext,
    handleSkip,
    goToRoleDetailsStep,
    buildJDTemplate,
    buildDocTemplate,
    handleDownloadDraft,
    handleShareLinkedIn,
    uploadJobDescription,
    handleJobDescriptionUpload,
    processJobDescription,
    handleUploadFiles,
    handleZipUpload,
    handleRemoveFile,
    handleCloseOverlay,
    handleSaveDraft,
    handleConfirmRun,
    previewText,
    hydrateFromQuery,
  };
}

export function JobCreationProvider({ children }: { children: ReactNode }) {
  const value = useJobCreationState();
  return <JobCreationContext.Provider value={value}>{children}</JobCreationContext.Provider>;
}

export function useJobCreation() {
  const context = useContext(JobCreationContext);
  if (!context) {
    throw new Error('useJobCreation must be used within a JobCreationProvider');
  }
  return context;
}
