import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Message, Producer } from 'kafkajs';

import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private producer!: Producer;

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    this.producer = this.kafkaService.getClient().producer();
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
  }

  async send(topic: string, messages: Message[]) {
    try {
      await this.producer.send({ topic, messages });
      this.logger.log(`[Send OK] topic=${topic} messages=${messages.length}`);
    } catch (error) {
      this.logger.error(
        `[Send FAILED] topic=${topic} - ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}