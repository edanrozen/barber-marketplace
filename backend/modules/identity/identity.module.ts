import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthService } from './application/auth.service';
import { AuthController } from './http/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AUTH_CONFIG, OTP_STORE, REFRESH_TOKEN_STORE, SMS_SENDER, USER_REPOSITORY,
} from './ports/ports';
import { PgOtpStore } from './infrastructure/pg-otp.store';
import { PgRefreshTokenStore } from './infrastructure/pg-refresh-token.store';
import { PgUserRepository } from './infrastructure/pg-user.repository';
import { ConsoleSmsSender } from './infrastructure/console-sms.sender';

export const PG_POOL = Symbol('PG_POOL');

/** Authentication & Identity bounded context. Owns OTP auth, sessions, tokens, JWT guard. */
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    { provide: PG_POOL, useFactory: () => new Pool({ connectionString: process.env['DATABASE_URL'] }) },
    {
      provide: AUTH_CONFIG,
      useFactory: () => {
        const jwtSecret = process.env['APP_JWT_SIGNING_KEY'];
        const otpPepper = process.env['OTP_PEPPER'];
        if (jwtSecret === undefined || jwtSecret.length === 0 || otpPepper === undefined || otpPepper.length === 0) {
          throw new Error('APP_JWT_SIGNING_KEY and OTP_PEPPER must be set — refusing to start with empty auth secrets.');
        }
        return { jwtSecret, otpPepper, accessTtlSeconds: 900 };
      },
    },
    { provide: OTP_STORE, useFactory: (pool: Pool) => new PgOtpStore(pool), inject: [PG_POOL] },
    { provide: REFRESH_TOKEN_STORE, useFactory: (pool: Pool) => new PgRefreshTokenStore(pool), inject: [PG_POOL] },
    { provide: USER_REPOSITORY, useFactory: (pool: Pool) => new PgUserRepository(pool), inject: [PG_POOL] },
    { provide: SMS_SENDER, useClass: ConsoleSmsSender },
  ],
  exports: [JwtAuthGuard, AUTH_CONFIG, PG_POOL],
})
export class IdentityModule {}
