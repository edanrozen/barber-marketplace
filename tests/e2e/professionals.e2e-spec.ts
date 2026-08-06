/**
 * Professional catalog e2e (Jest + Supertest). REAL-ENV: requires npm install and a test Postgres
 * with migrations 0001-0003 + seeds 0001/0002 applied. SMS sender overridden to drive login.
 */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IdentityModule } from '../../backend/modules/identity';
import { UsersModule } from '../../backend/modules/users';
import { ProfessionalsModule } from '../../backend/modules/professionals';
import { SMS_SENDER } from '../../backend/modules/identity/ports/ports';
import { configureApp } from '../../backend/common';

class CapturingSmsSender {
  lastCode: string | null = null;
  async send(_phone: string, message: string): Promise<void> {
    const m = message.match(/(\d{6})/);
    this.lastCode = m ? m[1]! : null;
  }
}

describe('Professional catalog (e2e)', () => {
  let app: INestApplication;
  const sms = new CapturingSmsSender();
  let token = '';

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [IdentityModule, UsersModule, ProfessionalsModule] })
      .overrideProvider(SMS_SENDER)
      .useValue(sms)
      .compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone: '054-999-0000' }).expect(200);
    const verify = await request(app.getHttpServer()).post('/v1/auth/otp/verify').send({ challengeId: req.body.challengeId, code: sms.lastCode }).expect(200);
    token = verify.body.tokens.accessToken;
  });
  afterAll(async () => { await app.close(); });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/v1/professionals').expect(403);
  });

  it('lists the seeded professionals with a price-from', async () => {
    const res = await request(app.getHttpServer()).get('/v1/professionals').set('Authorization', `Bearer ${token}`).expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(5);
    expect(res.body.items[0]).toHaveProperty('displayName');
    expect(res.body.items[0]).toHaveProperty('priceFromMinorUnits');
    expect(res.body.items[0]).toHaveProperty('ratingAvg');
  });

  it('returns full detail with services, portfolio and travel area', async () => {
    const list = await request(app.getHttpServer()).get('/v1/professionals').set('Authorization', `Bearer ${token}`).expect(200);
    const id = list.body.items[0].id;
    const res = await request(app.getHttpServer()).get(`/v1/professionals/${id}`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.services.length).toBeGreaterThan(0);
    expect(res.body.portfolio.length).toBeGreaterThan(0);
    expect(res.body.travelArea).toHaveProperty('zoneName');
    expect(res.body.travelArea).toHaveProperty('radiusMeters');
  });

  it('404s an unknown professional', async () => {
    await request(app.getHttpServer()).get('/v1/professionals/00000000-0000-4000-8000-000000000999').set('Authorization', `Bearer ${token}`).expect(404);
  });
});
