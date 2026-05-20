import { Controller, Get, Query } from '@nestjs/common';
import { ActivityLog, ActivityType } from '@prisma/client';
import { ActivityLogsService } from './activity-logs.service';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly service: ActivityLogsService) {}

  @Get()
  list(
    @Query('contactId') contactId?: string,
    @Query('type') type?: ActivityType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ActivityLog[]> {
    return this.service.findAll({
      contactId,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
