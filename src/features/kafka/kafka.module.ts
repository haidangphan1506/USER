import { Global, Module } from '@nestjs/common';

import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  providers: [KafkaService, KafkaProducer, KafkaConsumer],
  exports: [KafkaService, KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}