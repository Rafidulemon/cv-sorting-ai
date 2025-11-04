'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileSearch, FileText, Loader2, UploadCloud, FileUp, LinkIcon } from 'lucide-react';
import Layout from '../../components/Layout';

type AiFieldKey = 'title' | 'responsibilities' | 'skills' | 'experienceLevel' | 'companyCulture';

const steps = [
  { id: 1, title: 'Job Description', description: 'Craft or upload the job specification.' },
  { id: 2, title: 'Candidate Upload', description: 'Provide CVs and configure the shortlist.' },
];

const aiFields: Array<{
  key: AiFieldKey;
  label: string;
  placeholder: string;
  helper?: string;
  type?: 'textarea' | 'select';
}> = [
  {
    key: 'title',
    label: 'Job Title',
    placeholder: 'e.g. Senior Backend Engineer',
  },
  {
    key: 'responsibilities',
    label: 'Key Responsibilities',
    placeholder: 'List responsibilities separated by a new line.',
    type: 'textarea',
  },
  {
    key: 'skills',
    label: 'Required Skills',
    placeholder: 'Comma separated list of must-have skills.',
    type: 'textarea',
  },
  {
    key: 'experienceLevel',
    label: 'Experience Level',
    placeholder: '',
    type: 'select',
  },
  {
    key: 'companyCulture',
    label: 'Company Culture',
    placeholder: 'Describe the culture, values, and working style.',
    type: 'textarea',
  },
];

const experienceOptions = ['Entry level', 'Mid-level', 'Senior', 'Lead', 'Director'];

export default function NewJobPage() {
  const [currentSection, setCurrentSection] = useState<'description' | 'upload'>('description');
  const [mode, setMode] = useState<'ai' | 'upload'>('ai');
  const [aiStep, setAiStep] = useState(0);
  const [aiForm, setAiForm] = useState<Record<AiFieldKey, string>>({
    title: '',
    responsibilities: '',
    skills: '',
    experienceLevel: 'Mid-level',
    companyCulture: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJD, setGeneratedJD] = useState('');
  const [uploadedJdFileName, setUploadedJdFileName] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [topCandidates, setTopCandidates] = useState(25);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const costUsage = useMemo(() => {
    const base = uploadedFiles.length || 47;
    return { consumed: base, total: 500 };
  }, [uploadedFiles.length]);

  const currentField = aiFields[aiStep];
  const canProceedToUpload =
    currentSection === 'description' &&
    (mode === 'ai' ? Boolean(generatedJD) : Boolean(uploadedJdFileName));

  const handleAiChange = (value: string) => {
    setAiForm((prev) => ({ ...prev, [currentField.key]: value }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    const formatList = (value: string) =>
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

    const template = [
      `${aiForm.title || 'Role TBD'}`,
      '',
      'Key Responsibilities:',
      ...formatList(aiForm.responsibilities).map((item) => `• ${item}`),
      '',
      'Required Skills:',
      ...formatList(aiForm.skills).map((item) => `• ${item}`),
      '',
      `Experience Level: ${aiForm.experienceLevel}`,
      '',
      'Company Culture & Environment:',
      aiForm.companyCulture || 'Add more context to tailor the AI screening.',
    ]
      .filter(Boolean)
      .join('\n');

    setTimeout(() => {
      setGeneratedJD(template);
      setIsGenerating(false);
    }, 700);
  };

  const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const names = Array.from(event.target.files).map((file) => file.name);
    setUploadedFiles((prev) => [...prev, ...names]);
  };

  const handleZipUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    setZipFileName(event.target.files[0].name);
  };

  const handleJdUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    setUploadedJdFileName(file.name);
    const fallbackContent = `${file.name} uploaded. AI summary will be available after parsing.`;
    setGeneratedJD(fallbackContent);
  };

  const handleNextSection = () => {
    if (currentSection === 'description') {
      setCurrentSection('upload');
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex items-center gap-3 text-sm text-gray-500">
        <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to dashboard
        </Link>
        <span>•</span>
        <span>Create New Job</span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-72">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Setup Progress</h2>
            <ol className="mt-4 space-y-6">
              {steps.map((step, index) => {
                const isActive = currentSection === 'description' ? index === 0 : index === 1;
                const isCompleted = currentSection === 'upload' && index === 0;
                return (
                  <li key={step.id} className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : isCompleted
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        <section className="flex-1 space-y-8">
          {currentSection === 'description' ? (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setMode('ai')}
                  className={`flex flex-col items-start rounded-xl border p-5 text-left ${
                    mode === 'ai'
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
                  }`}
                >
                  <FileSearch className="mb-4 h-6 w-6 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Generate with AI</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Answer a few questions and let the assistant draft a tailored job description.
                  </p>
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={`flex flex-col items-start rounded-xl border p-5 text-left ${
                    mode === 'upload'
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
                  }`}
                >
                  <FileText className="mb-4 h-6 w-6 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Upload your JD</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Already have a JD? Upload the document and move straight to candidate uploads.
                  </p>
                </button>
              </div>

              {mode === 'ai' ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary-600">Step {aiStep + 1} of {aiFields.length}</p>
                      <h2 className="mt-1 text-xl font-semibold text-gray-900">AI Job Description Builder</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Provide structured context so the assistant can craft a polished description.
                      </p>
                    </div>
                    {generatedJD && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Draft ready
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{currentField.label}</label>
                      {currentField.type === 'textarea' ? (
                        <textarea
                          value={aiForm[currentField.key]}
                          onChange={(event) => handleAiChange(event.target.value)}
                          className="mt-2 h-32 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          placeholder={currentField.placeholder}
                        />
                      ) : currentField.type === 'select' ? (
                        <select
                          value={aiForm[currentField.key]}
                          onChange={(event) => handleAiChange(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                          {experienceOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={aiForm[currentField.key]}
                          onChange={(event) => handleAiChange(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          placeholder={currentField.placeholder}
                          type="text"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        onClick={() => setAiStep((prev) => Math.max(prev - 1, 0))}
                        disabled={aiStep === 0}
                      >
                        Back
                      </button>
                      {aiStep === aiFields.length - 1 ? (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
                          onClick={handleGenerate}
                          disabled={isGenerating}
                        >
                          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Generate with AI
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
                          onClick={() => setAiStep((prev) => Math.min(prev + 1, aiFields.length - 1))}
                        >
                          Next question
                        </button>
                      )}
                    </div>
                  </div>

                  {generatedJD && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-700">AI Generated JD</label>
                      <textarea
                        className="mt-2 h-56 w-full resize-none rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        value={generatedJD}
                        onChange={(event) => setGeneratedJD(event.target.value)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50 p-10 text-center shadow-sm">
                  <UploadCloud className="mx-auto h-12 w-12 text-primary-500" />
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">Upload your job description</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop a .txt or .docx file, or select one from your device.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <label className="inline-flex cursor-pointer items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                      <FileUp className="mr-2 h-4 w-4" />
                      Select file
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        className="sr-only"
                        onChange={handleJdUpload}
                      />
                    </label>
                  </div>
                  {uploadedJdFileName && (
                    <p className="mt-4 text-sm text-primary-700">Uploaded: {uploadedJdFileName}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleNextSection}
                  disabled={!canProceedToUpload}
                  className="inline-flex items-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue to uploads
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Upload Candidate CVs</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Upload individual files, import a zip, or share a cloud folder. We will parse and deduplicate automatically.
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
                  <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50 p-8 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-primary-500" />
                    <h3 className="mt-3 text-base font-semibold text-gray-900">Drag & drop CVs</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Supports .pdf, .docx, and .txt. You can select multiple files at once.
                    </p>
                    <label className="mt-6 inline-flex cursor-pointer items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                      Add files
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        className="sr-only"
                        onChange={handleUploadFiles}
                      />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Upload a .zip archive</span>
                      <span className="text-xs text-gray-500">We will unpack and process every CV inside.</span>
                      <div className="mt-2 flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2">
                        <span className="text-xs text-gray-500">{zipFileName || 'No zip selected yet.'}</span>
                        <label className="inline-flex cursor-pointer items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
                          Browse
                          <input type="file" accept=".zip" className="sr-only" onChange={handleZipUpload} />
                        </label>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Google Drive folder link</span>
                      <span className="text-xs text-gray-500">Ensure the folder is shared with view access.</span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                          <LinkIcon className="h-5 w-5" />
                        </span>
                        <input
                          type="url"
                          value={driveLink}
                          onChange={(event) => setDriveLink(event.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-700">Files queued ({uploadedFiles.length})</p>
                    <ul className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                      {uploadedFiles.map((file) => (
                        <li key={file} className="truncate rounded-md bg-white px-3 py-2 shadow-sm">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Ranking Configuration</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose how many candidates to shortlist. You can always re-run with different settings.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Number of Top Candidates to Return</span>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
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
                      className="mt-4 w-full accent-primary-600"
                    />
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      {[10, 25, 50].map((mark) => (
                        <span key={mark}>{mark}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900">Usage preview</p>
                      <p className="text-xs text-gray-500">
                        Estimated credits consumed for this run.
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm">
                      {costUsage.consumed} of {costUsage.total} monthly CVs
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => setCurrentSection('description')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    onClick={() => setShowConfirmation(true)}
                  >
                    Start Sorting
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm run</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We&apos;ll rank all uploaded CVs against your job description. This action can take a few minutes.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmation(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-5">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>CVs queued</span>
                <span className="font-semibold text-gray-900">{uploadedFiles.length || 47}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Top candidates requested</span>
                <span className="font-semibold text-gray-900">{topCandidates}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Credits consumed</span>
                <span className="font-semibold text-primary-600">
                  {costUsage.consumed} of {costUsage.total}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <Link
                href="/results/job-1042"
                className="inline-flex items-center rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Confirm &amp; run
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
