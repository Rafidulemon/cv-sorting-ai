import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { fallbackCurrencyOptions, fallbackEmploymentTypeOptions, fallbackExperienceOptions } from "@/app/constants/jobCreation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const options = await prisma.jobOption.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { value: "asc" }],
    });

    const experienceLevels = options
      .filter((item) => item.category === "EXPERIENCE_LEVEL")
      .map((item) => item.value);
    const employmentTypes = options
      .filter((item) => item.category === "EMPLOYMENT_TYPE")
      .map((item) => item.value);
    const currencies = options.filter((item) => item.category === "CURRENCY").map((item) => item.value);

    return NextResponse.json({
      experienceLevels: experienceLevels.length ? experienceLevels : fallbackExperienceOptions,
      employmentTypes: employmentTypes.length ? employmentTypes : fallbackEmploymentTypeOptions,
      currencies: currencies.length ? currencies : fallbackCurrencyOptions,
    });
  } catch (error) {
    console.error("[jobs/options] Failed to load options", error);
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
