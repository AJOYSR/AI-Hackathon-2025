import { QnaInterface } from './../../../entities/qna.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from 'src/modules/pagination/types';

export class QnaDto implements QnaInterface {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  cosine_similarity?: string;

  @ApiProperty({ required: false })
  cosine_score?: string;

  @ApiProperty({ required: false })
  hybrid_score?: string;

  @ApiProperty({ required: false })
  combined_score?: string;
}

export class UpdateVectorDto {
  @ApiProperty({ required: false })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  question?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  answer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  embedding?: any;
}

export class SearchVectorByQuestionDto {
  @ApiProperty({ required: true })
  @IsString({ message: 'validation.isString' })
  question: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  botId?: string;

  @ApiProperty({ required: false, default: 5 })
  @IsNumber({}, { message: 'validation.isNumber' })
  @IsOptional()
  limit?: number;
}

export class SearchVectorByQueryDto {
  @ApiProperty({ required: true })
  @IsString({ message: 'validation.isString' })
  question: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  businessId?: string;

  @ApiProperty({ required: false, default: 5 })
  @IsNumber({}, { message: 'validation.isNumber' })
  @IsOptional()
  limit?: number;
}

export class SearchVectorDto {
  @ApiProperty({
    description: 'The vector embedding to search with',
    type: [Number],
  })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsArray({ message: 'validation.isArray' })
  embedding: number[];

  @ApiProperty({
    description: 'The maximum number of results to return',
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'validation.isNumber' })
  limit?: number;
}

export class CreateVectorDto {
  @ApiProperty({ description: 'The question text' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  question: string;

  @ApiProperty({ description: 'The answer text' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  answer: string;

  @ApiProperty({ description: 'The company ID' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  botId: string;
}

export class CreateVectorBatchDto {
  @ApiProperty({
    type: [CreateVectorDto],
    description: 'Array of vectors to create',
  })
  @IsArray({ message: 'validation.isArray' })
  @ArrayMinSize(1, { message: 'validation.arrayMinSize' })
  @ValidateNested({ each: true })
  @Type(() => CreateVectorDto)
  vectors: CreateVectorDto[];
}

export class QnaListResponseDto {
  data: QnaDto[];
}

export class GetAlQnaQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  q: string;

  @ApiProperty({ required: true })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({
    message: 'validation.notEmpty',
  })
  botId: string;
}
