import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)
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
  async receivedRequestFromKafka(
    @Payload() data: unknown,
  ) {
    this.logger.log(
      'Received from kafka in gateway :',
      data,
    );
  
   return await data
   }
}
