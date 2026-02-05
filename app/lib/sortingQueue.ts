import { Queue, QueueEvents, type JobsOptions } from "bullmq";
import IORedis from "ioredis";

export type SortingJobData = {
  jobId: string;
  organizationId: string;
  userId?: string | null;
  topCandidates?: number | null;
};

const queueName = "cv-sorting";

let connection: IORedis | null = null;
let queue: Queue<SortingJobData> | null = null;
let events: QueueEvents | null = null;

function getConnection(): IORedis {
  if (connection) return connection;

  const url =
    process.env.LOCAL_REDIS_URL ||
    process.env.REDIS_URL ||
    (process.env.UPSTASH_REDIS_REST_URL
      ? process.env.UPSTASH_REDIS_REST_URL.replace("https://", "rediss://")
      : null);

  if (!url) {
    throw new Error("REDIS_URL is not configured for BullMQ");
  }

  connection = new IORedis(url, {
    maxRetriesPerRequest: null,
    tls: url.startsWith("rediss://") ? {} : undefined,
  });

  return connection;
}

export function getSortingQueue() {
  if (!queue) {
    queue = new Queue<SortingJobData>(queueName, {
      connection: getConnection(),
      prefix: process.env.QUEUE_PREFIX || "carrix",
    });
  }
  return queue;
}

export function getSortingEvents() {
  if (!events) {
    events = new QueueEvents(queueName, {
      connection: getConnection(),
      prefix: process.env.QUEUE_PREFIX || "carrix",
    });
  }
  return events;
}

export const sortingJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 10,
};
