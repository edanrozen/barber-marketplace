/**
 * Booking e2e (Jest + Supertest). REAL-ENV: requires npm install and a test Postgres with
 * migrations 0001-0005 + seeds 0001/0002/0003 applied. Picks a real available slot from the
 * availability endpoint; assertions depend on the seeded hours yielding at least one upcoming slot.
 */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IdentityModule } from '../../backend/modules/identity';
import { UsersModule } from '../../backend/modules/users';
import { ProfessionalsModule } from '../../backend/modules/professionals';
import { AvailabilityModule } from '../../backend/modules/availability';
import { BookingModule } from '../../backend/modules/booking';
import { SMS_SENDER } from '../../backend/modules/identity/ports/ports';
import { configureApp } from '../../backend/common';

class CapturingSmsSender {
  lastCode: string | null = null;
  async send(_phone: string, message: string): Promise<void> {
    const m = message.match(/(\d{6})/);
    this.lastCode = m ? m[1]! : null;
  }
}

describe('Booking (e2e)', () => {
  let app: INestApplication;
  const sms = new CapturingSmsSender();
  let token = '';
  let professionalId = '';
  let serviceId = '';
  let slot: { date: string; start: string } | null = null;

  const auth = (): [string, string] => ['Authorization', `Bearer ${token}`];

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [IdentityModule, UsersModule, ProfessionalsModule, AvailabilityModule, BookingModule] })
      .overrideProvider(SMS_SENDER).useValue(sms).compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone: '054-999-2222' }).expect(200);
    const verify = await request(app.getHttpServer()).post('/v1/auth/otp/verify').send({ challengeId: req.body.challengeId, code: sms.lastCode }).expect(200);
    token = verify.body.tokens.accessToken;
    const list = await request(app.getHttpServer()).get('/v1/professionals').set(...auth()).expect(200);
    professionalId = list.body.items[0].id;
    const detail = await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}`).set(...auth()).expect(200);
    serviceId = detail.body.services[0].id;
    const avail = await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}/availability?serviceId=${serviceId}&days=7`).set(...auth()).expect(200);
    const day = avail.body.days.find((d: { slots: unknown[] }) => d.slots.length > 0);
    slot = day ? { date: day.date, start: day.slots[0].start } : null;
  });
  afterAll(async () => { await app.close(); });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/v1/bookings').expect(403);
  });

  it('creates a booking and lists it', async () => {
    expect(slot).not.toBeNull();
    const res = await request(app.getHttpServer()).post('/v1/bookings').set(...auth())
      .send({ professionalId, serviceId, date: slot!.date, start: slot!.start }).expect(201);
    expect(res.body.status).toBe('confirmed');
    expect(res.body.start).toBe(slot!.start);
    const list = await request(app.getHttpServer()).get('/v1/bookings').set(...auth()).expect(200);
    expect(list.body.some((b: { id: string }) => b.id === res.body.id)).toBe(true);
  });

  it('prevents double-booking the same slot', async () => {
    await request(app.getHttpServer()).post('/v1/bookings').set(...auth())
      .send({ professionalId, serviceId, date: slot!.date, start: slot!.start }).expect(409);
  });

  it('cancels a booking', async () => {
    const list = await request(app.getHttpServer()).get('/v1/bookings').set(...auth()).expect(200);
    const confirmed = list.body.find((b: { status: string }) => b.status === 'confirmed');
    await request(app.getHttpServer()).post(`/v1/bookings/${confirmed.id}/cancel`).set(...auth()).expect(200);
    const after = await request(app.getHttpServer()).get('/v1/bookings').set(...auth()).expect(200);
    expect(after.body.find((b: { id: string }) => b.id === confirmed.id).status).toBe('cancelled');
  });
});
