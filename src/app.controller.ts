import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@packages/decorators';

@ApiTags('Health')
@Controller()
export class AppController {
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

  @Public()
  @Get('/rmq')
  @ApiOperation({
    summary: 'Health check RABBITMQ',
    description: 'Publishes a health-check message through RabbitMQ and confirms delivery',
  })
  @SwaggerResponse({
    status: 200,
    description: 'RabbitMQ publish succeeded',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        publishedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async getRabbitMqRes() {
    return await this.appService.getRabbitMqService();
  }
}
