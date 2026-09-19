import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KAFKA_PRODUCER, KAFKA_REQUEST_TOPICS } from './kafka.constants';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(KAFKA_PRODUCER) private readonly client: ClientKafka) {}

  async onModuleInit() {
    KAFKA_REQUEST_TOPICS.forEach((topic) => this.client.subscribeToResponseOf(topic));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  emit<T>(topic: string, message: T) {
    return firstValueFrom(this.client.emit(topic, message));
  }

  send<TResponse, TRequest>(topic: string, message: TRequest) {
    return firstValueFrom(this.client.send<TResponse, TRequest>(topic, message));
  }
}
