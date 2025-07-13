import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRoleDto } from './dto/user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('superadmin')
@UseGuards(AuthGuard, PermissionsGuard)
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  // Listar todos os usuários
  @Get('users')
  @RequirePermissions('VIEW_USERS')
  async findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return this.superadminService.findAllUsers(pageNum, limitNum, search);
  }

  // Buscar usuário por ID
  @Get('users/:id')
  @RequirePermissions('VIEW_USERS')
  async findUserById(@Param('id') id: string) {
    return this.superadminService.findUserById(id);
  }

  // Criar novo usuário
  @Post('users')
  @RequirePermissions('CREATE_USERS')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.superadminService.createUser(createUserDto);
  }

  // Atualizar usuário
  @Put('users/:id')
  @RequirePermissions('EDIT_USERS')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.superadminService.updateUser(id, updateUserDto);
  }

  // Deletar usuário
  @Delete('users/:id')
  @RequirePermissions('DELETE_USERS')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.superadminService.deleteUser(id);
  }

  // Listar todos os roles disponíveis
  @Get('roles')
  @RequirePermissions('VIEW_ROLES')
  async findAllRoles() {
    return this.superadminService.findAllRoles();
  }

 
}
