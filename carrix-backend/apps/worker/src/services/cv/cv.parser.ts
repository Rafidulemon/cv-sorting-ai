import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { cleanText } from "../../utils/text-cleaner";

export type ParsedExperience = { role?: string; company?: string; dates?: string };
export type ParsedResume = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  skills: string[];
  experience: ParsedExperience[];
  education: string[];
  totalYears?: number | null;
  summary?: string;
};

@Injectable()
export class CvParser {
  private readonly logger = new Logger(CvParser.name);
  private readonly openai: OpenAI | null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async parse(text: string): Promise<{ parsedJson: ParsedResume; extractedFields: ParsedResume }> {
    const baseline = this.basicParse(text);
    const normalized = cleanText(text); // keep for the LLM prompt; baseline needs original newlines

    if (!this.openai) {
      const merged = this.mergeFields(baseline, baseline);
      return { parsedJson: merged, extractedFields: merged };
    }

    try {
      const prompt = [
        "Extract structured resume data as JSON with the following shape:",
        "{",
        '  "name": string,',
        '  "email": string | null,',
        '  "phone": string | null,',
        '  "skills": string[],',
        '  "experience": [{ "role": string, "company": string, "dates": string }],',
        '  "education": string[],',
        '  "totalYears": number | null',
        "}",
        "Use the resume text provided. Keep lists short and deduplicated. Dates can be free-form ranges.",
      ].join("\n");

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_PARSE_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You extract structured resume JSON. Keep answers terse and machine-friendly." },
          { role: "user", content: `${prompt}\n\nResume:\n${normalized.slice(0, 12000)}` },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const aiParsed = JSON.parse(raw) as ParsedResume;
      const merged = this.mergeFields(baseline, aiParsed);
      return { parsedJson: merged, extractedFields: merged };
    } catch (error) {
      this.logger.error(`AI parse failed: ${(error as Error).message}`);
      const merged = this.mergeFields(baseline, baseline);
      return { parsedJson: merged, extractedFields: merged };
    }
  }

  private mergeFields(base: ParsedResume, ai: ParsedResume): ParsedResume {
    const skills = Array.from(
      new Set([...(base.skills || []), ...(ai?.skills || [])].map((skill) => skill.trim()).filter(Boolean)),
    );
    return {
      name: ai?.name?.trim() || base.name,
      email: ai?.email ?? base.email ?? null,
      phone: ai?.phone ?? base.phone ?? null,
      skills,
      experience: ai?.experience?.length ? ai.experience : base.experience,
      education: ai?.education?.length ? ai.education : base.education,
      totalYears: ai?.totalYears ?? base.totalYears,
      summary: ai?.summary || base.summary,
    };
  }

  private basicParse(text: string): ParsedResume {
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    const lines = text.split(/\n+/).map((line) => line.trim());
    const probableName = this.pickName(lines, emailMatch?.[0], phoneMatch?.[0]);
    const skills = this.extractSkills(text);
    const experience = this.extractExperience(lines);
    const education = this.extractEducation(lines);
    const totalYears = this.estimateYears(text);

    return {
      name: probableName || undefined,
      email: emailMatch?.[0] ?? null,
      phone: phoneMatch?.[0] ?? null,
      skills,
      experience,
      education,
      totalYears,
      summary: text.slice(0, 240),
    };
  }

  private pickName(lines: string[], email?: string | null, phone?: string | null) {
    const ignored = new Set([email, phone]);
    for (const line of lines.slice(0, 6)) {
      const trimmed = line.replace(/[^a-zA-Z\s'-]/g, "").trim();
      if (!trimmed || trimmed.length > 80) continue;
      if (ignored.has(trimmed)) continue;
      if (trimmed.split(" ").length >= 2) return trimmed;
    }
    return null;
  }

  private extractSkills(text: string) {
    const skillHints = [
      "javascript",
      "typescript",
      "react",
      "node",
      "next.js",
      "aws",
      "docker",
      "kubernetes",
      "python",
      "java",
      "go",
      "c++",
      "c#",
      "sql",
      "graphql",
      "html",
      "css",
      "tailwind",
    ];

    const found = new Set<string>();
    for (const hint of skillHints) {
      const regex = new RegExp(`\\b${hint.replace(/[.+]/g, "\\$&")}\\b`, "i");
      if (regex.test(text)) found.add(hint);
    }
    return Array.from(found).sort();
  }

  private extractExperience(lines: string[]): ParsedExperience[] {
    const experience: ParsedExperience[] = [];
    for (const line of lines) {
      if (/experience/i.test(line) && line.length < 160) continue;
      if (/\d{4}\s*[-–]\s*\d{4}/.test(line) || /\d{4}\s*[-–]\s*Present/i.test(line)) {
        experience.push({ dates: line });
      }
    }
    return experience.slice(0, 6);
  }

  private extractEducation(lines: string[]) {
    return lines
      .filter((line) => /university|college|bachelor|master|phd|school/i.test(line))
      .slice(0, 4);
  }

  private estimateYears(text: string) {
    const match = text.match(/(\d+)\s*\+?\s*(years?|yrs?)/i);
    if (!match) return null;
    const years = Number.parseInt(match[1], 10);
    return Number.isFinite(years) ? years : null;
  }
}
