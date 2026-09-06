import { Injectable, Logger } from '@nestjs/common';
import { Options } from 'amqplib';

import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class RabbitMQProducer {
  private readonly logger = new Logger(RabbitMQProducer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(routingKey: string, payload: unknown, options?: Options.Publish) {
    const content = Buffer.from(JSON.stringify(payload));

    try {
      await this.rabbitMQService
        .getChannel()
        .publish(this.rabbitMQService.exchange, routingKey, content, {
          persistent: true,
          contentType: 'application/json',
          ...options,
        });

      this.logger.log(`[Publish OK] routingKey=${routingKey}`);
    } catch (error) {
      this.logger.error(
        `[Publish FAILED] routingKey=${routingKey} - ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
