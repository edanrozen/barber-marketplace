/**
 * Availability e2e (Jest + Supertest). REAL-ENV: requires npm install and a test Postgres with
 * migrations 0001-0004 + seeds 0001/0002/0003 applied. Slot counts depend on the current day/time,
 * so this asserts contract shape + guard behavior rather than exact slots.
 */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IdentityModule } from '../../backend/modules/identity';
import { UsersModule } from '../../backend/modules/users';
import { ProfessionalsModule } from '../../backend/modules/professionals';
import { AvailabilityModule } from '../../backend/modules/availability';
import { SMS_SENDER } from '../../backend/modules/identity/ports/ports';
import { configureApp } from '../../backend/common';

class CapturingSmsSender {
  lastCode: string | null = null;
  async send(_phone: string, message: string): Promise<void> {
    const m = message.match(/(\d{6})/);
    this.lastCode = m ? m[1]! : null;
  }
}

describe('Availability (e2e)', () => {
  let app: INestApplication;
  const sms = new CapturingSmsSender();
  let token = '';
  let professionalId = '';
  let serviceId = '';

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [IdentityModule, UsersModule, ProfessionalsModule, AvailabilityModule] })
      .overrideProvider(SMS_SENDER).useValue(sms).compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone: '054-999-1111' }).expect(200);
    const verify = await request(app.getHttpServer()).post('/v1/auth/otp/verify').send({ challengeId: req.body.challengeId, code: sms.lastCode }).expect(200);
    token = verify.body.tokens.accessToken;
    const list = await request(app.getHttpServer()).get('/v1/professionals').set('Authorization', `Bearer ${token}`).expect(200);
    professionalId = list.body.items[0].id;
    const detail = await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}`).set('Authorization', `Bearer ${token}`).expect(200);
    serviceId = detail.body.services[0].id;
  });
  afterAll(async () => { await app.close(); });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}/availability?serviceId=${serviceId}`).expect(403);
  });

  it('returns availability with the contract shape', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/professionals/${professionalId}/availability?serviceId=${serviceId}&days=7`)
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.professionalId).toBe(professionalId);
    expect(typeof res.body.durationMinutes).toBe('number');
    expect(Array.isArray(res.body.days)).toBe(true);
    for (const day of res.body.days) {
      expect(day).toHaveProperty('date');
      expect(Array.isArray(day.slots)).toBe(true);
      if (day.slots.length > 0) expect(day.slots[0]).toHaveProperty('start');
    }
  });

  it('400 when serviceId is missing', async () => {
    await request(app.getHttpServer()).get(`/v1/professionals/${professionalId}/availability`).set('Authorization', `Bearer ${token}`).expect(400);
  });

  it('404 for a service that is not this professional\'s', async () => {
    await request(app.getHttpServer())
      .get(`/v1/professionals/${professionalId}/availability?serviceId=00000000-0000-4000-8000-000000000999`)
      .set('Authorization', `Bearer ${token}`).expect(404);
  });
});
