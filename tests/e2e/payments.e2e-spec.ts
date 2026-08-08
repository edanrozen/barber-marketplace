/**
 * Payments e2e (Jest + Supertest). REAL-ENV: requires npm install and a test Postgres with
 * migrations 0001-0007 + seeds applied. Books a slot, then asserts a cash payment was created.
 */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IdentityModule } from '../../backend/modules/identity';
import { UsersModule } from '../../backend/modules/users';
import { ProfessionalsModule } from '../../backend/modules/professionals';
import { AvailabilityModule } from '../../backend/modules/availability';
import { BookingModule } from '../../backend/modules/booking';
import { NotificationsModule } from '../../backend/modules/notifications';
import { PaymentsModule } from '../../backend/modules/payments';
import { SMS_SENDER } from '../../backend/modules/identity/ports/ports';
import { configureApp } from '../../backend/common';

class CapturingSmsSender {
  lastCode: string | null = null;
  async send(_p: string, m: string): Promise<void> { const x = m.match(/(\d{6})/); this.lastCode = x ? x[1]! : null; }
}

describe('Payments (e2e)', () => {
  let app: INestApplication;
  const sms = new CapturingSmsSender();
  let token = '';
  let bookingId = '';
  const auth = (): [string, string] => ['Authorization', `Bearer ${token}`];

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [IdentityModule, UsersModule, ProfessionalsModule, AvailabilityModule, BookingModule, NotificationsModule, PaymentsModule] })
      .overrideProvider(SMS_SENDER).useValue(sms).compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone: '054-999-4444' }).expect(200);
    const verify = await request(app.getHttpServer()).post('/v1/auth/otp/verify').send({ challengeId: req.body.challengeId, code: sms.lastCode }).expect(200);
    token = verify.body.tokens.accessToken;
    const list = await request(app.getHttpServer()).get('/v1/professionals').set(...auth()).expect(200);
    const professionalId = list.body.items[0].id;
    const detail = await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}`).set(...auth()).expect(200);
    const serviceId = detail.body.services[0].id;
    const avail = await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}/availability?serviceId=${serviceId}&days=7`).set(...auth()).expect(200);
    const day = avail.body.days.find((d: { slots: unknown[] }) => d.slots.length > 0);
    if (day) {
      const booking = await request(app.getHttpServer()).post('/v1/bookings').set(...auth()).send({ professionalId, serviceId, date: day.date, start: day.slots[0].start }).expect(201);
      bookingId = booking.body.id;
    }
  });
  afterAll(async () => { await app.close(); });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/v1/payments').expect(403);
  });

  it('creates a cash payment (pending) for the booking', async () => {
    const res = await request(app.getHttpServer()).get('/v1/payments').set(...auth()).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const payment = res.body.find((p: { bookingId: string }) => p.bookingId === bookingId);
    expect(payment).toBeDefined();
    expect(payment.method).toBe('cash');
    expect(payment.status).toBe('pending');
    expect(payment.amountMinorUnits).toBeGreaterThan(0);
  });
});
