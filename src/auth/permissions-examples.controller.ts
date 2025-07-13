import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('training')
@UseGuards(AuthGuard, PermissionsGuard) // AuthGuard deve vir primeiro
export class TrainingController {
  
  @Get()
  // Qualquer usuário autenticado pode listar treinamentos
  async listTrainings() {
    return { message: 'Lista de treinamentos' };
  }

  @Post()
  @RequirePermissions('CREATE_TRAINING')
  async createTraining(@Body() createTrainingDto: any) {
    return { message: 'Treinamento criado com sucesso' };
  }

  @Post(':id/edit')
  @RequirePermissions('EDIT_TRAINING')
  async editTraining(@Body() editTrainingDto: any) {
    return { message: 'Treinamento editado com sucesso' };
  }

  @Post(':id/delete')
  @RequirePermissions('DELETE_TRAINING')
  async deleteTraining() {
    return { message: 'Treinamento deletado com sucesso' };
  }
}

@Controller('classes')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClassesController {
  
  @Post()
  @RequirePermissions('TEACH_CLASS')
  async createClass(@Body() createClassDto: any) {
    return { message: 'Aula criada com sucesso' };
  }

  @Post(':id/enroll')
  @RequirePermissions('ENROLL_CLASS')
  async enrollInClass(@Body() enrollDto: any) {
    return { message: 'Inscrito na aula com sucesso' };
  }
}

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  
  @Get()
  @RequirePermissions('MANAGE_USERS')
  async listUsers() {
    return { message: 'Lista de usuários' };
  }

  @Post()
  @RequirePermissions('MANAGE_USERS')
  async createUser(@Body() createUserDto: any) {
    return { message: 'Usuário criado com sucesso' };
  }
}

@Controller('financial')
@UseGuards(AuthGuard, PermissionsGuard)
export class FinancialController {
  
  @Get()
  @RequirePermissions('VIEW_FINANCIAL')
  async viewFinancialData() {
    return { message: 'Dados financeiros' };
  }

  @Post()
  @RequirePermissions('MANAGE_FINANCIAL')
  async manageFinancialData(@Body() financialDto: any) {
    return { message: 'Dados financeiros gerenciados' };
  }
}

/**
 * Exemplo de uso múltiplas permissões:
 * 
 * @Post('advanced-operation')
 * @RequirePermissions('MANAGE_USERS', 'VIEW_FINANCIAL') // Precisa de ambas
 * async advancedOperation() {
 *   return { message: 'Operação avançada executada' };
 * }
 */
