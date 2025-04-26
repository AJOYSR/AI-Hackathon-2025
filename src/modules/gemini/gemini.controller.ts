import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';

@Controller('gemini')
@ApiTags('Gemini API')
export class GeminiController {
  constructor(private geminiService: GeminiService) {}

  // @Get('/embeddings')
  // async embeddings(@Query('answer') answer: string): Promise<number[]> {
  //   const ans = await this.geminiService.generateEmbeddings(answer);
  //   return ans;
  // }

  // @Get('/answer')
  // async getAnswer(
  //   @Query('question') question: string,
  //   @Query('answer') answer: string,
  // ): Promise<string> {
  //   const ans = await this.geminiService.enhanceAnswer(question, answer);
  //   return ans;
  // }
}
