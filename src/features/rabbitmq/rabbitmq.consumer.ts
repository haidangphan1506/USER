import { Injectable, Logger } from '@nestjs/common';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';

import { RabbitMQService } from './rabbitmq.service';

export type RabbitMQMessageHandler<T = unknown> = (
  payload: T,
  raw: ConsumeMessage,
) => Promise<void> | void;

@Injectable()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async subscribe<T = unknown>(
    routingKey: string,
    queueName: string,
    handler: RabbitMQMessageHandler<T>,
  ) {
    const channelWrapper = this.rabbitMQService.getChannel();

    await channelWrapper.addSetup(async (channel: ConfirmChannel) => {
      const { queue } = await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queue, this.rabbitMQService.exchange, routingKey);

      await channel.consume(queue, (msg) => {
        if (!msg) return;

        void (async () => {
          try {
            const payload = JSON.parse(msg.content.toString()) as T;
            await handler(payload, msg);
            channel.ack(msg);
            this.logger.log(`[Consume OK] queue=${queue} routingKey=${routingKey}`);
          } catch (error) {
            this.logger.error(
              `[Consume FAILED] queue=${queue} routingKey=${routingKey} - ${(error as Error).message}`,
              (error as Error).stack,
            );
            channel.nack(msg, false, false);
          }
        })();
      });
    });

    this.logger.log(`Subscribed queue=${queueName} routingKey=${routingKey}`);
  }
}
