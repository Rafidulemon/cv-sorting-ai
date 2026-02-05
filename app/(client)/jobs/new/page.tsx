'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import CreateJobDescription from '@/app/components/job/CreateJobDescription';
import PreviewDraft from '@/app/components/job/PreviewDraft';
import UploadDescription from '@/app/components/job/UploadDescription';
import { jobCreationSteps, useJobCreation } from '@/app/components/job/JobCreationProvider';

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    mode,
    setMode,
    aiStep,
    totalPromptSteps,
    isDetailsStep,
    currentField,
    currentFieldType,
    aiForm,
    errors,
    experienceOptions,
    employmentType,
    employmentTypeOptions,
    locationsInput,
    openings,
    salaryMin,
    salaryMax,
    currency,
    currencyOptions,
    canSkipCurrent,
    isCurrentFieldValid,
    canSaveDraft,
    savingDraft,
    handleAiChange,
    handleNext,
    handleSkip,
    handlePreviousStep,
    handleSaveDraft,
    setEmploymentType,
    setLocationsInput,
    setOpenings,
    setSalaryMin,
    setSalaryMax,
    setCurrency,
    generatedJD,
    uploadedJdFileName,
    draftJobId,
    draftError,
    handleDownloadDraft,
    handleShareLinkedIn,
    titleReady,
    jdUploadError,
    jdVirusScanQueued,
    jdProcessing,
    jdProcessingProgress,
    jdProcessingError,
    canProcessJd,
    isUploadingJd,
    uploadJobDescription,
    uploadedJdText,
    handleJdTextChange,
    processJobDescription,
    previewText,
    jobId,
    hydrateFromQuery,
    uploadedFiles,
    topCandidates,
    minEducation,
    setMinEducation,
    nationality,
    setNationality,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
  } = useJobCreation();

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const jobIdParam = searchParams.get('jobId');
    const titleParam = searchParams.get('title');
    hydrateFromQuery(sectionParam, jobIdParam, titleParam);
  }, [hydrateFromQuery, searchParams]);

  const canProceedToUpload =
    titleReady &&
    (mode === 'create' ? Boolean(generatedJD) : Boolean(uploadedJdFileName || uploadedJdText.trim()));

  const handleProceedToUploadPage = () => {
    const params = new URLSearchParams();
    if (jobId) {
      params.set('jobId', jobId);
    }
    const trimmedTitle = aiForm.title.trim();
    if (trimmedTitle) {
      params.set('title', trimmedTitle);
    }
    const query = params.toString();
    router.push(`/jobs/new/upload${query ? `?${query}` : ''}`);
  };

  return (
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
              Craft your role
            </h1>
            <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
              Guide the AI recruiter with rich job context. Once you&apos;re happy, move to the upload page to add
              candidates.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#8A94A6]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                Guided workflow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
                Step 1 of 2
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
        {jobCreationSteps.map((step) => {
          const isActive = step.key === 'description';
          const handleClick = () => {
            if (step.key === 'upload') {
              handleProceedToUploadPage();
            }
          };
          return (
            <button
              key={step.id}
              type="button"
              onClick={handleClick}
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
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  mode === 'create'
                    ? 'border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary'
                    : 'border-[#DCE0E0] bg-[#FFFFFF] text-[#4B5563] hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]'
                }`}
              >
                <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                Create Job Description
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

            {mode === 'create' ? (
              <CreateJobDescription
                aiStep={aiStep}
                totalPromptSteps={totalPromptSteps}
                isDetailsStep={isDetailsStep}
                currentField={currentField}
                currentFieldType={currentFieldType}
                aiForm={aiForm}
                errors={errors}
                experienceOptions={experienceOptions}
                employmentType={employmentType}
                employmentTypeOptions={employmentTypeOptions}
                locationsInput={locationsInput}
                openings={openings}
                salaryMin={salaryMin}
                salaryMax={salaryMax}
                currency={currency}
                currencyOptions={currencyOptions}
                minEducation={minEducation}
                nationality={nationality}
                ageMin={ageMin}
                ageMax={ageMax}
                canSkipCurrent={canSkipCurrent}
                isCurrentFieldValid={isCurrentFieldValid}
                canSaveDraft={canSaveDraft}
                savingDraft={savingDraft}
                onAiChange={handleAiChange}
                onNext={handleNext}
                onSkip={handleSkip}
                onBack={handlePreviousStep}
                onSaveDraft={handleSaveDraft}
                onEmploymentTypeChange={(value) => setEmploymentType(value)}
                onLocationsChange={(value) => setLocationsInput(value)}
                onOpeningsChange={(value) => setOpenings(value)}
                onSalaryMinChange={(value) => setSalaryMin(value)}
                onSalaryMaxChange={(value) => setSalaryMax(value)}
                onCurrencyChange={(value) => setCurrency(value)}
                onMinEducationChange={(value) => setMinEducation(value)}
                onNationalityChange={(value) => setNationality(value)}
                onAgeMinChange={(value) => setAgeMin(value)}
                onAgeMaxChange={(value) => setAgeMax(value)}
              />
            ) : (
              <UploadDescription
                isUploadingJd={isUploadingJd}
                jdUploadError={jdUploadError}
                uploadedJdFileName={uploadedJdFileName}
                jdVirusScanQueued={jdVirusScanQueued}
                jdProcessing={jdProcessing}
                jdProcessingProgress={jdProcessingProgress}
                jdProcessingError={jdProcessingError}
                canProcessJd={canProcessJd}
                uploadedJdText={uploadedJdText}
                onJdTextChange={handleJdTextChange}
                onUploadSelectedFile={uploadJobDescription}
                onProcessJd={processJobDescription}
              />
            )}
          </div>

          <div className="space-y-6">
            <PreviewDraft
              mode={mode}
              generatedJD={generatedJD}
              previewText={previewText}
              uploadedJdFileName={uploadedJdFileName}
              draftJobId={draftJobId}
              draftError={draftError}
              onDownloadDraft={handleDownloadDraft}
              onShareLinkedIn={handleShareLinkedIn}
            />

            <div className="flex flex-col gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Next step</p>
              <p className="text-sm text-[#4B5563]">
                Move to uploads once your description and role details feel complete. You can toggle back without losing any
                progress.
              </p>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleProceedToUploadPage}
                  disabled={!canProceedToUpload}
                  data-proceed-to-upload
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
      </section>
    </div>
  );
}
