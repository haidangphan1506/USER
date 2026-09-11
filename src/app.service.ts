import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConsumer } from './features/rabbitmq/rabbitmq.consumer';
import { RabbitMQProducer } from './features/rabbitmq/rabbitmq.producer';

const HEALTH_CHECK_ROUTING_KEY = 'health.check';
const HEALTH_CHECK_QUEUE = 'app.health-check';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly rabbitMQProducer: RabbitMQProducer,
    private readonly rabbitMQConsumer: RabbitMQConsumer,
  ) {}

  async onModuleInit() {
    await this.rabbitMQConsumer.subscribe<{ publishedAt: string }>(
      HEALTH_CHECK_ROUTING_KEY,
      HEALTH_CHECK_QUEUE,
      (payload) => {
        this.logger.log(`Health-check message received: ${JSON.stringify(payload)}`);
      },
    );
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getRabbitMqService(): Promise<{ status: string; publishedAt: string }> {
    const publishedAt = new Date().toISOString();
    await this.rabbitMQProducer.publish(HEALTH_CHECK_ROUTING_KEY, { publishedAt });

    return { status: 'ok', publishedAt };
  }
}
