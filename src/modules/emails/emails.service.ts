import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Email } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async create(dto: CreateEmailDto): Promise<Email> {
    // Verify contact exists
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new BadRequestException(`Contact ${dto.contactId} not found`);

    const email = await this.prisma.email.create({
      data: {
        contactId: dto.contactId,
        subject: dto.subject,
        body: dto.body,
        templateId: dto.templateId,
        sentAt: new Date(),
      },
    });
    await this.prisma.contact.update({
      where: { id: email.contactId },
      data: { lastInteraction: email.sentAt },
    });
    await this.activity.log({
      type: ActivityType.EMAIL_SENT,
      message: `Email sent: ${email.subject}`,
      contactId: email.contactId,
      metadata: { emailId: email.id, templateId: email.templateId },
    });
    this.bus.emit(DomainEvent.EMAIL_SENT, {
      emailId: email.id,
      contactId: email.contactId,
      templateId: email.templateId,
      subject: email.subject,
      occurredAt: new Date(),
    });
    return email;
  }

  findAll(filters: { contactId?: string }): Promise<Email[]> {
    return this.prisma.email.findMany({
      where: filters.contactId ? { contactId: filters.contactId } : {},
      orderBy: { sentAt: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string): Promise<Email> {
    const email = await this.prisma.email.findUnique({ where: { id } });
    if (!email) throw new NotFoundException(`Email ${id} not found`);
    return email;
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.prisma.email.delete({ where: { id } });
    return { id, deleted: true };
  }
}
