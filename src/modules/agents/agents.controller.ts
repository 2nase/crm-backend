import { Controller, Get } from '@nestjs/common';
import { AgentRegistry } from './agent-registry.service';
import { AgentMetadata } from './base-agent.interface';

@Controller('agents')
export class AgentsController {
  constructor(private readonly registry: AgentRegistry) {}

  @Get()
  list(): { count: number; agents: AgentMetadata[] } {
    const agents = this.registry.list();
    return { count: agents.length, agents };
  }
}
