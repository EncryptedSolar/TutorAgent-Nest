import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './user/user.service'; // import this

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({}),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
