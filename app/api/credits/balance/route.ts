import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder balance. Replace with real billing data source.
  const payload = {
    remaining: 126,
    total: 500,
    plan: "Scale",
    renewsOn: "2025-11-28",
  };

  return NextResponse.json(payload);
}
