import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { fallbackCurrencyOptions, fallbackEmploymentTypeOptions, fallbackExperienceOptions } from "@/app/constants/jobCreation";

export const dynamic = "force-dynamic";

function dedupe(values: Array<string | null | undefined>) {
  const unique = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || unique.has(trimmed)) continue;
    unique.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export async function GET() {
  try {
    const [seniorityRows, employmentRows, currencyRows] = await Promise.all([
      prisma.job.findMany({
        where: { seniority: { not: null } },
        select: { seniority: true },
        distinct: ["seniority"],
        orderBy: { seniority: "asc" },
      }),
      prisma.job.findMany({
        where: { employmentType: { not: null } },
        select: { employmentType: true },
        distinct: ["employmentType"],
        orderBy: { employmentType: "asc" },
      }),
      prisma.job.findMany({
        where: { currency: { not: null } },
        select: { currency: true },
        distinct: ["currency"],
        orderBy: { currency: "asc" },
      }),
    ]);

    const experienceLevels = dedupe([
      ...seniorityRows.map((job) => job.seniority),
      ...fallbackExperienceOptions,
    ]);
    const employmentTypes = dedupe([
      ...employmentRows.map((job) => job.employmentType),
      ...fallbackEmploymentTypeOptions,
    ]);
    const currencies = dedupe([...currencyRows.map((job) => job.currency), ...fallbackCurrencyOptions]);

    return NextResponse.json({
      experienceLevels,
      employmentTypes,
      currencies,
    });
  } catch (error) {
    console.error("[jobs/options] Failed to load options from Job table", error);
    return NextResponse.json(
      {
        experienceLevels: fallbackExperienceOptions,
        employmentTypes: fallbackEmploymentTypeOptions,
        currencies: fallbackCurrencyOptions,
      },
      { status: 200 },
    );
  }
}
