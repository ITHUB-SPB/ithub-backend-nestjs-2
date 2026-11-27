import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity.js';
import { AuthService } from '../auth/auth.service.js';

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
