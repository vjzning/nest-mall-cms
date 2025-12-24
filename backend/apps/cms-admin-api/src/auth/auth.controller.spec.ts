import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    userService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const loginDto = { username: 'test', password: 'password' };
      const user = { id: 1, username: 'test' };
      const token = { access_token: 'jwt_token' };

      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue(token);

      const result = await controller.login(loginDto);
      expect(result).toEqual(token);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.username, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = { username: 'test', password: 'wrong' };
      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto = { username: 'newuser', password: 'password' };
      const createdUser = { id: 1, ...createUserDto, password: 'hashedPassword' };

      userService.create.mockResolvedValue(createdUser);

      const result = await controller.register(createUserDto);
      expect(result).toEqual(createdUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
