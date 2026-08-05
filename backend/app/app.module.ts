import { Module } from '@nestjs/common';
import { AdminSupportModule } from '../modules/admin-support';
import { AnalyticsModule } from '../modules/analytics';
import { AuditModule } from '../modules/audit';
import { AvailabilityModule } from '../modules/availability';
import { BookingModule } from '../modules/booking';
import { FraudSignalsModule } from '../modules/fraud-signals';
import { IdentityModule } from '../modules/identity';
import { MapsModule } from '../modules/maps';
import { MessagingModule } from '../modules/messaging';
import { NotificationsModule } from '../modules/notifications';
import { OnDemandModule } from '../modules/on-demand';
import { PaymentsModule } from '../modules/payments';
import { PortfolioMediaModule } from '../modules/portfolio-media';
import { PresenceModule } from '../modules/presence';
import { ProfessionalsModule } from '../modules/professionals';
import { ReviewsModule } from '../modules/reviews';
import { SchedulingModule } from '../modules/scheduling';
import { SearchModule } from '../modules/search';
import { UsersModule } from '../modules/users';
import { VerificationModule } from '../modules/verification';
import { VisitLifecycleModule } from '../modules/visit-lifecycle';

/**
 * Composition root of the modular monolith (Sprint 1 · T1.1.2).
 * Wires every bounded context into a single deployable. Modules are FOLDERS, not services
 * (Engineering Constitution). This root is the only place modules are assembled.
 */
@Module({
  imports: [
    AdminSupportModule,
    AnalyticsModule,
    AuditModule,
    AvailabilityModule,
    BookingModule,
    FraudSignalsModule,
    IdentityModule,
    MapsModule,
    MessagingModule,
    NotificationsModule,
    OnDemandModule,
    PaymentsModule,
    PortfolioMediaModule,
    PresenceModule,
    ProfessionalsModule,
    ReviewsModule,
    SchedulingModule,
    SearchModule,
    UsersModule,
    VerificationModule,
    VisitLifecycleModule,
  ],
})
export class AppModule {}
