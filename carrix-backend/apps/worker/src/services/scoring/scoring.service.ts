import { Injectable } from "@nestjs/common";

type ScoreInput = {
  resumeSkills: string[];
  jobSkills: string[];
  resumeEmbedding?: number[];
  jobEmbedding?: number[];
  totalYears?: number | null;
};

@Injectable()
export class ScoringService {
  async score(input: ScoreInput) {
    // Use pure embedding similarity against the job description as the primary score.
    const embeddingScore = this.calculateEmbeddingScore(input.resumeEmbedding, input.jobEmbedding);

    // If we can't compute similarity (missing embeddings), fall back to a neutral 0.5 so the CV still appears.
    const overall = Number.isFinite(embeddingScore) ? (embeddingScore as number) : 0.5;

    return {
      overallScore: Number(overall.toFixed(3)),
      breakdown: {
        embeddingScore,
      },
    };
  }

  private calculateSkillScore(resumeSkills: string[], jobSkills: string[]) {
    if (!jobSkills.length) return 0.5;
    const normalizedResume = new Set(resumeSkills.map((s) => s.toLowerCase()));
    const normalizedJob = jobSkills.map((s) => s.toLowerCase());
    const matches = normalizedJob.filter((skill) => normalizedResume.has(skill)).length;
    return Math.min(1, matches / Math.max(1, normalizedJob.length));
  }

  private calculateExperienceScore(totalYears?: number | null) {
    if (!Number.isFinite(totalYears)) return 0.5;
    const years = Math.max(0, Math.min(20, totalYears as number));
    return Math.min(1, years / 10);
  }

  private calculateEmbeddingScore(resumeEmbedding?: number[], jobEmbedding?: number[]) {
    if (!resumeEmbedding?.length || !jobEmbedding?.length) return null;
    const length = Math.min(resumeEmbedding.length, jobEmbedding.length);
    if (!length) return null;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < length; i += 1) {
      const a = resumeEmbedding[i] ?? 0;
      const b = jobEmbedding[i] ?? 0;
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }
    if (!normA || !normB) return null;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
