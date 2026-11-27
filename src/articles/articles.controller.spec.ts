import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { AuthService } from '../auth/auth.service.js';

describe('ArticlesController', () => {
  let controller: ArticlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        { provide: ArticlesService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
