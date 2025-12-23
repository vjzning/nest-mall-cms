import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@app/db/entities/user.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, username: 'test', password: 'hashedPassword' } as UserEntity;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('test');
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'test' },
        relations: ['roles'],
      });
    });

    it('should return null if not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.findByUsername('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, username: 'test' } as UserEntity;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should successfully insert a user', async () => {
      const dto = { username: 'test', password: 'password' };
      const savedUser = { id: 1, ...dto, password: 'hashedPassword' } as UserEntity;

      userRepository.create.mockReturnValue(dto);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);
      expect(result).toEqual(savedUser);
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(dto);
    });
  });
});
