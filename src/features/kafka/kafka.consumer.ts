import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Consumer, KafkaMessage } from 'kafkajs';

import { KafkaService } from './kafka.service';

export type KafkaMessageHandler<T = unknown> = (
  payload: T,
  message: KafkaMessage,
) => Promise<void> | void;

@Injectable()
export class KafkaConsumer implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumer.name);
  private readonly consumers: Consumer[] = [];

  constructor(private readonly kafkaService: KafkaService) {}

  async subscribe<T = unknown>(
    topic: string,
    groupId: string,
    handler: KafkaMessageHandler<T>,
  ) {
    const consumer = this.kafkaService.getClient().consumer({ groupId });
    this.consumers.push(consumer);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic: receivedTopic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value?.toString() ?? '') as T;
          await handler(payload, message);
          this.logger.log(
            `[Consume OK] topic=${receivedTopic} partition=${partition}`,
          );
        } catch (error) {
          this.logger.error(
            `[Consume FAILED] topic=${receivedTopic} partition=${partition} - ${(error as Error).message}`,
            (error as Error).stack,
          );
        }
      },
    });

    this.logger.log(`Subscribed topic=${topic} group=${groupId}`);
  }

  async onModuleDestroy() {
    await Promise.all(
      this.consumers.map((consumer) => consumer?.disconnect()),
    );
  }
}