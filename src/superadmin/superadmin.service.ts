import { LinkUserToClientDto } from './dto/client-link-user.dto';
import { CreateClientDto, PatchClientDto } from './dto/client.dto';
  
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, PatchUserDto, CreateRoleDto, UpdateRoleDto } from './dto/user.dto';
import { CreateInstructorUserDto, LinkUserToInstructorDto } from './dto/instructor.dto';

@Injectable()
export class SuperadminService {
  // Atualizar parcialmente cliente (PATCH)
  async patchClient(id: string, patchDto: PatchClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    // Garantir unicidade de email/cpf/cnpj se alterados
    if (patchDto.email && patchDto.email !== client.email) {
      const emailExists = await this.prisma.client.findUnique({ where: { email: patchDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso para outro cliente');
      }
    }
    if (patchDto.cpf && patchDto.cpf !== client.cpf) {
      const cpfExists = await this.prisma.client.findUnique({ where: { cpf: patchDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso para outro cliente');
      }
    }
    if (patchDto.cnpj && patchDto.cnpj !== client.cnpj) {
      const cnpjExists = await this.prisma.client.findUnique({ where: { cnpj: patchDto.cnpj } });
      if (cnpjExists) {
        throw new BadRequestException('CNPJ já está em uso para outro cliente');
      }
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if (patchDto[key] === '') {
        patchDto[key] = undefined;
      }
    });
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if (patchDto[key] !== undefined) {
        updateData[key] = patchDto[key];
      }
    }
    const updated = await this.prisma.client.update({ where: { id }, data: updateData });
    return updated;
  }

  // Deletar cliente
  async deleteClient(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    await this.prisma.client.delete({ where: { id } });
    return { message: 'Cliente excluído com sucesso' };
  }

  // --- CLIENT CRUD ---

  // Criar novo cliente
  async createClient(createClientDto: CreateClientDto) {
    // Verifica se já existe email, cpf ou cnpj cadastrado
    if (createClientDto.email) {
      const existingEmail = await this.prisma.client.findUnique({ where: { email: createClientDto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso para outro cliente');
      }
    }
    if (createClientDto.cpf) {
      const existingCpf = await this.prisma.client.findUnique({ where: { cpf: createClientDto.cpf } });
      if (existingCpf) {
        throw new BadRequestException('CPF já está em uso para outro cliente');
      }
    }
    if (createClientDto.cnpj) {
      const existingCnpj = await this.prisma.client.findUnique({ where: { cnpj: createClientDto.cnpj } });
      if (existingCnpj) {
        throw new BadRequestException('CNPJ já está em uso para outro cliente');
      }
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(createClientDto).forEach(key => {
      if (createClientDto[key] === '') {
        createClientDto[key] = undefined;
      }
    });
    const client = await this.prisma.client.create({ data: createClientDto });
    return client;
  }

  // Buscar cliente por ID
  async getClientById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        students: true,
        classes: true,
        user: true,
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  // Listar todos os clientes (com paginação e busca)
  async getClients(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          students: true,
          classes: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);
    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Vincular usuário a cliente existente
  async linkUserToClient(clientId: string, linkUserDto: LinkUserToClientDto) {
    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    // Verificar se já possui usuário vinculado
    if (client.userId) {
      throw new BadRequestException('Este cliente já possui um usuário vinculado');
    }
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({ where: { email: linkUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }
    // Buscar o role CLIENTE
    const clientRole = await this.prisma.role.findUnique({ where: { name: 'CLIENTE' } });
    if (!clientRole) {
      throw new BadRequestException('Role CLIENTE não encontrada');
    }
    // Hash da senha
    const hashedPassword = await bcrypt.hash(linkUserDto.password, 10);
    // Criar usuário e vincular ao client em transação
    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: linkUserDto.name,
          email: linkUserDto.email,
          password: hashedPassword,
          roleId: clientRole.id,
          bio: linkUserDto.bio,
          isActive: linkUserDto.isActive ?? true,
        },
      });
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: { userId: user.id },
      });
      return { user, client: updatedClient };
    });
    // Remove password do retorno
    const { password, ...sanitizedUser } = result.user;
    return {
      user: sanitizedUser,
      client: result.client,
    };
  }
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

  // Atualizar usuário parcialmente (PATCH)
  async patchUser(id: string, patchUserDto: PatchUserDto) {
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
    if (patchUserDto.email && patchUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: patchUserDto.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso');
      }
    }

    // Verificar se o role existe (se está sendo alterado)
    if (patchUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: patchUserDto.roleId },
      });
      if (!role) {
        throw new BadRequestException('Role não encontrado');
      }
    }

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {};
    
    // Atualizar apenas os campos fornecidos no DTO
    if (patchUserDto.name !== undefined) updateData.name = patchUserDto.name;
    if (patchUserDto.bio !== undefined) updateData.bio = patchUserDto.bio;
    if (patchUserDto.isActive !== undefined) updateData.isActive = patchUserDto.isActive;
    if (patchUserDto.email !== undefined) updateData.email = patchUserDto.email;
    if (patchUserDto.roleId !== undefined) updateData.roleId = patchUserDto.roleId;
    
    // Hash da nova senha se fornecida
    if (patchUserDto.password) {
      updateData.password = await bcrypt.hash(patchUserDto.password, 10);
    }

    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
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

  

  // Criar novo instrutor diretamente
  async createInstructor(createInstructorDto: CreateInstructorUserDto) {
    // Verifica se já existe email, cpf ou cnpj cadastrado
    if (createInstructorDto.email) {
      const existingEmail = await this.prisma.instructor.findUnique({ where: { email: createInstructorDto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso para outro instrutor');
      }
    }
    if (createInstructorDto.cpf) {
      const existingCpf = await this.prisma.instructor.findUnique({ where: { cpf: createInstructorDto.cpf } });
      if (existingCpf) {
        throw new BadRequestException('CPF já está em uso para outro instrutor');
      }
    }
    if (createInstructorDto.cnpj) {
      const existingCnpj = await this.prisma.instructor.findUnique({ where: { cnpj: createInstructorDto.cnpj } });
      if (existingCnpj) {
        throw new BadRequestException('CNPJ já está em uso para outro instrutor');
      }
    }

    // Cria o instrutor
    const instructor = await this.prisma.instructor.create({
      data: {
        userId: createInstructorDto.userId,
        isActive: createInstructorDto.isActive ?? true,
        name: createInstructorDto.name,
        corporateName: createInstructorDto.corporateName,
        personType: createInstructorDto.personType ?? 'FISICA',
        cpf: createInstructorDto.cpf,
        cnpj: createInstructorDto.cnpj,
        municipalRegistration: createInstructorDto.municipalRegistration,
        stateRegistration: createInstructorDto.stateRegistration,
        zipCode: createInstructorDto.zipCode,
        address: createInstructorDto.address,
        addressNumber: createInstructorDto.addressNumber,
        neighborhood: createInstructorDto.neighborhood,
        city: createInstructorDto.city,
        state: createInstructorDto.state,
        landlineAreaCode: createInstructorDto.landlineAreaCode,
        landlineNumber: createInstructorDto.landlineNumber,
        mobileAreaCode: createInstructorDto.mobileAreaCode,
        mobileNumber: createInstructorDto.mobileNumber,
        email: createInstructorDto.email,
        education: createInstructorDto.education,
        registrationNumber: createInstructorDto.registrationNumber,
        observations: createInstructorDto.observations,
      },
    });
    return instructor;
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

    // Buscar o role INSTRUTOR
    const instructorRole = await this.prisma.role.findUnique({
      where: { name: 'INSTRUTOR' },
    });

    if (!instructorRole) {
      throw new BadRequestException('Role INSTRUTOR não encontrada');
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

  // Buscar instrutor por ID
  async getInstructorById(id: string) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id },
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
    });
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }
    return instructor;
  }

  // Atualizar parcialmente instrutor (PATCH)
  async patchInstructor(id: string, patchDto: Partial<CreateInstructorUserDto>) {
    const instructor = await this.prisma.instructor.findUnique({ where: { id } });
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }
    // Se tentar atualizar email/cpf/cnpj, garantir unicidade
    if (patchDto.email && patchDto.email !== instructor.email) {
      const emailExists = await this.prisma.instructor.findUnique({ where: { email: patchDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso para outro instrutor');
      }
    }
    if (patchDto.cpf && patchDto.cpf !== instructor.cpf) {
      const cpfExists = await this.prisma.instructor.findUnique({ where: { cpf: patchDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso para outro instrutor');
      }
    }
    if (patchDto.cnpj && patchDto.cnpj !== instructor.cnpj) {
      const cnpjExists = await this.prisma.instructor.findUnique({ where: { cnpj: patchDto.cnpj } });
      if (cnpjExists) {
        throw new BadRequestException('CNPJ já está em uso para outro instrutor');
      }
    }
    // Atualizar apenas campos fornecidos
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if (patchDto[key] !== undefined) {
        updateData[key] = patchDto[key];
      }
    }
    const updated = await this.prisma.instructor.update({
      where: { id },
      data: updateData,
    });
    return updated;
  }

  // Deletar instrutor
  async deleteInstructor(id: string) {
    const instructor = await this.prisma.instructor.findUnique({ where: { id } });
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }
    // Se o instrutor já está vinculado a usuário, pode impedir exclusão se necessário
    await this.prisma.instructor.delete({ where: { id } });
    return { message: 'Instrutor excluído com sucesso' };
  }

  // --- STUDENT CRUD ---

  // --- TRAINING CRUD ---

  // Criar novo treinamento
  async createTraining(createTrainingDto: { title: string; description?: string; durationHours: number; isActive?: boolean; validityDays?: number; }) {
    // Verifica se já existe um treinamento com o mesmo título
    const existing = await this.prisma.training.findFirst({ where: { title: createTrainingDto.title } });
    if (existing) {
      throw new BadRequestException('Já existe um treinamento com este título');
    }
    // Cria o treinamento
    const training = await this.prisma.training.create({ data: createTrainingDto });
    return training;
  }

  // Buscar treinamento por ID
  async getTrainingById(id: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        classes: true,
        certificates: true,
        instructors: true,
      },
    });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }
    return training;
  }

  // Listar todos os treinamentos (com paginação e busca)
  async getTrainings(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [trainings, total] = await Promise.all([
      this.prisma.training.findMany({
        where,
        skip,
        take: limit,
        include: {
          classes: true,
          certificates: true,
          instructors: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.training.count({ where }),
    ]);
    return {
      trainings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Atualizar parcialmente treinamento (PATCH)
  async patchTraining(id: string, patchDto: Partial<{ title: string; description?: string; durationHours: number; isActive?: boolean; validityDays?: number; }>) {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }
    // Se tentar atualizar título, garantir unicidade
    if (patchDto.title && patchDto.title !== training.title) {
      const titleExists = await this.prisma.training.findFirst({ where: { title: patchDto.title } });
      if (titleExists) {
        throw new BadRequestException('Já existe um treinamento com este título');
      }
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if (patchDto[key] === '') {
        patchDto[key] = undefined;
      }
    });
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if (patchDto[key] !== undefined) {
        updateData[key] = patchDto[key];
      }
    }
    const updated = await this.prisma.training.update({ where: { id }, data: updateData });
    return updated;
  }

  // Deletar treinamento
  async deleteTraining(id: string) {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }
    await this.prisma.training.delete({ where: { id } });
    return { message: 'Treinamento excluído com sucesso' };
  }

  // Criar novo estudante
  async createStudent(createStudentDto: any) {
    // Verifica se já existe email ou cpf cadastrado
    if (createStudentDto.email) {
      const existingEmail = await this.prisma.student.findUnique({ where: { email: createStudentDto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso para outro estudante');
      }
    }
    if (createStudentDto.cpf) {
      const existingCpf = await this.prisma.student.findUnique({ where: { cpf: createStudentDto.cpf } });
      if (existingCpf) {
        throw new BadRequestException('CPF já está em uso para outro estudante');
      }
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(createStudentDto).forEach(key => {
      if (createStudentDto[key] === '') {
        createStudentDto[key] = undefined;
      }
    });
    const student = await this.prisma.student.create({ data: createStudentDto });
    return student;
  }

  // Buscar estudante por ID
  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            training: true,
            instructor: true,
          },
        },
        certificates: true,
        client: true,
      },
    });
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }
    return student;
  }

  // Listar todos os estudantes (com paginação e busca)
  async getStudents(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);
    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Atualizar parcialmente estudante (PATCH)
  async patchStudent(id: string, patchDto: any) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }
    if (patchDto.email && patchDto.email !== student.email) {
      const emailExists = await this.prisma.student.findUnique({ where: { email: patchDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso para outro estudante');
      }
    }
    if (patchDto.cpf && patchDto.cpf !== student.cpf) {
      const cpfExists = await this.prisma.student.findUnique({ where: { cpf: patchDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso para outro estudante');
      }
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if (patchDto[key] === '') {
        patchDto[key] = undefined;
      }
    });
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if (patchDto[key] !== undefined) {
        updateData[key] = patchDto[key];
      }
    }
    const updated = await this.prisma.student.update({ where: { id }, data: updateData });
    return updated;
  }

  // Deletar estudante
  async deleteStudent(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Estudante excluído com sucesso' };
  }
}
