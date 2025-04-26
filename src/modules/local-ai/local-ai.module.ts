import { Module } from '@nestjs/common';
import { LocalAIService } from './local-ai.service';

@Module({
  providers: [LocalAIService],
  exports: [LocalAIService],
})
export class LocalAIModule {}
