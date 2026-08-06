/**
 * @barber-marketplace/event-contracts
 * Versioned event envelope consumed by the event backbone (in-process bus + durable queue).
 * Populated in Epic E4 (T4.2.2). Concrete domain events are added by their owning modules.
 */
export * from './envelope';
