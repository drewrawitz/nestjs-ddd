import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { INestApplication } from '@nestjs/common';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  let mockAuthService: any;

  beforeAll(async () => {
    mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      verifyResetToken: jest.fn(),
      loginSuccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = module.createNestApplication();
    controller = module.get<AuthController>(AuthController);
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

  describe('signup', () => {
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

    it('POST /v1/auth/signup should fail with validation errors', async () => {
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
});
