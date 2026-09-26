import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { logLevel } from 'kafkajs';
import { KAFKA_PRODUCER } from './kafka.constants';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_PRODUCER,

        transport: Transport.KAFKA,

        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID ?? 'user-service',

            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),

            // Connection & request timeouts
            connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT ?? '10000'),
            requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT ?? '30000'),

            // Retry configuration with exponential backoff
            retries: {
              initialRetryTime: 100,
              maxRetryTime: Math.min(30000, 1000 * 5), // Cap at 5s
              multiplier: 2,
              randomizationFactor: 0.2,
              factor: 0.2,
            },
            // Reduce log noise
            logLevel: logLevel.WARN,
          },

          consumer: {
            groupId: process.env.KAFKA_GROUP_ID ?? 'user-service',

            // Session and rebalancing timeouts
            sessionTimeout: parseInt(process.env.KAFKA_SESSION_TIMEOUT ?? '30000'),
            rebalanceTimeout: parseInt(process.env.KAFKA_REBALANCE_TIMEOUT ?? '60000'),
            heartbeatInterval: parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL ?? '3000'),
          },
        },
      },
    ]),
  ],

  providers: [KafkaProducer, KafkaConsumer],

  exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}
