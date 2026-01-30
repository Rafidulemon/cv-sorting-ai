"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  FileUp,
  LinkIcon,
  Plus,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { ApiJob, JobSummary } from "../../data";
import { mapJobToSummary } from "../../data";
import { useJobCreation } from "@/app/components/job/JobCreationProvider";

type SelectedJob = {
  id: string | null;
  title: string;
  status?: JobSummary["status"];
  owner?: string;
  updated?: string;
};

export default function UploadCandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const {
    goToRoleDetailsStep,
    uploadedFiles,
    cvFiles,
    handleUploadFiles,
    handleDropFiles,
    handleZipUpload,
    zipFileName,
    zipUploadError,
    zipUploading,
    uploadingCv,
    uploadProgress,
    uploadStatus,
    uploadError,
    startUploadQueue,
    driveLink,
    setDriveLink,
    topCandidates,
    setTopCandidates,
    costUsage,
    canStartSorting,
    setShowConfirmation,
    setProcessingState,
    setProgress,
    setSubmitError,
    setCreatedJobId,
    hydrateFromQuery,
    jobId,
    setJobId,
    aiForm,
    setAiForm,
  } = useJobCreation();

  const [selectedJobId, setSelectedJobId] = useState(jobId ?? "");
  const [apiJobs, setApiJobs] = useState<Record<string, ApiJob>>({});
  const [jobOptions, setJobOptions] = useState<JobSummary[]>([]);
  const effectiveSelectedId = selectedJobId || jobId || "";

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    const jobIdParam = searchParams.get("jobId");
    const titleParam = searchParams.get("title");
    hydrateFromQuery(sectionParam, jobIdParam, titleParam);
  }, [hydrateFromQuery, searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) return;
        const payload = await response.json();
        const fetched = Array.isArray(payload?.jobs)
          ? (payload.jobs as ApiJob[])
          : [];
        setJobOptions(fetched.map(mapJobToSummary));
        setApiJobs(
          fetched.reduce<Record<string, ApiJob>>((acc, job) => {
            if (job.id) acc[job.id] = job;
            return acc;
          }, {})
        );
      } catch {
        // ignore network errors for this ancillary load
      }
    };

    fetchJobs();
  }, []);

  const selectedJob = useMemo<SelectedJob | null>(() => {
    const apiJob = effectiveSelectedId ? apiJobs[effectiveSelectedId] : null;
    const apiOwner = apiJob?.createdBy?.name || apiJob?.createdBy?.email || undefined;
    const found = effectiveSelectedId ? jobOptions.find((job) => job.id === effectiveSelectedId) : null;

    if (effectiveSelectedId) {
      const updated =
        found?.updated ??
        (apiJob?.updatedAt ? new Date(apiJob.updatedAt).toLocaleString() : undefined);
      return {
        id: found?.id ?? effectiveSelectedId,
        title: found?.title ?? apiJob?.title ?? 'Untitled role',
        status: found?.status,
        owner: apiOwner ?? found?.owner ?? undefined,
        updated,
      };
    }

    if (jobId || aiForm.title.trim()) {
      return {
        id: jobId ?? null,
        title: aiForm.title.trim() || "Untitled role",
        status: jobId ? "Draft" : undefined,
        owner: apiOwner ?? undefined,
        updated: "Just now",
      };
    }

    return null;
  }, [aiForm.title, apiJobs, effectiveSelectedId, jobId, jobOptions]);

  const handleSelectJob = (nextId: string) => {
    setSelectedJobId(nextId);
    if (nextId) {
      const found = jobOptions.find((job) => job.id === nextId);
      setJobId(nextId);
      if (found?.title) {
        setAiForm((prev) => ({ ...prev, title: found.title }));
      }
    } else {
      setJobId(null);
    }
  };

  const handleNavigateToCraft = () => {
    router.push("/jobs/new");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const uploadOverlay =
    (uploadingCv || zipUploading || uploadProgress > 0) && (
      <div className="fixed bottom-6 right-6 z-[999] w-[320px] rounded-3xl border border-[#DCE0E0] bg-white/95 p-4 shadow-card-soft backdrop-blur">
        <div className="flex items-center justify-between text-sm font-semibold text-[#181B31]">
          <span>Uploading files</span>
          <span className="text-xs text-[#4B5563]">{Math.round(uploadProgress)}%</span>
        </div>
        <p className="mt-1 text-xs text-[#4B5563]">
          {uploadStatus || "Preparing upload..."}
        </p>
        <div className="mt-3 h-2 w-full rounded-full bg-[#E5E7EB]">
          <div
            className="h-2 rounded-full bg-[#3D64FF] transition-all"
            style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
          />
        </div>
      </div>
    );

  return (
    <div className="space-y-8 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-24 right-8 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[#3D64FF]/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/60 hover:bg-[#3D64FF]/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to jobs
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
              <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              Upload candidates
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
              Add your talent pool
            </h1>
            <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
              Drop CVs, upload a ZIP, or add a drive link. You can hop back to
              the role builder at any time to refine the JD.
            </p>
          </div>
          <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF]/90 p-5 text-sm text-[#4B5563] shadow-card-soft lg:w-[360px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
              Workflow progress
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>CVs queued</span>
                <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                  {uploadedFiles.length + cvFiles.length + (zipFileName ? 1 : 0) || 47}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Top candidates requested</span>
                <span className="rounded-full bg-[#3D64FF]/15 px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                  {topCandidates}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#8A94A6]">
              Sorting is staged—no progress lost when you switch pages.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {selectedJob ? (
          <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                  Selected job
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1 font-semibold text-[#1F2A44]">
                    <Briefcase className="h-3.5 w-3.5 text-[#3D64FF]" />
                    {selectedJob.title}
                  </span>
                  <span className="rounded-full bg-[#E8F2FF] px-3 py-1 text-xs font-semibold text-[#1C64F2]">
                    ID {selectedJob.id ?? "TBD"}
                  </span>
                  {selectedJob.status && (
                    <span className="rounded-full bg-[#FFF5E5] px-3 py-1 text-xs font-semibold text-[#A26B00]">
                      {selectedJob.status}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#8A94A6]">
                  <p>Created by {selectedJob.owner ?? "Unknown creator"}</p>
                  <p>Updated {selectedJob.updated ?? "Just now"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleNavigateToCraft}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit description
                </button>
                <button
                  type="button"
                  onClick={() => {
                    goToRoleDetailsStep();
                    handleNavigateToCraft();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit role details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                  Choose job
                </p>
                <h2 className="text-lg font-semibold text-[#181B31]">
                  Select where to upload
                </h2>
              </div>
            </div>
            <p className="mt-2 text-sm text-[#4B5563]">
              Arriving directly? Pick the job that should receive this intake.
              We&apos;ll surface its ID and status once selected.
            </p>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
                Recent jobs
              </label>
              <select
                value={effectiveSelectedId}
                onChange={(event) => handleSelectJob(event.target.value)}
                className="w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F9FC] px-4 py-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none"
              >
                <option value="">Select a job</option>
                {jobOptions.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#8A94A6]">
                Need a new role? Start a fresh draft and return here to upload.
              </div>
              <Link
                href="/jobs/new"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-2 text-sm font-semibold text-white shadow-[0_20px_45px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
              >
                <Plus className="h-4 w-4" />
                Create New Job
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-12 right-16 h-40 w-40 rounded-full bg-[#3D64FF]/15 blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#181B31]">
                    Candidate intake
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    Upload CVs or share a drive folder.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleNavigateToCraft}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Edit description
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goToRoleDetailsStep();
                      handleNavigateToCraft();
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Edit role details
                  </button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label
                  className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#DCE0E0] bg-[#FFFFFF] p-8 text-center text-sm text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (event.dataTransfer.files?.length) {
                      handleDropFiles(event.dataTransfer.files);
                    }
                  }}
                >
                  <FileUp className="h-10 w-10 text-[#3D64FF]" />
                  <div>
                    <p className="text-base font-semibold text-[#181B31]">
                      Drag &amp; drop CVs
                    </p>
                    <p className="mt-1 text-xs text-[#8A94A6]">
                      PDF, DOCX, or TXT up to 20MB each.
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleUploadFiles}
                  />
                </label>
                <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563]">
                  <p className="text-base font-semibold text-[#181B31]">
                    Upload a ZIP
                  </p>
                  <p className="mt-2 text-xs text-[#8A94A6]">
                    Bundle a folder of CVs. We&apos;ll unpack and deduplicate
                    automatically.
                  </p>
                  <label
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25 ${
                      zipUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                    }`}
                  >
                    <UploadCloud className="h-4 w-4" />
                    {zipUploading ? 'Uploading...' : 'Choose ZIP'}
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={handleZipUpload}
                      disabled={zipUploading}
                    />
                  </label>
                  {zipFileName && (
                    <p className="mt-4 rounded-2xl border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-2 text-xs font-medium text-[#3D64FF]">
                      {zipFileName}
                    </p>
                  )}
                  {zipUploadError && (
                    <p className="mt-3 rounded-2xl border border-[#FECACA] bg-[#FFF1F2] px-3 py-2 text-xs font-medium text-[#B42318]">
                      {zipUploadError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-medium text-[#B42318]">{uploadError}</div>
                <button
                  type="button"
                  onClick={() => startUploadQueue(selectedJob?.id ?? jobId)}
                  disabled={
                    uploadingCv ||
                    zipUploading ||
                    (!cvFiles.length && !zipFileName) ||
                    !(selectedJobId || jobId)
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    uploadingCv || zipUploading || (!cvFiles.length && !zipFileName)
                      ? 'cursor-not-allowed bg-[#DCE0E0] text-[#8A94A6]'
                      : 'bg-[#3D64FF] text-white shadow-sm hover:bg-[#2F53D6]'
                  }`}
                >
                  {uploadingCv || zipUploading ? (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload selected
                    </>
                  )}
                </button>
              </div>

              {(cvFiles.length > 0 || zipFileName) && (
                <div className="rounded-2xl border border-[#DCE0E0] bg-[#F8FAFF] p-4 text-xs text-[#4B5563]">
                  <p className="mb-2 font-semibold text-[#181B31]">Pending uploads</p>
                  <ul className="space-y-1">
                    {cvFiles.map((file) => (
                      <li key={file.name} className="flex justify-between">
                        <span>{file.name}</span>
                        <span className="text-[11px] text-[#8A94A6]">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </li>
                    ))}
                    {zipFileName && <li className="font-medium text-[#3D64FF]">{zipFileName}</li>}
                  </ul>
                </div>
              )}

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

          <div className="space-y-6">
            <div className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft backdrop-blur">
              <h3 className="text-lg font-semibold text-[#181B31]">
                Ranking configuration
              </h3>
              <p className="mt-1 text-sm text-[#4B5563]">
                Choose how many candidates to surface for the first pass. You
                can rerun with different limits whenever you like.
              </p>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#181B31]">
                      Number of top candidates
                    </span>
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
                    onChange={(event) =>
                      setTopCandidates(Number(event.target.value))
                    }
                    className="mt-4 w-full accent-[#3D64FF]"
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-[#8A94A6]">
                    {[10, 25, 50].map((mark) => (
                      <span key={mark}>{mark}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-4 text-xs text-[#4B5563]">
                  <p className="text-sm font-semibold text-[#181B31]">
                    Usage preview
                  </p>
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
                The AI will normalise each CV, score against your job factors,
                and provide reasoning for every recommendation.
              </p>
              <p className="text-xs text-[#8A94A6]">
                Not ready to sort yet? Save the job and kick off sorting from
                the Jobs list or job details later.
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
                  onClick={handleNavigateToCraft}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError("");
                    setCreatedJobId(null);
                    setShowConfirmation(true);
                    setProcessingState("idle");
                    setProgress(0);
                  }}
                  disabled={!canStartSorting}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    canStartSorting
                      ? "border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                      : "cursor-not-allowed border border-[#DCE0E0] bg-[#FFFFFF] text-[#8A94A6]"
                  }`}
                >
                  Start Sorting
                  <Sparkles className="h-4 w-4 text-[#3D64FF]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mounted && uploadOverlay ? createPortal(uploadOverlay, document.body) : null}
    </div>
  );
}
