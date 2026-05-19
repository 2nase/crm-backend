import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCallDto {
  @IsString()
  contactId!: string;

  @IsInt()
  @Min(0)
  duration!: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
