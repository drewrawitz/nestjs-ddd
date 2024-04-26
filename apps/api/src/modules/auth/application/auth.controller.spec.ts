import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import session from 'express-session';
import passport from 'passport';
import { User } from 'src/modules/users/domain/model/User';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import request from 'supertest';
import { LocalAuthGuard } from '../infrastructure/local.auth.guard';
import { LocalStrategy } from '../infrastructure/local.strategy';
import { SessionSerializer } from '../infrastructure/session.serializer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MFAService } from 'src/modules/mfa/mfa.service';

const mockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  validateUser: jest.fn(),
  verifyResetToken: jest.fn(),
  loginSuccess: jest.fn(),
  setupTotp: jest.fn(),
  activateTotp: jest.fn(),
};

const mockMfaService = {
  getAllActiveMFAForUser: jest.fn(),
  setupTotp: jest.fn(),
  verifyTotpToken: jest.fn(),
  activateTotp: jest.fn(),
  verifyUserTotpToken: jest.fn(),
};

@Module({
  controllers: [AuthController],
  providers: [
    { provide: MFAService, useValue: mockMfaService },
    { provide: AuthService, useValue: mockAuthService },
  ],
})
class TestAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: 'test-secret',
          resave: false,
          saveUninitialized: false,
          cookie: { maxAge: 60000 }, // 1 minute for testing
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes(AuthController);
  }
}

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  let spyClearCookie: any;

  beforeAll(async () => {
    const mockAuthGuard = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule, PassportModule.register({ session: true })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MFAService, useValue: mockMfaService },
        { provide: LocalAuthGuard, useValue: mockAuthGuard },
        LocalStrategy,
        SessionSerializer,
      ],
    }).compile();

    app = module.createNestApplication();
    controller = module.get<AuthController>(AuthController);
    spyClearCookie = jest.fn();

    app.use((req: any, res: any, next: any) => {
      if (process.env.TEST_AUTHENTICATED) {
        req.isAuthenticated = () => true;
        req.user = {
          id: 'user_123',
          email: 'test@test.com',
        };
      }

      res.clearCookie = spyClearCookie;
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /v1/auth/signup', () => {
    it('should signup and login a user', async () => {
      const req: any = { user: undefined };
      const body = {
        email: 'test@example.com',
        password: 'secure123',
        firstName: 'test',
        lastName: 'test',
      };
      const result = await controller.signup(req, body);

      expect(mockAuthService.signup).toHaveBeenCalledWith(body);
      expect(mockAuthService.login).toHaveBeenCalledWith(req, req.user);
      expect(result).toEqual(req.user);
    });

    it('should properly handle service layer errors during signup', async () => {
      const req: any = { user: undefined };
      const body = {
        email: 'test@example.com',
        password: 'secure123',
        firstName: 'test',
        lastName: 'test',
      };
      const error = new Error('Email already exists');
      mockAuthService.signup.mockRejectedValue(error);

      await expect(controller.signup(req, body)).rejects.toEqual(error);
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should fail with validation errors', async () => {
      // Bad Params to test
      const params = [
        undefined,
        {},
        { email: 'bademail,', password: 'secure123' },
        {
          email: 'bademail',
          password: 'secret123',
          firstName: 'test',
          lastName: 'test',
        },
      ];

      for (const param of params) {
        await request(app.getHttpServer())
          .post('/v1/auth/signup')
          .send(param)
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Validation failed');
          });
      }
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should successfully log in a user', async () => {
      const user = new User({
        id: '1',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'correctpassword',
      });
      const userDto = new UserResponseDto(user);

      mockAuthService.validateUser.mockResolvedValue(userDto);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: user.email.getValue(), password: user.passwordHash })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(userDto);
          expect(mockAuthService.loginSuccess).toHaveBeenCalled();
        });
    });

    it('should not log the user in if they have MFA enabled', async () => {
      const user = new User({
        id: '1',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'correctpassword',
      });
      const userDto = new UserResponseDto(user);

      mockAuthService.validateUser.mockResolvedValue(userDto);
      mockMfaService.getAllActiveMFAForUser.mockResolvedValue([{
        type: 'TOTP',
      }]);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: user.email.getValue(), password: user.passwordHash })
        .expect(200)
        .expect((res) => {
          expect(res.body.mfaRequired).toEqual(true);
          expect(res.body.mfaTypes).toEqual(['TOTP']);
          expect(mockAuthService.loginSuccess).not.toHaveBeenCalled();
        });
    });

    it('should return a 401 on invalid login credentials', async () => {
      mockAuthService.validateUser.mockReturnValue(null);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' })
        .expect(401)
        .expect(() => {
          expect(mockAuthService.loginSuccess).not.toHaveBeenCalled();
        });
    });

    it('should return a 403 (Forbidden) if the user is already authenticated', async () => {
      process.env.TEST_AUTHENTICATED = 'true';

      const user = new User({
        id: '1',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'correctpassword',
      });
      const userDto = new UserResponseDto(user);

      mockAuthService.validateUser.mockResolvedValue(userDto);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' })
        .expect(403)
        .expect(() => {
          expect(mockAuthService.loginSuccess).not.toHaveBeenCalled();
        });

      delete process.env.TEST_AUTHENTICATED;
    });
  });

  describe('POST /v1/auth/logout', () => {
    it('should return a 401 if the user is not authenticated', async () => {
      await request(app.getHttpServer()).post('/v1/auth/logout').expect(401);
    });

    it('should clear the session cookie on logout', async () => {
      process.env.TEST_AUTHENTICATED = 'true';

      await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(204)
        .expect(() => {
          expect(spyClearCookie).toHaveBeenCalledWith('connect.sid');
          expect(mockAuthService.logout).toHaveBeenCalled();
        });
      delete process.env.TEST_AUTHENTICATED;
    });

    it('should return an empty response body', async () => {
      process.env.TEST_AUTHENTICATED = 'true';
      await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(204)
        .then((response) => {
          expect(response.text).toBe('');
        });
      delete process.env.TEST_AUTHENTICATED;
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    it('should call forgotPassword successfully', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/forgot-password')
        .send({ email: 'valid@ok.com' })
        .expect(201)
        .expect(() => {
          expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
            'valid@ok.com',
          );
        });
    });

    it('should fail with validation errors', async () => {
      const params = [undefined, {}, { email: 'bademail' }];

      for (const param of params) {
        await request(app.getHttpServer())
          .post('/v1/auth/forgot-password')
          .send(param)
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Validation failed');
          });
      }
    });
  });

  describe('GET /v1/auth/verify-reset-token', () => {
    it('should fail with validation errors (token not provided)', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/verify-reset-token')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
        });
    });

    it('should call verifyResetToken when a token is provided', async () => {
      await request(app.getHttpServer())
        .get('/v1/auth/verify-reset-token?token=123')
        .expect(200)
        .expect(() => {
          expect(mockAuthService.verifyResetToken).toHaveBeenCalledWith('123');
        });
    });
  });

  describe('POST /v1/auth/mfa/totp/setup', () => {
    it('should return a 401 if the user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/mfa/totp/setup')
        .expect(401);
    });

    it('should call setupTotp when the endpoint is hit', async () => {
      process.env.TEST_AUTHENTICATED = 'true';

      await request(app.getHttpServer())
        .post('/v1/auth/mfa/totp/setup')
        .expect(201)
        .expect(() => {
          expect(mockMfaService.setupTotp).toHaveBeenCalled();
        });

      delete process.env.TEST_AUTHENTICATED;
    });
  });

  describe('POST /v1/auth/mfa/totp/activate', () => {
    it('should return a 401 if the user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/mfa/totp/activate')
        .expect(401);
    });

    it('should fail with validation errors', async () => {
      process.env.TEST_AUTHENTICATED = 'true';
      const params = [
        undefined,
        {},
        { key: 123, totp: '123456' },
        { key: '123', totp: '123' },
      ];

      for (const param of params) {
        await request(app.getHttpServer())
          .post('/v1/auth/mfa/totp/activate')
          .send(param)
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Validation failed');
          });
      }
      delete process.env.TEST_AUTHENTICATED;
    });

    it('should call activateTotp when the endpoint is hit', async () => {
      process.env.TEST_AUTHENTICATED = 'true';
      const body = { key: '123', totp: '123456' };

      await request(app.getHttpServer())
        .post('/v1/auth/mfa/totp/activate')
        .send(body)
        .expect(201)
        .expect(() => {
          expect(mockMfaService.activateTotp).toHaveBeenCalledWith(
            'user_123',
            body,
          );
        });

      delete process.env.TEST_AUTHENTICATED;
    });
  });
});
