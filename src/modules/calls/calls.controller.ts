import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Call } from '@prisma/client';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Controller('calls')
export class CallsController {
  constructor(private readonly service: CallsService) {}

  @Post()
  create(@Body() dto: CreateCallDto): Promise<Call> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('contactId') contactId?: string,
    @Query('q') q?: string,
  ): Promise<Call[]> {
    return this.service.findAll({ contactId, q });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Call> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCallDto): Promise<Call> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ id: string; deleted: true }> {
    return this.service.remove(id);
  }
}
