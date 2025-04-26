import { Module } from '@nestjs/common';
import { QnAController } from './qna.controller';
import { QnAService } from './qna.service';
import { PaginationService } from '../pagination/pagination.service';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { QnARepository } from './qna.repository';
import { DatabaseService } from '../database/database.service';
import { GeminiService } from '../gemini/gemini.service';

@Module({
  controllers: [QnAController],
  providers: [
    QnAService,
    QnARepository,
    DatabaseService,
    PaginationService,
    APIResponse,
    GeminiService,
  ],
  exports: [QnAService, QnARepository],
})
export class QnAModule {}
