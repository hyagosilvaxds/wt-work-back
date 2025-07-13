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

  // Alternar status ativo/inativo do usuário
  @Patch('users/:id/toggle-status')
  @RequirePermissions('EDIT_USERS')
  async toggleUserStatus(@Param('id') id: string) {
    return this.superadminService.toggleUserStatus(id);
  }

  // Listar todos os roles disponíveis
  @Get('roles')
  @RequirePermissions('VIEW_ROLES')
  async findAllRoles() {
    return this.superadminService.findAllRoles();
  }

  // Buscar role por ID
  @Get('roles/:id')
  @RequirePermissions('VIEW_ROLES')
  async findRoleById(@Param('id') id: string) {
    return this.superadminService.findRoleById(id);
  }

  // Criar novo role
  @Post('roles')
  @RequirePermissions('CREATE_ROLES')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.superadminService.createRole(
      createRoleDto.name,
      createRoleDto.description,
      createRoleDto.permissionIds
    );
  }

  // Atualizar role existente
  @Put('roles/:id')
  @RequirePermissions('EDIT_ROLES')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.superadminService.updateRole(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
      updateRoleDto.permissionIds
    );
  }

  // Atualizar role parcialmente (PATCH)
  @Patch('roles/:id')
  @RequirePermissions('EDIT_ROLES')
  @UsePipes(new ValidationPipe({ transform: true }))
  async patchRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.superadminService.patchRole(
      id,
      updateRoleDto.name,
      updateRoleDto.description,
      updateRoleDto.permissionIds
    );
  }

  // Deletar role
  @Delete('roles/:id')
  @RequirePermissions('DELETE_ROLES')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string) {
    return this.superadminService.deleteRole(id);
  }

  // Listar todas as permissões disponíveis
  @Get('permissions')
  @RequirePermissions('VIEW_ROLES')
  async findAllPermissions() {
    return this.superadminService.findAllPermissions();
  }
}
