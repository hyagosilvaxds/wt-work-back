import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';

@Controller('trainings')
export class TrainingController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Post()
  async create(@Body() dto: { title: string; description?: string; durationHours: number; isActive?: boolean; validityDays?: number }) {
    return this.superadminService.createTraining(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.superadminService.getTrainings(Number(page) || 1, Number(limit) || 10, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.superadminService.getTrainingById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<{ title: string; description?: string; durationHours: number; isActive?: boolean; validityDays?: number }>) {
    return this.superadminService.patchTraining(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.superadminService.deleteTraining(id);
  }
}
