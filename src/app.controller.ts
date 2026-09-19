import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

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

  @EventPattern('kafka.ping')
  receivedRequestFromKafka(@Payload() data: unknown): void {
    this.logger.log(`[EMIT] kafka.ping <- gateway, payload=${JSON.stringify(data)}`);
  }

  @MessagePattern('kafka.echo')
  echoRequestFromKafka(@Payload() data: string): { echo: string; receivedAt: string } {
    this.logger.log(`[SEND] kafka.echo <- gateway, payload=${JSON.stringify(data)}`);
    const result = { echo: data, receivedAt: new Date().toISOString() };
    this.logger.log(`[SEND] kafka.echo -> gateway reply, result=${JSON.stringify(result)}`);
    return result;
  }
}
