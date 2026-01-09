export class CvProducer {
  async enqueueCvProcessing(payload: Record<string, unknown>) {
    // TODO: wire up queue client (e.g., BullMQ, RabbitMQ)
    return { queued: true, payload };
  }
}
