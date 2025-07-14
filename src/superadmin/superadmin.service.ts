import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRoleDto } from './dto/user.dto';
import { CreateInstructorUserDto, LinkUserToInstructorDto } from './dto/instructor.dto';

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

    // Verificar se o role existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new BadRequestException('Role não encontrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário (apenas campos básicos agora)
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId,
        name: userData.name,
        bio: userData.bio,
        isActive: userData.isActive ?? true,
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

    // Verificar se o role existe (se está sendo alterado)
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException('Role não encontrado');
      }
    }

    // Preparar dados para atualização (apenas campos básicos)
    const updateData: any = {};
    
    if (userData.name) updateData.name = userData.name;
    if (userData.bio) updateData.bio = userData.bio;
    if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
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
        accounts: true,
        sessions: true,
        instructor: {
          include: {
            classes: true,
          },
        },
      },
    });

    if (userWithRelations && userWithRelations.instructor && userWithRelations.instructor.classes && userWithRelations.instructor.classes.length > 0) {
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

    // Deletar o usuário (isso também deletará o instrutor associado se existir devido ao onDelete: CASCADE)
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

  // Buscar role por ID
  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrado');
    }

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
    };
  }

  // Criar novo role
  async createRole(name: string, description?: string, permissionIds?: string[]) {
    // Verificar se o nome já existe
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new BadRequestException('Nome do role já está em uso');
    }

    // Verificar se as permissões existem
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Uma ou mais permissões não foram encontradas');
      }
    }

    // Criar o role
    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        permissions: permissionIds ? {
          create: permissionIds.map(permissionId => ({
            permission: { connect: { id: permissionId } },
          })),
        } : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
    };
  }

  // Atualizar role existente (PUT - substitui completamente)
  async updateRole(id: string, name?: string, description?: string, permissionIds?: string[]) {
    // Verificar se o role existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role não encontrado');
    }

    // Verificar se o nome já existe (se está sendo alterado)
    if (name && name !== existingRole.name) {
      const nameExists = await this.prisma.role.findUnique({
        where: { name },
      });
      if (nameExists) {
        throw new BadRequestException('Nome do role já está em uso');
      }
    }

    // Verificar se as permissões existem
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Uma ou mais permissões não foram encontradas');
      }
    }

    // Atualizar o role
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: name || existingRole.name,
        description: description || existingRole.description,
        permissions: {
          deleteMany: {}, // Remove todas as permissões existentes
          create: permissionIds ? permissionIds.map(permissionId => ({
            permission: { connect: { id: permissionId } },
          })) : [],
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
    };
  }

  // Atualizar role parcialmente (PATCH - atualiza apenas campos fornecidos)
  async patchRole(id: string, name?: string, description?: string, permissionIds?: string[]) {
    // Verificar se o role existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role não encontrado');
    }

    // Verificar se o nome já existe (se está sendo alterado)
    if (name && name !== existingRole.name) {
      const nameExists = await this.prisma.role.findUnique({
        where: { name },
      });
      if (nameExists) {
        throw new BadRequestException('Nome do role já está em uso');
      }
    }

    // Verificar se as permissões existem (se foram fornecidas)
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Uma ou mais permissões não foram encontradas');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // Se permissionIds foi fornecido, atualizar as permissões
    if (permissionIds !== undefined) {
      updateData.permissions = {
        deleteMany: {}, // Remove todas as permissões existentes
        create: permissionIds.map(permissionId => ({
          permission: { connect: { id: permissionId } },
        })),
      };
    }

    // Atualizar o role
    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
    };
  }

  // Deletar role
  async deleteRole(id: string) {
    // Verificar se o role existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!existingRole) {
      throw new NotFoundException('Role não encontrado');
    }

    // Verificar se há usuários associados ao role
    if (existingRole.users.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir role que possui usuários associados'
      );
    }

    // Deletar o role (isso também deletará as permissões associadas devido ao onDelete: CASCADE)
    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role excluído com sucesso' };
  }

  // Listar todas as permissões disponíveis
  async findAllPermissions() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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

  // Criar usuário instrutor (com User + Instructor)
  async createInstructorUser(createInstructorDto: CreateInstructorUserDto) {
    const { skillIds, ...userData } = createInstructorDto;

    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Buscar o role INSTRUCTOR
    const instructorRole = await this.prisma.role.findUnique({
      where: { name: 'INSTRUCTOR' },
    });

    if (!instructorRole) {
      throw new BadRequestException('Role INSTRUCTOR não encontrada');
    }

    // Verificar se as skills existem (se foram fornecidas)
    if (skillIds && skillIds.length > 0) {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: skillIds } },
      });

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('Uma ou mais skills não foram encontradas');
      }
    }

    // Validar documentos baseado no tipo de pessoa
    if (userData.personType === 'JURIDICA') {
      if (!userData.cnpj) {
        throw new BadRequestException('CNPJ é obrigatório para pessoa jurídica');
      }
      
      // Verificar se CNPJ já existe
      const existingCnpj = await this.prisma.instructor.findUnique({
        where: { cnpj: userData.cnpj },
      });
      
      if (existingCnpj) {
        throw new BadRequestException('CNPJ já está em uso');
      }
    } else {
      // Pessoa física
      if (userData.cpf) {
        // Verificar se CPF já existe
        const existingCpf = await this.prisma.instructor.findUnique({
          where: { cpf: userData.cpf },
        });
        
        if (existingCpf) {
          throw new BadRequestException('CPF já está em uso');
        }
      }
    }

    // Verificar se email do instrutor já existe (se fornecido)
    if (userData.instructorEmail) {
      const existingInstructorEmail = await this.prisma.instructor.findUnique({
        where: { email: userData.instructorEmail },
      });
      
      if (existingInstructorEmail) {
        throw new BadRequestException('Email do instrutor já está em uso');
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Usar transação para criar User e Instructor
    const result = await this.prisma.$transaction(async (prisma) => {
      // Criar o usuário
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roleId: instructorRole.id,
          bio: userData.bio,
          isActive: userData.isActive ?? true,
          skills: skillIds ? {
            connect: skillIds.map(id => ({ id }))
          } : undefined,
        },
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

      // Criar o instrutor
      const instructor = await prisma.instructor.create({
        data: {
          userId: user.id,
          name: userData.name,
          corporateName: userData.corporateName,
          personType: userData.personType || 'FISICA',
          cpf: userData.cpf,
          cnpj: userData.cnpj,
          municipalRegistration: userData.municipalRegistration,
          stateRegistration: userData.stateRegistration,
          zipCode: userData.zipCode,
          address: userData.address,
          addressNumber: userData.addressNumber,
          neighborhood: userData.neighborhood,
          city: userData.city,
          state: userData.state,
          landlineAreaCode: userData.landlineAreaCode,
          landlineNumber: userData.landlineNumber,
          mobileAreaCode: userData.mobileAreaCode,
          mobileNumber: userData.mobileNumber,
          email: userData.instructorEmail,
          education: userData.education,
          registrationNumber: userData.registrationNumber,
          observations: userData.observations,
        },
      });

      return { user, instructor };
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = result.user;
    
    return {
      user: sanitizedUser,
      instructor: result.instructor,
    };
  }

  // Vincular usuário a instrutor existente
  async linkUserToInstructor(linkUserDto: LinkUserToInstructorDto) {
    const { instructorId, skillIds, ...userData } = linkUserDto;

    // Verificar se o instrutor existe
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    // Verificar se o instrutor já possui um usuário vinculado
    if (instructor.userId) {
      throw new BadRequestException('Este instrutor já possui um usuário vinculado');
    }

    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Buscar o role INSTRUCTOR
    const instructorRole = await this.prisma.role.findUnique({
      where: { name: 'INSTRUCTOR' },
    });

    if (!instructorRole) {
      throw new BadRequestException('Role INSTRUCTOR não encontrada');
    }

    // Verificar se as skills existem (se foram fornecidas)
    if (skillIds && skillIds.length > 0) {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: skillIds } },
      });

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('Uma ou mais skills não foram encontradas');
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Usar transação para criar User e atualizar Instructor
    const result = await this.prisma.$transaction(async (prisma) => {
      // Criar o usuário
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roleId: instructorRole.id,
          bio: userData.bio,
          isActive: userData.isActive ?? true,
          skills: skillIds ? {
            connect: skillIds.map(id => ({ id }))
          } : undefined,
        },
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

      // Atualizar o instrutor com o userId
      const updatedInstructor = await prisma.instructor.update({
        where: { id: instructorId },
        data: {
          userId: user.id,
        },
      });

      return { user, instructor: updatedInstructor };
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = result.user;
    
    return {
      user: sanitizedUser,
      instructor: result.instructor,
    };
  }

  // Listar todos os instrutores
  async getInstructors(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.InstructorWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { corporateName: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
            { user: { 
              name: { contains: search, mode: 'insensitive' }
            }},
          ],
        }
      : {};

    const [instructors, total] = await Promise.all([
      this.prisma.instructor.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              isActive: true,
              createdAt: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
              skills: true,
            },
          },
          classes: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
              type: true,
              location: true,
              training: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  durationHours: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.instructor.count({ where }),
    ]);

    return {
      instructors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLightInstructors() {
    return this.prisma.instructor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        user: {
          select: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
