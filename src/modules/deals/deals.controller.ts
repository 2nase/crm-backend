import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Deal, DealStage } from '@prisma/client';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller('deals')
export class DealsController {
  constructor(private readonly service: DealsService) {}

  @Post()
  create(@Body() dto: CreateDealDto): Promise<Deal> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('stage') stage?: DealStage,
    @Query('contactId') contactId?: string,
  ): Promise<Deal[]> {
    return this.service.findAll({ stage, contactId });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Deal> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto): Promise<Deal> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ id: string; deleted: true }> {
    return this.service.remove(id);
  }
}
