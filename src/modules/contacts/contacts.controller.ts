import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ActivityLog, Contact } from '@prisma/client';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly service: ContactsService,
    private readonly activity: ActivityLogsService,
  ) {}

  @Post()
  create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Contact[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contact> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto): Promise<Contact> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ id: string; deleted: true }> {
    return this.service.remove(id);
  }

  @Get(':id/activity')
  activityFor(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<ActivityLog[]> {
    return this.activity.findAll({
      contactId: id,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
