import { Injectable, NotFoundException } from '@nestjs/common';
import { EmailCategory, EmailTemplate, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.create({
      data: {
        title: dto.title,
        category: dto.category,
        subject: dto.subject,
        body: dto.body,
        variables: (dto.variables ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  findAll(filters: { category?: EmailCategory }): Promise<EmailTemplate[]> {
    return this.prisma.emailTemplate.findMany({
      where: filters.category ? { category: filters.category } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const tpl = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException(`EmailTemplate ${id} not found`);
    return tpl;
  }

  async update(id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    await this.findOne(id);
    const data: Prisma.EmailTemplateUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
      ...(dto.body !== undefined ? { body: dto.body } : {}),
      ...(dto.variables !== undefined
        ? { variables: dto.variables as unknown as Prisma.InputJsonValue }
        : {}),
    };
    return this.prisma.emailTemplate.update({ where: { id }, data });
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.prisma.emailTemplate.delete({ where: { id } });
    return { id, deleted: true };
  }
}
