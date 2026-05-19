import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEmailDto {
  @IsString()
  contactId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
