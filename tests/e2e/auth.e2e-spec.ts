/**
 * End-to-end auth + profile flow (Jest + Supertest against the real Nest app).
 * REAL-ENV: requires `npm install` and a test Postgres with migrations 0001+0002 applied.
 * The SMS sender is overridden with a capturing fake so the OTP can drive the flow.
 */
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { IdentityModule } from '../../backend/modules/identity';
import { UsersModule } from '../../backend/modules/users';
import { SMS_SENDER } from '../../backend/modules/identity/ports/ports';
import { configureApp } from '../../backend/common';

class CapturingSmsSender {
  lastCode: string | null = null;
  async send(_phone: string, message: string): Promise<void> {
    const match = message.match(/(\d{6})/);
    this.lastCode = match ? match[1]! : null;
  }
}

describe('Auth + Profile (e2e)', () => {
  let app: INestApplication;
  const sms = new CapturingSmsSender();
  const phone = '054-1234567';
  let accessToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [IdentityModule, UsersModule] })
      .overrideProvider(SMS_SENDER)
      .useValue(sms)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('registers a new user via OTP', async () => {
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone }).expect(200);
    expect(req.body.challengeId).toBeDefined();
    expect(sms.lastCode).toMatch(/^\d{6}$/);

    const verify = await request(app.getHttpServer())
      .post('/v1/auth/otp/verify')
      .send({ challengeId: req.body.challengeId, code: sms.lastCode })
      .expect(200);
    expect(verify.body.isNewUser).toBe(true);
    accessToken = verify.body.tokens.accessToken;
    refreshToken = verify.body.tokens.refreshToken;
  });

  it('denies unauthenticated profile access', async () => {
    await request(app.getHttpServer()).get('/v1/me').expect(403);
  });

  it('returns and updates the profile', async () => {
    const me = await request(app.getHttpServer()).get('/v1/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(me.body.phone).toBe('+972541234567');
    expect(me.body.displayName).toBeNull();

    const updated = await request(app.getHttpServer())
      .patch('/v1/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ displayName: 'דנה כהן' })
      .expect(200);
    expect(updated.body.displayName).toBe('דנה כהן');
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const rotated = await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refreshToken }).expect(200);
    expect(rotated.body.refreshToken).not.toBe(refreshToken);
    await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refreshToken }).expect(403);
  });

  it('signs the returning user in and logs out (revokes the session)', async () => {
    const req = await request(app.getHttpServer()).post('/v1/auth/otp/request').send({ phone }).expect(200);
    const verify = await request(app.getHttpServer())
      .post('/v1/auth/otp/verify')
      .send({ challengeId: req.body.challengeId, code: sms.lastCode })
      .expect(200);
    expect(verify.body.isNewUser).toBe(false);

    await request(app.getHttpServer()).post('/v1/auth/logout').send({ refreshToken: verify.body.tokens.refreshToken }).expect(200);
    await request(app.getHttpServer()).post('/v1/auth/refresh').send({ refreshToken: verify.body.tokens.refreshToken }).expect(403);
  });
});
