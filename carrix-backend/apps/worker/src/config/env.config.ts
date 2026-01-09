export const WorkerConfig = () => ({
  worker: {
    port: Number(process.env.WORKER_PORT || 4001),
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  },
});

export type WorkerConfigType = ReturnType<typeof WorkerConfig>;
