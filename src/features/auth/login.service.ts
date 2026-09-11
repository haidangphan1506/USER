import { Injectable } from '@nestjs/common';
import type { JwtUserRole } from '@packages/helpers';
import { RabbitMQProducer } from '../rabbitmq/rabbitmq.producer';

export const LOGIN_SESSION_ROUTING_KEY = 'auth.login.session';

export interface LoginSessionEvent {
  userId: string;
  email: string;
  role: JwtUserRole;
  accessToken: string;
  ttlSeconds: number;
  loggedInAt: string;
}

@Injectable()
export class LoginService {
  constructor(private readonly rabbitMQProducer: RabbitMQProducer) {}

  /** Publishes the login session to RabbitMQ so third-service can cache it in Redis. */
  async cacheLoginSessionService(payload: Omit<LoginSessionEvent, 'loggedInAt'>): Promise<void> {
    const message: LoginSessionEvent = { ...payload, loggedInAt: new Date().toISOString() };

    try {
      // Best-effort: RabbitMQProducer already logs pass/fail; a broker outage must not fail login.
      await this.rabbitMQProducer.publish(LOGIN_SESSION_ROUTING_KEY, message);
    } catch {
      /* swallow */
    }
  }
}
