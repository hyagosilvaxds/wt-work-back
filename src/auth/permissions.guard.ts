import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true; // Se não há permissões requeridas, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Vem do AuthGuard
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    try {
      const userPermissions = await this.authService.getUserPermissions(user.id);
      const userPermissionNames = userPermissions.permissions.map(p => p.name);
      
      // Verifica se o usuário tem todas as permissões necessárias
      const hasPermission = requiredPermissions.every(permission => 
        userPermissionNames.includes(permission)
      );
      
      if (!hasPermission) {
        throw new ForbiddenException('Usuário não tem permissão para acessar este recurso');
      }
      
      return true;
    } catch (error) {
      throw new ForbiddenException('Erro ao verificar permissões');
    }
  }
}
