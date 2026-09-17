import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);
  private kafka!: Kafka;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const brokers = (this.configService.get<string>('KAFKA_BROKERS') ?? 'localhost:9092')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);

    if (brokers.length === 0) {
      throw new BadGatewayException('Kafka brokers not found ...');
    }

    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID') ?? 'gateway';

    this.kafka = new Kafka({ clientId, brokers });
    this.logger.log(`Kafka configured brokers=${brokers.join(',')}`);
  }

  getClient(): Kafka {
    return this.kafka;
  }
}