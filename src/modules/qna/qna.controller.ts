import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  // ApiBearerAuth,
} from '@nestjs/swagger';
import { QnAService } from './qna.service';

import { SearchVectorByQueryDto } from './dto/qna.dto';

@ApiTags('Q&A API List')
@Controller('qna')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class QnAController {
  constructor(private readonly qnaService: QnAService) {}

  @Get('insert-products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Insert Products',
  })
  @ApiResponse({
    status: 200,
    description: 'Insert Products',
  })
  async insertProducts() {
    return this.qnaService.importProducts();
  }

  @Post('search/best-by-query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search vectors using hybrid and cosine similarity',
  })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by hybrid score',
  })
  async bestPossibleResultByQuery(@Body() searchDto: SearchVectorByQueryDto) {
    return this.qnaService.bestPossibleResultByQuery(searchDto);
  }

  @Post('search/local/best-by-query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search vectors using hybrid and cosine similarity',
  })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by hybrid score',
  })
  async localBestPossibleResultByQuery(
    @Body() searchDto: SearchVectorByQueryDto,
  ) {
    return this.qnaService.localBestPossibleResultByQuery(searchDto);
  }
}
