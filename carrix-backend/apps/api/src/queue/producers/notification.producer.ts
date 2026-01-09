export class NotificationProducer {
  async enqueueNotification(payload: Record<string, unknown>) {
    // TODO: connect to queue driver
    return { queued: true, payload };
  }
}
