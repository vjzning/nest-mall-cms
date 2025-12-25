import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findByUsername: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if validation is successful', async () => {
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { 
        id: 1, 
        username: 'test', 
        password: hashedPassword,
        roles: [] 
      };

      userService.findByUsername.mockResolvedValue(user);

      const result = await service.validateUser('test', password);
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
      expect(result.username).toEqual('test');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      userService.findByUsername.mockResolvedValue(null);
      const result = await service.validateUser('test', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password incorrect', async () => {
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { 
        id: 1, 
        username: 'test', 
        password: hashedPassword 
      };

      userService.findByUsername.mockResolvedValue(user);
      const result = await service.validateUser('test', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const user = { id: 1, username: 'test', roles: [] };
      const token = 'jwt_token';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);
      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
    });
  });
});
