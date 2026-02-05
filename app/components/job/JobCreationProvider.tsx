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
import { useUploadOverlay } from '@/app/components/upload/UploadOverlayProvider';

const JOB_DESCRIPTION_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_PROCESS_STORAGE_KEY = 'carrix-resume-processing';
const SORTING_PROCESS_STORAGE_KEY = 'carrix-sorting';

type ResumeProcessingSession = {
  jobId: string;
  total?: number;
  background?: boolean;
  lastProgress?: number;
  timestamp?: number;
};

type SortingProcessingSession = {
  jobId: string;
  queueJobId?: string | null;
  background?: boolean;
  lastProgress?: number;
  timestamp?: number;
};

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
  const uploadOverlay = useUploadOverlay();
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
  const [uploadedResumes, setUploadedResumes] = useState<
    { name: string; status: string; resumeId?: string | null }[]
  >([]);
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [zipUploadError, setZipUploadError] = useState('');
  const [zipUploading, setZipUploading] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [topCandidates, setTopCandidates] = useState(25);
  const [refreshingResumes, setRefreshingResumes] = useState(false);
  const [activeQueueJobId, setActiveQueueJobId] = useState<string | null>(null);

  const [employmentType, setEmploymentType] = useState<string>('');
  const [locationsInput, setLocationsInput] = useState('');
  const [openings, setOpenings] = useState(1);
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState<string>('BDT');
  const [minEducation, setMinEducation] = useState<string>('Any');
  const [ageMin, setAgeMin] = useState<number | ''>('');
  const [ageMax, setAgeMax] = useState<number | ''>('');
  const [nationality, setNationality] = useState<string>('Any');
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
  const [resumeProcessModalOpen, setResumeProcessModalOpen] = useState(false);
  const [resumeProcessingState, setResumeProcessingState] = useState<'idle' | 'confirm' | 'processing' | 'complete' | 'error'>('idle');
  const [resumeProcessProgress, setResumeProcessProgress] = useState(0);
  const [resumeProcessError, setResumeProcessError] = useState('');
  const [resumeProcessCount, setResumeProcessCount] = useState(0);
  const [resumeProcessBackground, setResumeProcessBackground] = useState(false);
  const resumeProcessPollRef = useRef<NodeJS.Timeout | null>(null);
  const [sortingQueueJobId, setSortingQueueJobId] = useState<string | null>(null);
  const [sortingBackground, setSortingBackground] = useState(false);
  const sortingPollRef = useRef<NodeJS.Timeout | null>(null);
  const sortingBackgroundRef = useRef(false);
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
    const base = uploadedResumes.length;
    return { consumed: base, total: Math.max(500, base) };
  }, [uploadedResumes.length]);

  const processedResumeCount = useMemo(
    () => uploadedResumes.filter((row) => row.status === 'COMPLETED').length,
    [uploadedResumes],
  );

  const notProcessedCount = useMemo(
    () => uploadedResumes.filter((row) => row.status !== 'COMPLETED').length,
    [uploadedResumes],
  );

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

  const fetchResumesForJob = useCallback(
    async (targetJobId: string) => {
      if (!targetJobId) return;
      try {
        setRefreshingResumes(true);
        const response = await fetch(`/api/jobs/${targetJobId}/resumes`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const rows: { name: string; status: string; resumeId?: string | null }[] = Array.isArray(payload?.files)
          ? (payload.files as { name?: string; status?: string; resumeId?: string | null }[])
              .map((item) => ({
                name: (item?.name as string | undefined)?.trim() || 'Resume',
                status: (item?.status as string | undefined) || 'UPLOADED',
                resumeId: (item?.resumeId as string | undefined) ?? null,
              }))
              .filter((row: { name: string }) => row.name)
          : [];
        setUploadedResumes(rows);
        setUploadedFiles(rows.map((row) => row.name));
      } catch (error) {
        console.warn('Failed to refresh resumes', error);
      } finally {
        setRefreshingResumes(false);
      }
    },
    []
  );

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

  useEffect(() => {
    if (jobId) {
      fetchResumesForJob(jobId);
    }
  }, [jobId, fetchResumesForJob]);

  useEffect(() => {
    if (!processedResumeCount) {
      setTopCandidates(0);
      return;
    }
    if (topCandidates === 0) {
      setTopCandidates(Math.min(10, processedResumeCount));
      return;
    }
    if (topCandidates > processedResumeCount) {
      setTopCandidates(processedResumeCount);
    }
  }, [processedResumeCount, topCandidates]);

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
    if (mode === 'upload') return Boolean(uploadedJdFileName || uploadedJdText.trim() || jobId);
    return requiredFieldsValid;
  }, [mode, requiredFieldsValid, titleReady, uploadedJdFileName, uploadedJdText, jobId]);

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

  const addCvFiles = (files: File[]) => {
    if (!files.length) return;
    setCvFiles((prev) => [...prev, ...files]);
    setUploadError('');
  };

  const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    addCvFiles(Array.from(event.target.files));
    if (event.target) event.target.value = '';
  };

  const handleDropFiles = (files: FileList) => {
    addCvFiles(Array.from(files));
  };

  const handleZipUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setZipFile(file);
    setZipFileName(file?.name ?? null);
    setZipUploadError('');
    if (event.target) {
      event.target.value = '';
    }
  };

  const uploadWithProgress = (
    url: string,
    formData: FormData,
    size: number,
    onProgress: (loaded: number, total: number) => void
  ) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, size || event.total || size);
        }
      };
      xhr.onload = () => {
        const status = xhr.status;
        let payload: Record<string, unknown> = {};
        try {
          payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          // ignore parse errors
        }
        if (status >= 200 && status < 300) {
          resolve(payload);
        } else {
          reject(new Error((payload as { error?: string })?.error || `Upload failed with status ${status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((name) => name !== fileName));
    setCvFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const pollQueueJob = useCallback(
    async (queueJobId: string, targetJobId: string) => {
      if (!queueJobId || !targetJobId) return;
      let attempts = 0;
      let done = false;
      const maxAttempts = 30; // ~60s with 2s delay
      while (!done && attempts < maxAttempts) {
        attempts += 1;
        try {
          const response = await fetch(`/api/jobs/upload-cv-zip/status?queueJobId=${queueJobId}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('Failed to poll queue job');
          const payload = await response.json();
          const status = payload?.status as string | undefined;
          const result = payload?.result as { uploaded?: number; failed?: number } | undefined;
          if (status === 'COMPLETED') {
            await fetchResumesForJob(targetJobId);
            done = true;
            setActiveQueueJobId(null);
            uploadOverlay.markSuccess(
              'Upload complete',
              result?.failed ? `${result.uploaded ?? 0} uploaded, ${result.failed} failed` : undefined,
            );
            break;
          }
          if (status === 'FAILED') {
            await fetchResumesForJob(targetJobId);
            uploadOverlay.markError('Upload failed', result?.failed ? `${result.failed} failed` : undefined);
            setActiveQueueJobId(null);
            done = true;
            break;
          }
        } catch (error) {
          console.warn('Queue poll error', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!done) {
        setActiveQueueJobId(null);
        uploadOverlay.markError('Upload timed out', 'Worker did not pick up the job. Check worker logs and retry.');
      }
    },
    [fetchResumesForJob, uploadOverlay]
  );

  const resetSortingUi = () => {
    stopSortingPoll();
    clearSortingSession();
    setShowConfirmation(false);
    setProcessingState('idle');
    setProgress(0);
    setSubmitError('');
    setCreatedJobId(null);
    setSortingQueueJobId(null);
    setSortingBackground(false);
  };

  const handleCloseOverlay = (forceReset = false) => {
    if (processingState === 'processing' && !forceReset) {
      setShowConfirmation(false);
      setSortingBackground(true);
      if (jobId) {
        updateSortingSession({
          jobId,
          queueJobId: sortingQueueJobId ?? undefined,
          background: true,
          lastProgress: progress || 0,
          timestamp: Date.now(),
        });
      }
      return;
    }
    resetSortingUi();
  };

  const createJobInDb = async (previewOverride?: string, descriptionOverride?: string) => {
    const title = aiForm.title.trim();
    let preview = (previewOverride ?? previewText).trim();
    const responsibilities = splitList(aiForm.responsibilities);
    const skills = splitList(aiForm.skills);

    if (!preview.length) {
      const fallback = uploadedJdText.trim() || jdTextForProcessing || buildJDTemplate();
      preview = fallback.trim();
      if (mode === 'create' && !generatedJD && fallback) {
        setGeneratedJD(fallback);
      }
    }

    if (!title || !preview) {
      throw new Error('Add a job title and preview before saving.');
    }

    const locationList = splitList(locationsInput);
    const openingsValue = Number.isFinite(Number(openings)) && Number(openings) > 0 ? Number(openings) : undefined;
    const salaryMinValue = typeof salaryMin === 'number' && Number.isFinite(salaryMin) ? salaryMin : undefined;
    const salaryMaxValue = typeof salaryMax === 'number' && Number.isFinite(salaryMax) ? salaryMax : undefined;
    const ageMinValue = typeof ageMin === 'number' && Number.isFinite(ageMin) ? ageMin : undefined;
    const ageMaxValue = typeof ageMax === 'number' && Number.isFinite(ageMax) ? ageMax : undefined;
    if (ageMinValue !== undefined && ageMaxValue !== undefined && ageMinValue > ageMaxValue) {
      throw new Error('Minimum age cannot be greater than maximum age.');
    }
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
        description: (descriptionOverride ?? (mode === 'create' ? generatedJD || preview : previewText) ?? preview).trim(),
        previewText: preview,
        responsibilities,
        skills,
        experienceLevel: aiForm.experienceLevel,
        companyCulture: aiForm.companyCulture,
        source: mode === 'create' ? 'create' : 'upload',
        topCandidates: topCandidates > 0 ? topCandidates : undefined,
        driveLink: trimmedDriveLink || undefined,
        uploadedDescriptionFile: uploadedJdFileKey ?? uploadedJdFileUrl ?? uploadedJdFileName ?? undefined,
        employmentType: employmentType || undefined,
        locations: locationList,
        openings: openingsValue,
        salaryMin: salaryMinValue,
        salaryMax: salaryMaxValue,
        currency,
        minEducation: minEducation.trim() || 'Any',
        nationality: nationality.trim() || 'Any',
        ageMin: ageMinValue,
        ageMax: ageMaxValue,
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
      } else {
        // Upload mode: if preview missing, fall back to pasted/uploaded text or template
        if (!preview.length) {
          const fallback = uploadedJdText.trim() || jdTextForProcessing || buildJDTemplate();
          if (!fallback) {
            throw new Error('Add a job title and description before saving.');
          }
          preview = fallback;
          description = fallback;
          if (!generatedJD) {
            setGeneratedJD(fallback);
          }
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
    setProgress(5);
    setProcessingState('processing');
    setSortingBackground(false);
    clearSortingSession();
    stopSortingPoll();

  try {
      let preview = previewText.trim();
      let description = mode === 'upload' ? preview : generatedJD;

      // Build missing preview/description from available sources
      if (!preview.length) {
        const fallback = uploadedJdText.trim() || jdTextForProcessing || buildJDTemplate();
        preview = fallback.trim();
        if (!description) description = fallback;
        if (mode === 'create' && !generatedJD && fallback) {
          setGeneratedJD(fallback);
        }
      }

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
      if (!nextJobId) {
        throw new Error('Failed to create job before sorting.');
      }

      setProgress(35);
      updateSortingSession({
        jobId: nextJobId,
        background: false,
        lastProgress: 35,
        timestamp: Date.now(),
      });

      const response = await fetch(`/api/jobs/${nextJobId}/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topCandidates }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error ?? response.statusText ?? 'Failed to start sorting';
        throw new Error(message);
      }

      setProgress(55);
      const queueJobId = (payload?.queueJobId as string | undefined) ?? null;
      setSortingQueueJobId(queueJobId);
      updateSortingSession({
        jobId: nextJobId,
        queueJobId,
        background: sortingBackgroundRef.current,
        lastProgress: 55,
        timestamp: Date.now(),
      });
      pollSortingStatus(nextJobId, queueJobId);
    } catch (error) {
      setSubmitError((error as Error)?.message ?? 'Failed to create job');
      setProcessingState('error');
      stopSortingPoll();
      clearSortingSession();
    }
  };

  const startUploadQueue = async (jobIdOverride?: string | null) => {
    if (uploadingCv) return;
    setUploadError('');
    const totalFileCount = cvFiles.length + (zipFile ? 1 : 0);
    const sourceKey = `${jobIdOverride ?? jobId ?? 'no-job'}-${totalFileCount}-${zipFileName ?? 'no-zip'}`;
    uploadOverlay.showUpload(totalFileCount ? `Uploading ${totalFileCount} file${totalFileCount === 1 ? '' : 's'}` : 'Uploading files');
    uploadOverlay.updateProgress(1, undefined);

    let effectiveJobId = jobIdOverride ?? jobId;

    if (!effectiveJobId) {
      // Try to create a job automatically so uploads can proceed.
      try {
        let preview = previewText.trim();
        let description = mode === 'create' ? generatedJD || preview : preview;

        // Auto-build a minimal JD if user filled fields but hasn't generated one yet
        if (mode === 'create' && (!preview.length || !description)) {
          const template = buildJDTemplate();
          setGeneratedJD(template);
          preview = template;
          description = template;
        }

        if (!aiForm.title.trim() || !preview.length) {
          throw new Error('Add a job title and description before uploading.');
        }

        const createdId = await createJobInDb(preview, description || undefined);
        if (!createdId) {
          throw new Error('Failed to create job before upload.');
        }
        setJobId(createdId);
        effectiveJobId = createdId;
      } catch (error) {
        const message = (error as Error)?.message ?? 'Select or save a job first.';
        setUploadError(message);
        uploadOverlay.markError('Upload failed', message);
        return;
      }
    }

    if (!cvFiles.length && !zipFile) {
      setUploadError('Add CV files or a ZIP to upload.');
      uploadOverlay.markError('Upload failed', 'Add CV files or a ZIP to upload.');
      return;
    }

    const totalBytes =
      cvFiles.reduce((sum, file) => sum + file.size, 0) + (zipFile ? zipFile.size : 0);
    if (!totalBytes) {
      setUploadError('Nothing to upload.');
      return;
    }

    setUploadingCv(true);
    setUploadProgress(1);
    setUploadStatus('Starting uploads...');

    let completedBytes = 0;
    const uploadedNames: string[] = [];

    let queuedZip = false;
    try {
      for (const file of cvFiles) {
        setUploadStatus(`Uploading ${file.name}`);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobId', effectiveJobId);

        await uploadWithProgress('/api/jobs/upload-cv-file', formData, file.size, (loaded, _total) => {
          const percent = Math.min(99, ((completedBytes + loaded) / totalBytes) * 100);
          setUploadProgress(percent);
          uploadOverlay.updateProgress(percent, `Uploading ${file.name}`);
        });

        completedBytes += file.size;
        uploadedNames.push(file.name);
        setUploadProgress(Math.min(99, (completedBytes / totalBytes) * 100));
        uploadOverlay.updateProgress(Math.min(99, (completedBytes / totalBytes) * 100));
      }

      if (zipFile) {
        if (zipFile.size > 75 * 1024 * 1024) {
          throw new Error('ZIP must be 75MB or smaller.');
        }
        setUploadStatus(`Uploading ${zipFile.name}`);
        setZipUploading(true);
        const formData = new FormData();
        formData.append('file', zipFile);
        formData.append('jobId', effectiveJobId);

        const payload = await uploadWithProgress('/api/jobs/upload-cv-zip', formData, zipFile.size, (loaded, _total) => {
          const percent = Math.min(99, ((completedBytes + loaded) / totalBytes) * 100);
          setUploadProgress(percent);
          uploadOverlay.updateProgress(percent, `Uploading ${zipFile.name}`);
        });

        completedBytes += zipFile.size;
        setUploadProgress(Math.min(99, (completedBytes / totalBytes) * 100));
        uploadOverlay.updateProgress(Math.min(99, (completedBytes / totalBytes) * 100), 'Processing ZIP...');
        setZipUploading(false);

        if ((payload as { queueJobId?: string })?.queueJobId) {
          const expected = (payload as { expectedFiles?: number }).expectedFiles;
          uploadOverlay.trackQueueJob((payload as { queueJobId: string }).queueJobId, expected);
          queuedZip = true;
          setActiveQueueJobId((payload as { queueJobId: string }).queueJobId);
          void pollQueueJob((payload as { queueJobId: string }).queueJobId, effectiveJobId);
        } else {
          const names =
            Array.isArray((payload as { files?: unknown[] })?.files) && (payload as { files: { name?: string; key?: string }[] }).files.length
              ? (payload as { files: { name?: string; key?: string }[] }).files.map((item) => item.name || item.key || 'CV')
              : [zipFile.name];
          uploadedNames.push(...names);
        }
      }

      setUploadStatus('Finalizing...');
      setUploadProgress(100);
      setUploadedFiles((prev) => [...prev, ...uploadedNames]);
      setCvFiles([]);
      setZipFile(null);
      setZipFileName(null);
      if (!queuedZip) {
        uploadOverlay.markSuccess('Upload complete', uploadedNames.length ? `${uploadedNames.length} files uploaded` : undefined);
        showToast(`Uploaded ${uploadedNames.length} file${uploadedNames.length === 1 ? '' : 's'}`, 'success');
        if (effectiveJobId) {
          await fetchResumesForJob(effectiveJobId);
        }
      }
    } catch (error) {
      const message = (error as Error)?.message ?? 'Upload failed';
      setUploadError(message);
      setUploadStatus('Upload failed');
      setZipUploading(false);
      uploadOverlay.markError('Upload failed', message);
      showToast(message, 'error');
    } finally {
      setUploadingCv(false);
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  const stopResumeProcessingPoll = useCallback(() => {
    if (resumeProcessPollRef.current) {
      clearTimeout(resumeProcessPollRef.current);
      resumeProcessPollRef.current = null;
    }
  }, []);

  const updateResumeProcessSession = useCallback((updates: Partial<ResumeProcessingSession>) => {
    if (typeof window === 'undefined') return;
    try {
      const prevRaw = window.localStorage.getItem(RESUME_PROCESS_STORAGE_KEY);
      const prev: ResumeProcessingSession | null = prevRaw ? JSON.parse(prevRaw) : null;
      const next = { ...(prev || {}), ...updates };
      if (!next.jobId) return;
      window.localStorage.setItem(RESUME_PROCESS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to persist resume process session', error);
    }
  }, []);

  const clearResumeProcessSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(RESUME_PROCESS_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear resume process session', error);
    }
  }, []);

  const updateSortingSession = useCallback((updates: Partial<SortingProcessingSession>) => {
    if (typeof window === 'undefined') return;
    try {
      const prevRaw = window.localStorage.getItem(SORTING_PROCESS_STORAGE_KEY);
      const prev: SortingProcessingSession | null = prevRaw ? JSON.parse(prevRaw) : null;
      const next = { ...(prev || {}), ...updates };
      if (!next.jobId) return;
      window.localStorage.setItem(SORTING_PROCESS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to persist sorting session', error);
    }
  }, []);

  const clearSortingSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SORTING_PROCESS_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear sorting session', error);
    }
  }, []);

  const pollResumeProcessing = useCallback(
    (targetJobId: string, totalAtStart: number) => {
      stopResumeProcessingPoll();
      let attempts = 0;
      let stagnant = 0;
      let lastPending = totalAtStart;

      const poll = async () => {
        attempts += 1;
        try {
          const response = await fetch(`/api/jobs/${targetJobId}/resumes/summary`, { cache: 'no-store' });
          if (response.ok) {
            const payload = await response.json();
            const total = typeof payload?.total === 'number' ? payload.total : totalAtStart;
            const completed = typeof payload?.completed === 'number' ? payload.completed : 0;
            const pending =
              typeof payload?.pending === 'number'
                ? payload.pending
                : Math.max(0, total - completed);
            const processed = Math.max(0, total - pending);
            const percent = total ? Math.min(99, Math.max(15, (processed / total) * 100)) : 100;
            setResumeProcessProgress(percent);
            updateResumeProcessSession({
              jobId: targetJobId,
              total: totalAtStart || total,
              lastProgress: percent,
            });

            if (pending === lastPending && pending > 0) {
              stagnant += 1;
            } else {
              stagnant = 0;
            }
            lastPending = pending;

            if (pending <= 0 && completed >= total) {
              setResumeProcessProgress(100);
              setResumeProcessingState('complete');
              await fetchResumesForJob(targetJobId);
              stopResumeProcessingPoll();
              clearResumeProcessSession();
              return;
            }

            // Mark as stuck after ~2 minutes of no movement
            if (stagnant >= 50 || attempts >= 60) {
              setResumeProcessingState('error');
              setResumeProcessError('Processing is taking longer than expected. Please refresh or check worker logs.');
              stopResumeProcessingPoll();
              clearResumeProcessSession();
              return;
            }
          }
        } catch (error) {
          console.warn('Resume processing poll failed', error);
        }

        resumeProcessPollRef.current = setTimeout(poll, 2000);
      };

      poll();
    },
    [fetchResumesForJob, stopResumeProcessingPoll, updateResumeProcessSession, clearResumeProcessSession],
  );

  const openResumeProcessingModal = () => {
    const count = notProcessedCount;
    setResumeProcessCount(count);
    setResumeProcessProgress(count ? 5 : 0);
    setResumeProcessError('');
    setResumeProcessingState('confirm');
    setResumeProcessModalOpen(true);
    setResumeProcessBackground(false);
  };

  const closeResumeProcessingModal = () => {
    stopResumeProcessingPoll();
    setResumeProcessingState('idle');
    setResumeProcessProgress(0);
    setResumeProcessError('');
    setResumeProcessModalOpen(false);
    setResumeProcessBackground(false);
    clearResumeProcessSession();
  };

  // Hide the dialog but keep processing + polling running (used for "Run in background")
  const minimizeResumeProcessingModal = () => {
    setResumeProcessModalOpen(false);
  };

  const confirmResumeProcessing = async () => {
    if (!jobId) {
      setResumeProcessError('Select or create a job before processing resumes.');
      setResumeProcessingState('error');
      setResumeProcessModalOpen(true);
      return;
    }

    const pending = notProcessedCount;
    if (!pending) {
      setResumeProcessError('No unprocessed resumes found for this job.');
      setResumeProcessingState('error');
      return;
    }

    setResumeProcessCount(pending);
    setResumeProcessProgress(Math.max(10, resumeProcessProgress || 10));
    setResumeProcessError('');
    setResumeProcessingState('processing');
    setResumeProcessBackground(false);
    updateResumeProcessSession({
      jobId,
      total: pending,
      background: false,
      lastProgress: Math.max(10, resumeProcessProgress || 10),
      timestamp: Date.now(),
    });

    try {
      const response = await fetch(`/api/jobs/${jobId}/resumes/process`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error ?? response.statusText ?? 'Failed to start processing';
        throw new Error(message);
      }

      setResumeProcessProgress(Math.min(30, resumeProcessProgress || 30));
      updateResumeProcessSession({
        lastProgress: Math.min(30, resumeProcessProgress || 30),
      });
      await fetchResumesForJob(jobId);
      pollResumeProcessing(jobId, pending);
    } catch (error) {
      setResumeProcessError((error as Error)?.message ?? 'Failed to start processing');
      setResumeProcessingState('error');
    }
  };

  const stopSortingPoll = useCallback(() => {
    if (sortingPollRef.current) {
      clearTimeout(sortingPollRef.current);
      sortingPollRef.current = null;
    }
  }, []);

  const pollSortingStatus = useCallback(
    (targetJobId: string, queueId?: string | null) => {
      stopSortingPoll();
      let stagnant = 0;

      const poll = async () => {
        try {
          const query = queueId ? `?queueJobId=${encodeURIComponent(queueId)}` : '';
          const response = await fetch(`/api/jobs/${targetJobId}/sort${query}`, { cache: 'no-store' });
          if (response.ok) {
            const payload = await response.json();
            const state = (payload?.sortingState as string | undefined)?.toUpperCase?.() || 'NOT_STARTED';
            const queueStatus = (payload?.queueStatus as string | undefined)?.toLowerCase?.() || null;

            if (queueStatus === 'failed' || state === 'ERROR') {
              setSubmitError('Sorting job failed. Please try again.');
              setProcessingState('error');
              setSortingBackground(false);
              clearSortingSession();
              stopSortingPoll();
              return;
            }

            if (state === 'COMPLETED') {
              setProgress(100);
              setProcessingState('complete');
              setSortingBackground(false);
              updateSortingSession({
                jobId: targetJobId,
                queueJobId: queueId ?? undefined,
                background: false,
                lastProgress: 100,
                timestamp: Date.now(),
              });
              clearSortingSession();
              stopSortingPoll();
              return;
            }

            const nextProgress =
              queueStatus === 'completed'
                ? 95
                : queueStatus === 'active'
                  ? 75
                  : 55 + Math.min(30, stagnant * 2);
            setProgress((prev) => {
              const value = Math.max(prev, Math.min(95, nextProgress));
              updateSortingSession({
                jobId: targetJobId,
                queueJobId: queueId ?? undefined,
                background: sortingBackgroundRef.current,
                lastProgress: value,
                timestamp: Date.now(),
              });
              return value;
            });
            stagnant += 1;
          }
        } catch (error) {
          console.warn('Sorting status poll failed', error);
        }

        sortingPollRef.current = setTimeout(poll, 2000);
      };

      poll();
    },
    [stopSortingPoll, updateSortingSession, clearSortingSession],
  );

  const runSortingInBackground = () => {
    if (processingState === 'processing') {
      setShowConfirmation(false);
      setSortingBackground(true);
      if (jobId) {
        updateSortingSession({
          jobId,
          queueJobId: sortingQueueJobId ?? undefined,
          background: true,
          lastProgress: progress || 0,
          timestamp: Date.now(),
        });
      }
    }
  };

  const openSortingOverlay = () => {
    setShowConfirmation(true);
    setSortingBackground(false);
  };

  useEffect(() => {
    sortingBackgroundRef.current = sortingBackground;
  }, [sortingBackground]);

  useEffect(() => {
    return () => {
      stopResumeProcessingPoll();
    };
  }, [stopResumeProcessingPoll]);

  useEffect(() => {
    return () => {
      stopSortingPoll();
    };
  }, [stopSortingPoll]);

  useEffect(() => {
    if (processingState === 'complete' || processingState === 'error') {
      stopSortingPoll();
      clearSortingSession();
      setSortingBackground(false);
      setSortingQueueJobId(null);
      return;
    }
    if (processingState === 'idle') {
      stopSortingPoll();
    }
  }, [processingState, stopSortingPoll, clearSortingSession]);

  // Keep background flag and storage aligned with processing lifecycle
  useEffect(() => {
    if (resumeProcessingState === 'complete' || resumeProcessingState === 'error' || resumeProcessingState === 'idle') {
      setResumeProcessBackground(false);
      clearResumeProcessSession();
    }
  }, [resumeProcessingState, clearResumeProcessSession]);

  useEffect(() => {
    if (resumeProcessingState === 'processing' && jobId) {
      updateResumeProcessSession({
        jobId,
        background: resumeProcessBackground,
      });
    }
  }, [resumeProcessBackground, resumeProcessingState, jobId, updateResumeProcessSession]);

  useEffect(() => {
    if (processingState !== 'processing' || !jobId) return;
    updateSortingSession({
      jobId,
      queueJobId: sortingQueueJobId ?? undefined,
      background: sortingBackground,
      lastProgress: progress || 0,
      timestamp: Date.now(),
    });
  }, [processingState, jobId, sortingQueueJobId, sortingBackground, progress, updateSortingSession]);

  // On load, restore an in-flight processing session (e.g., after reload)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RESUME_PROCESS_STORAGE_KEY);
      if (!raw) return;
      const session = JSON.parse(raw) as ResumeProcessingSession;
      if (!session?.jobId) return;

      // Restore job and progress state
      setJobId((prev) => prev ?? session.jobId);
      setResumeProcessCount(session.total ?? 0);
      setResumeProcessProgress(session.lastProgress ?? 15);
      setResumeProcessingState('processing');
      setResumeProcessModalOpen(false);
      setResumeProcessBackground(session.background ?? true);

      // Resume polling to get live progress
      pollResumeProcessing(session.jobId, (session.total ?? notProcessedCount) || 1);
    } catch (error) {
      console.warn('Failed to restore resume processing session', error);
    }
  }, [pollResumeProcessing, notProcessedCount, setJobId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SORTING_PROCESS_STORAGE_KEY);
      if (!raw) return;
      const session = JSON.parse(raw) as SortingProcessingSession;
      if (!session?.jobId) return;

      setJobId((prev) => prev ?? session.jobId);
      setSortingQueueJobId(session.queueJobId ?? null);
      setProgress(Math.max(5, session.lastProgress ?? 10));
      setProcessingState('processing');
      setShowConfirmation(false);
      setSortingBackground(session.background ?? true);

      pollSortingStatus(session.jobId, session.queueJobId);
    } catch (error) {
      console.warn('Failed to restore sorting session', error);
    }
  }, [pollSortingStatus, setJobId]);

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
    cvFiles,
    zipFileName,
    zipUploadError,
    zipUploading,
    uploadingCv,
    uploadProgress,
    uploadStatus,
    uploadError,
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
    minEducation,
    setMinEducation,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    nationality,
    setNationality,
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
    sortingQueueJobId,
    sortingBackground,
    openSortingOverlay,
    runSortingInBackground,
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
    handleDropFiles,
    handleZipUpload,
    startUploadQueue,
    handleRemoveFile,
    handleCloseOverlay,
    handleSaveDraft,
    handleConfirmRun,
    previewText,
    hydrateFromQuery,
    fetchResumesForJob,
    refreshingResumes,
    uploadedResumes,
    notProcessedCount,
    processedResumeCount,
    resumeProcessModalOpen,
    resumeProcessingState,
    resumeProcessProgress,
    resumeProcessError,
    resumeProcessCount,
    resumeProcessBackground,
    openResumeProcessingModal,
    closeResumeProcessingModal,
    minimizeResumeProcessingModal,
    setResumeProcessBackground,
    confirmResumeProcessing,
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
