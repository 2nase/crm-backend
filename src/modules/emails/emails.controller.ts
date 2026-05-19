import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Email } from '@prisma/client';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';

@Controller('emails')
export class EmailsController {
  constructor(private readonly service: EmailsService) {}

  @Post()
  create(@Body() dto: CreateEmailDto): Promise<Email> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('contactId') contactId?: string): Promise<Email[]> {
    return this.service.findAll({ contactId });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Email> {
    return this.service.findOne(id);
  }
}
