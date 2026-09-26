export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';

/**
 * Topics used via `KafkaProducer.send()` (request-reply). `ClientKafka` only subscribes its
 * consumer to a topic's `<topic>.reply` once `subscribeToResponseOf(topic)` has been called
 * before `connect()` runs — add every request-reply topic here, or `.send()` throws "did not
 * subscribe to the corresponding reply topic". Fire-and-forget `emit()` topics don't need this.
 */
export const KAFKA_REQUEST_TOPICS: string[] = [
  'redis.get',
  'redis.set',
  'email.sendForgotPasswordMail',
  'tutor.test',
  'kafka.tutor',
];

/**
 * Every `@MessagePattern`/`@EventPattern` this service's own Kafka microservice consumes —
 * `ServerKafka` subscribes to these as topics on `startAllMicroservices()`, so they must exist
 * up front too (a handler without an explicit `transport` argument binds to every connected
 * microservice, Kafka included). Keep in sync with the actual decorators; there's no way to
 * derive this list at admin-connect time without booting the whole app first.
 */
export const KAFKA_SERVER_TOPICS: string[] = [
  'auth.register',
  'auth.login',
  'auth.loginByUserCode',
  'auth.refresh',
  'auth.forgotPassword',
  'auth.resetPassword',
  'auth.googleLogin',
  'auth.facebookLogin',
  'kafka.emit',
  'kafka.ping',
  'kafka.user',
  'kafka.user.error',
  'kafka.send',
  'health.postgres',
];

/**
 * Every Kafka topic this service touches, for `ensureKafkaTopics()` in `main.ts` to pre-create.
 * Covers the topics it hosts, the request topics it produces to, and their `.reply` counterparts
 * (what `subscribeToResponseOf` subscribes to).
 */
export const ALL_KAFKA_TOPICS: string[] = [
  ...KAFKA_SERVER_TOPICS,
  ...KAFKA_REQUEST_TOPICS,
  ...KAFKA_REQUEST_TOPICS.map((topic) => `${topic}.reply`),
];
