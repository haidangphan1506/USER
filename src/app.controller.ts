import { BadRequestException, Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaProducer } from './features/kafka/kafka.producer';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a simple health check response' })
  @SwaggerResponse({
    status: 200,
    description: 'Server is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('kafka.emit')
  emitRequestFromKafka(@Payload() data: unknown): void {
    this.logger.log(`[EMIT] kafka.ping <- gateway, payload=${JSON.stringify(data)}`);
  }

  @MessagePattern('kafka.ping')
  sendRequestFromKafka(@Payload() data: unknown): void {
    this.logger.log(`[EMIT] kafka.ping <- gateway, payload=${JSON.stringify(data)}`);
  }

  @MessagePattern('kafka.user.error')
  receivedError(@Payload() data: unknown): void {
    this.logger.log(`[SEND] kafka.ping <- gateway, payload=${JSON.stringify(data)}`);
    throw new BadRequestException('data from user failed ...');
  }

  @MessagePattern('kafka.user')
  async receivedMsgError(@Payload() data: unknown) {
    this.logger.log(`[SEND] kafka.ping <- gateway, payload=${JSON.stringify(data)}`);
    return await this.kafkaProducer.send<unknown, unknown>('kafka.tutor', data);
  }
}
