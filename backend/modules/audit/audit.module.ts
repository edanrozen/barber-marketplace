import { Module } from '@nestjs/common';

/**
 * Audit bounded context.
 *
 * This is an EMPTY module scaffold (Sprint 1, T1.1.2). Providers, controllers,
 * and internal logic are added in later sprints per this module's TDD.
 *
 * Boundary rule (Engineering Constitution): other modules access Audit only
 * through published contracts in packages/*, never by importing internals.
 */
@Module({})
export class AuditModule {}
