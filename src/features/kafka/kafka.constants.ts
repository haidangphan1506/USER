export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';

/**
 * Topics used via `KafkaProducer.send()` (request-reply). `ClientKafka` only subscribes its
 * consumer to a topic's `<topic>.reply` once `subscribeToResponseOf(topic)` has been called
 * before `connect()` runs — add every request-reply topic here, or `.send()` throws "did not
 * subscribe to the corresponding reply topic". Fire-and-forget `emit()` topics don't need this.
 */
export const KAFKA_REQUEST_TOPICS: string[] = [];
