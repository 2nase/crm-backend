import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Contact, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = await this.prisma.contact.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        ...(dto.status ? { status: dto.status } : {}),
        lastInteraction: new Date(),
      },
    });
    await this.activity.log({
      type: ActivityType.CONTACT_CREATED,
      message: `Contact created: ${contact.name}`,
      contactId: contact.id,
    });
    this.bus.emit(DomainEvent.CONTACT_CREATED, {
      contactId: contact.id,
      name: contact.name,
      email: contact.email,
      occurredAt: new Date(),
    });
    return contact;
  }

  findAll(): Promise<Contact[]> {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    return contact;
  }

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    await this.findOne(id);
    const data: Prisma.ContactUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.company !== undefined ? { company: dto.company } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };
    const updated = await this.prisma.contact.update({ where: { id }, data });
    await this.activity.log({
      type: ActivityType.CONTACT_UPDATED,
      message: `Contact updated: ${updated.name}`,
      contactId: id,
    });
    return updated;
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
    await this.activity.log({
      type: ActivityType.CONTACT_DELETED,
      message: `Contact deleted: ${id}`,
      contactId: null,
      metadata: { deletedContactId: id },
    });
    return { id, deleted: true };
  }

  async touchInteraction(contactId: string): Promise<void> {
    await this.prisma.contact.update({
      where: { id: contactId },
      data: { lastInteraction: new Date() },
    });
  }
}
