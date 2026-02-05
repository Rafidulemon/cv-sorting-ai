'use client';

import type { JobPromptFieldKey } from '@/app/constants/jobCreation';
import { FileText, Loader2 } from 'lucide-react';

type JobPromptField = {
  key: JobPromptFieldKey;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea' | 'select';
};

type CreateJobDescriptionProps = {
  aiStep: number;
  totalPromptSteps: number;
  isDetailsStep: boolean;
  currentField: JobPromptField | null;
  currentFieldType: 'text' | 'textarea' | 'select';
  aiForm: Record<JobPromptFieldKey, string>;
  errors: Record<JobPromptFieldKey, string>;
  experienceOptions: string[];
  employmentType: string;
  employmentTypeOptions: string[];
  locationsInput: string;
  openings: number;
  salaryMin: number | '';
  salaryMax: number | '';
  currency: string;
  currencyOptions: string[];
  minEducation: string;
  nationality: string;
  ageMin: number | '';
  ageMax: number | '';
  canSkipCurrent: boolean;
  isCurrentFieldValid: boolean;
  canSaveDraft: boolean;
  savingDraft: boolean;
  onAiChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onEmploymentTypeChange: (value: string) => void;
  onLocationsChange: (value: string) => void;
  onOpeningsChange: (value: number) => void;
  onSalaryMinChange: (value: number | '') => void;
  onSalaryMaxChange: (value: number | '') => void;
  onCurrencyChange: (value: string) => void;
  onMinEducationChange: (value: string) => void;
  onNationalityChange: (value: string) => void;
  onAgeMinChange: (value: number | '') => void;
  onAgeMaxChange: (value: number | '') => void;
};

export default function CreateJobDescription({
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
  minEducation,
  nationality,
  ageMin,
  ageMax,
  canSkipCurrent,
  isCurrentFieldValid,
  canSaveDraft,
  savingDraft,
  onAiChange,
  onNext,
  onSkip,
  onBack,
  onSaveDraft,
  onEmploymentTypeChange,
  onLocationsChange,
  onOpeningsChange,
  onSalaryMinChange,
  onSalaryMaxChange,
  onCurrencyChange,
  onMinEducationChange,
  onNationalityChange,
  onAgeMinChange,
  onAgeMaxChange,
}: CreateJobDescriptionProps) {
  return (
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
              className="rounded-full border border-[#DCE0E0] bg-[#F5F7FB] px-3 py-1.5 text-[#4B5563] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8] disabled:cursor-not-allowed cursor-pointer"
              onClick={onBack}
              disabled={aiStep === 0}
            >
              Back
            </button>
            {aiStep < totalPromptSteps - 1 && (
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 transition ${
                  isCurrentFieldValid
                    ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25 cursor-pointer'
                    : 'border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6] cursor-not-allowed'
                }`}
                onClick={onNext}
                disabled={!isCurrentFieldValid}
              >
                Next
              </button>
            )}
            {!isDetailsStep && (
              <button
                type="button"
                onClick={onSkip}
                disabled={!canSkipCurrent}
                className={`rounded-full px-3 py-1.5 transition ${
                  canSkipCurrent
                    ? 'border border-[#FFA500]/40 bg-[#FFF2E0] text-[#9A5B00] hover:border-[#FFA500]/60 hover:bg-[#FFE4C2] cursor-pointer'
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
                  onChange={(event) => onEmploymentTypeChange(event.target.value)}
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
                  onChange={(event) => onLocationsChange(event.target.value)}
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
                  onChange={(event) => onOpeningsChange(Number(event.target.value) || 1)}
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
                    onChange={(event) => onSalaryMinChange(event.target.value === '' ? '' : Number(event.target.value))}
                    className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                  />
                </label>
                <label className="space-y-1 text-[13px]">
                  <span className="font-medium text-[#181B31]">Salary max</span>
                  <input
                    type="number"
                    min={0}
                    value={salaryMax}
                    onChange={(event) => onSalaryMaxChange(event.target.value === '' ? '' : Number(event.target.value))}
                    className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                  />
                </label>
              </div>
              <label className="space-y-1 text-[13px]">
                <span className="font-medium text-[#181B31]">Currency</span>
                <select
                  value={currency}
                  onChange={(event) => onCurrencyChange(event.target.value)}
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
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[13px]">
                <span className="font-medium text-[#181B31]">Minimum education</span>
                <input
                  value={minEducation}
                  onChange={(event) => onMinEducationChange(event.target.value)}
                  placeholder="Any / Bachelor’s / Masters"
                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                />
              </label>
              <label className="space-y-1 text-[13px]">
                <span className="font-medium text-[#181B31]">Nationality</span>
                <input
                  value={nationality}
                  onChange={(event) => onNationalityChange(event.target.value)}
                  placeholder="Any / Bangladeshi / US Citizen"
                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[13px]">
                <span className="font-medium text-[#181B31]">Minimum age</span>
                <input
                  type="number"
                  min={0}
                  value={ageMin}
                  onChange={(event) => onAgeMinChange(event.target.value ? Number(event.target.value) : '')}
                  placeholder="e.g., 18"
                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                />
              </label>
              <label className="space-y-1 text-[13px]">
                <span className="font-medium text-[#181B31]">Maximum age</span>
                <input
                  type="number"
                  min={0}
                  value={ageMax}
                  onChange={(event) => onAgeMaxChange(event.target.value ? Number(event.target.value) : '')}
                  placeholder="e.g., 55"
                  className="w-full rounded-xl border border-[#DCE0E0] bg-[#F7F8FC] p-3 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
                />
              </label>
            </div>
          </div>
        ) : currentField ? (
          currentFieldType === 'textarea' ? (
            <textarea
              rows={5}
              value={aiForm[currentField.key]}
              onChange={(event) => onAiChange(event.target.value)}
              placeholder={currentField.placeholder}
              className="min-h-[160px] w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F8FC] p-4 text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:border-[#3D64FF]/60 focus:outline-none focus:ring-2 focus:ring-[#3D64FF]/20"
            />
          ) : currentFieldType === 'select' ? (
            <select
              value={aiForm[currentField.key]}
              onChange={(event) => onAiChange(event.target.value)}
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
              onChange={(event) => onAiChange(event.target.value)}
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
            onClick={onSaveDraft}
            disabled={!canSaveDraft || savingDraft}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              canSaveDraft && !savingDraft
                ? 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25 cursor-pointer'
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
  );
}
