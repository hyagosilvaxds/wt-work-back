import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class SuperadminService {
  constructor(private prisma: PrismaService) {}

  // Listar todos os usuários
  async findAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Buscar usuário por ID
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        skills: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Remove password from response
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Criar novo usuário
  async createUser(createUserDto: CreateUserDto) {
    const { email, password, roleId, ...userData } = createUserDto;

    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Verificar se CPF já existe (se fornecido)
    if (userData.cpf) {
      const existingCpf = await this.prisma.user.findFirst({
        where: { cpf: userData.cpf },
      });
      if (existingCpf) {
        throw new BadRequestException('CPF já está em uso');
      }
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (userData.cnpj) {
      const existingCnpj = await this.prisma.user.findFirst({
        where: { cnpj: userData.cnpj },
      });
      if (existingCnpj) {
        throw new BadRequestException('CNPJ já está em uso');
      }
    }

    // Verificar se o role existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Role não encontrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId,
        ...userData,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Atualizar usuário
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { email, password, roleId, ...userData } = updateUserDto;

    // Verificar se o usuário existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        cpf: true,
        cnpj: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o email já existe (se está sendo alterado)
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    // Verificar se CPF já existe (se está sendo alterado)
    if (userData.cpf && userData.cpf !== existingUser.cpf) {
      const cpfExists = await this.prisma.user.findFirst({
        where: { cpf: userData.cpf },
      });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso');
      }
    }

    // Verificar se CNPJ já existe (se está sendo alterado)
    if (userData.cnpj && userData.cnpj !== existingUser.cnpj) {
      const cnpjExists = await this.prisma.user.findFirst({
        where: { cnpj: userData.cnpj },
      });
      if (cnpjExists) {
        throw new BadRequestException('CNPJ já está em uso');
      }
    }

    // Verificar se o role existe (se está sendo alterado)
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException('Role não encontrado');
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...userData };
    
    if (email) updateData.email = email;
    if (roleId) updateData.roleId = roleId;
    
    // Hash da nova senha se fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualizar o usuário
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Deletar usuário
  async deleteUser(id: string) {
    // Verificar se o usuário existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário tem relacionamentos que impedem a exclusão
    const userWithRelations = await this.prisma.user.findUnique({
      where: { id },
      include: {
        instructorClasses: true,
        accounts: true,
        sessions: true,
      },
    });

    if (userWithRelations && userWithRelations.instructorClasses && userWithRelations.instructorClasses.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir usuário que possui turmas associadas'
      );
    }

    if (userWithRelations && 
        ((userWithRelations.accounts && userWithRelations.accounts.length > 0) || 
         (userWithRelations.sessions && userWithRelations.sessions.length > 0))) {
      throw new BadRequestException(
        'Não é possível excluir usuário que possui sessões ativas'
      );
    }

    // Deletar o usuário
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário excluído com sucesso' };
  }

  // Listar todos os roles disponíveis
  async findAllRoles() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        users: {
          select: {
            id: true,
            name: true,
          }
        },
        permissions: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Alternar status ativo/inativo do usuário
  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Remove password from response
    const { password, ...sanitizedUser } = updatedUser;
    return sanitizedUser;
  }
}
