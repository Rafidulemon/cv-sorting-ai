import { Module } from "@nestjs/common";
import { CvProducer } from "./producers/cv.producer";
import { NotificationProducer } from "./producers/notification.producer";

@Module({
  providers: [CvProducer, NotificationProducer],
  exports: [CvProducer, NotificationProducer],
})
export class QueueModule {}
