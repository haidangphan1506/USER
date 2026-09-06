import {
  BadGatewayException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;
  readonly exchange: string;

  constructor(private readonly configService: ConfigService) {
    this.exchange = this.configService.get<string>('RABBITMQ_EXCHANGE') ?? 'app.events';
  }

  async onModuleInit() {
    const rabbitMqUrl = this.configService.get<string>('RABBITMQ_URL');
    if (!rabbitMqUrl || rabbitMqUrl === '')
      throw new BadGatewayException('RabbitMq url not found ...');

    this.connection = amqp.connect([rabbitMqUrl]);

    this.connection.on('connect', () => {
      this.logger.log('RabbitMQ connected');
    });

    this.connection.on('disconnect', ({ err }) => {
      this.logger.error('RabbitMQ disconnected', err?.stack);
    });

    this.channelWrapper = this.connection.createChannel({
      json: false,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(this.exchange, 'topic', { durable: true });
      },
    });

    await this.channelWrapper.waitForConnect();
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  getChannel(): ChannelWrapper {
    return this.channelWrapper;
  }
}
