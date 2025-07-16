import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, PatchUserDto, CreateRoleDto, UpdateRoleDto } from './dto/user.dto';
import { CreateInstructorUserDto, LinkUserToInstructorDto } from './dto/instructor.dto';
import { UploadSignatureDto, UpdateSignatureDto } from './dto/upload-signature.dto';
import * as fs from 'fs';
import * as path from 'path';
import { LinkUserToClientDto } from './dto/client-link-user.dto';
import { CreateClientDto, PatchClientDto } from './dto/client.dto';
import { CreateClassDto, PatchClassDto } from './dto/class.dto';
import { CreateLessonDto, PatchLessonDto } from './dto/lesson.dto';
import { CreateLessonAttendanceDto, PatchLessonAttendanceDto } from './dto/lesson-attendance.dto';
import { CreateStudentDto, PatchStudentDto } from './dto/student.dto';
import { ClientDashboardDto, ScheduledLessonDto } from './dto/client-dashboard.dto';
import { InstructorDashboardDto, ScheduledLessonDto as InstructorScheduledLessonDto } from './dto/instructor-dashboard.dto';
import { AdminDashboardDto, ScheduledLessonDto as AdminScheduledLessonDto, RecentActivityDto } from './dto/admin-dashboard.dto';

@Injectable()
export class SuperadminService {
  // ...existing code...

  // Buscar todos os estudantes de uma empresa (cliente)
  async getEmpresaStudents(clientId: string, page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      clientId,
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          classes: true,
          certificates: true,
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
  // ...existing code...
  /**
   * Adiciona alunos a uma turma
   */
  async addStudentsToClass(classId: string, dto: { studentIds: string[] }) {
    // Validar se o DTO está correto
    if (!dto || !dto.studentIds || !Array.isArray(dto.studentIds)) {
      throw new BadRequestException('Lista de IDs de estudantes é obrigatória e deve ser um array');
    }

    if (dto.studentIds.length === 0) {
      throw new BadRequestException('É necessário fornecer pelo menos um ID de estudante');
    }

    // Verifica se a turma existe
    const turma = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { students: true },
    });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }
    
    // Busca os estudantes
    const students = await this.prisma.student.findMany({
      where: { id: { in: dto.studentIds } },
    });
    if (students.length !== dto.studentIds.length) {
      const foundIds = students.map(s => s.id);
      const missingIds = dto.studentIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Estudantes não encontrados: ${missingIds.join(', ')}`);
    }

    // Verifica se algum estudante já está na turma
    const existingStudentIds = turma.students.map(s => s.id);
    const alreadyInClass = dto.studentIds.filter(id => existingStudentIds.includes(id));
    if (alreadyInClass.length > 0) {
      const studentsInClass = students.filter(s => alreadyInClass.includes(s.id));
      const names = studentsInClass.map(s => s.name).join(', ');
      throw new BadRequestException(`Os seguintes estudantes já estão na turma: ${names}`);
    }

    // Atualiza relação N:N
    await this.prisma.class.update({
      where: { id: classId },
      data: {
        students: {
          connect: dto.studentIds.map(id => ({ id })),
        },
      },
    });

    const addedStudents = students.map(s => ({ id: s.id, name: s.name }));
    return { 
      message: 'Alunos adicionados à turma com sucesso',
      addedStudents,
      classId
    };
  }

  /**
   * Remove alunos de uma turma
   */
  async removeStudentsFromClass(classId: string, dto: { studentIds: string[] }) {
    // Validar se o DTO está correto
    if (!dto || !dto.studentIds || !Array.isArray(dto.studentIds)) {
      throw new BadRequestException('Lista de IDs de estudantes é obrigatória e deve ser um array');
    }

    if (dto.studentIds.length === 0) {
      throw new BadRequestException('É necessário fornecer pelo menos um ID de estudante');
    }

    // Verifica se a turma existe
    const turma = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { students: true },
    });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }
    // Busca os estudantes
    const students = await this.prisma.student.findMany({
      where: { id: { in: dto.studentIds } },
    });
    if (students.length !== dto.studentIds.length) {
      throw new BadRequestException('Um ou mais estudantes não encontrados');
    }
    // Atualiza relação N:N
    await this.prisma.class.update({
      where: { id: classId },
      data: {
        students: {
          disconnect: dto.studentIds.map(id => ({ id })),
        },
      },
    });
    return { message: 'Alunos removidos da turma com sucesso' };
  }
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
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.client.update({ where: { id }, data: updateData });
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        const fieldMessages = {
          email: 'Email já está em uso para outro cliente',
          cpf: 'CPF já está em uso para outro cliente',
          cnpj: 'CNPJ já está em uso para outro cliente',
        };
        
        for (const field of fields) {
          if (fieldMessages[field]) {
            throw new BadRequestException(fieldMessages[field]);
          }
        }
        
        throw new BadRequestException('Dados já existem para outro cliente');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar cliente
  async deleteClient(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verificar se o cliente possui relacionamentos que impedem a exclusão
    const clientWithRelations = await this.prisma.client.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            classes: {
              include: {
                training: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
            certificates: {
              include: {
                training: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        classes: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
              },
            },
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
            students: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        lessons: {
          include: {
            class: {
              include: {
                training: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!clientWithRelations) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar estudantes vinculados
    if (clientWithRelations.students.length > 0) {
      const studentsWithActivity = clientWithRelations.students.filter(
        student => student.classes.length > 0 || student.certificates.length > 0
      );
      
      if (studentsWithActivity.length > 0) {
        blockers.push({
          type: 'students',
          count: studentsWithActivity.length,
          message: `Cliente possui ${studentsWithActivity.length} estudante(s) com atividade (turmas ou certificados)`,
          details: studentsWithActivity.map(student => ({
            studentId: student.id,
            studentName: student.name,
            classesCount: student.classes.length,
            certificatesCount: student.certificates.length,
            classes: student.classes.map(cls => ({
              classId: cls.id,
              trainingTitle: cls.training.title,
            })),
            certificates: student.certificates.map(cert => ({
              certificateId: cert.id,
              trainingTitle: cert.training.title,
              issueDate: cert.issueDate,
            })),
          })),
        });
        canDelete = false;
      } else {
        // Estudantes sem atividade não impedem exclusão, mas informa
        blockers.push({
          type: 'students_inactive',
          count: clientWithRelations.students.length,
          message: `Cliente possui ${clientWithRelations.students.length} estudante(s) sem atividade`,
          details: clientWithRelations.students.map(student => ({
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
          })),
        });
      }
    }

    // Verificar turmas associadas
    if (clientWithRelations.classes.length > 0) {
      blockers.push({
        type: 'classes',
        count: clientWithRelations.classes.length,
        message: `Cliente possui ${clientWithRelations.classes.length} turma(s) associada(s)`,
        details: clientWithRelations.classes.map(cls => ({
          classId: cls.id,
          trainingTitle: cls.training.title,
          instructorName: cls.instructor.name,
          startDate: cls.startDate,
          endDate: cls.endDate,
          studentsCount: cls.students.length,
        })),
      });
      canDelete = false;
    }

    // Verificar aulas associadas
    if (clientWithRelations.lessons.length > 0) {
      blockers.push({
        type: 'lessons',
        count: clientWithRelations.lessons.length,
        message: `Cliente possui ${clientWithRelations.lessons.length} aula(s) associada(s)`,
        details: clientWithRelations.lessons.map(lesson => ({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonDate: lesson.startDate,
          trainingTitle: lesson.class?.training?.title,
        })),
      });
      canDelete = false;
    }

    // Verificar usuário vinculado (não impede exclusão, mas informa)
    if (clientWithRelations.user) {
      blockers.push({
        type: 'user',
        count: 1,
        message: 'Cliente possui usuário vinculado',
        details: [{
          userId: clientWithRelations.user.id,
          userName: clientWithRelations.user.name,
          userEmail: clientWithRelations.user.email,
          isActive: clientWithRelations.user.isActive,
        }],
      });
      // Usuário não impede exclusão
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir este cliente devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir este cliente, você deve primeiro:',
          blockers.some(b => b.type === 'students') ? '• Remover ou transferir os estudantes com atividade' : null,
          blockers.some(b => b.type === 'classes') ? '• Remover ou transferir as turmas associadas' : null,
          blockers.some(b => b.type === 'lessons') ? '• Remover ou transferir as aulas associadas' : null,
          blockers.some(b => b.type === 'students_inactive') ? '• Estudantes sem atividade serão removidos automaticamente' : null,
          blockers.some(b => b.type === 'user') ? '• O usuário vinculado será removido automaticamente' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir o cliente
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
    try {
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
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        if (fields.includes('email')) {
          throw new BadRequestException('Email já está em uso');
        }
        
        throw new BadRequestException('Dados já existem para outro usuário');
      }
      
      // Re-lançar outros erros
      throw error;
    }
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
    try {
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
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        if (fields.includes('name')) {
          throw new BadRequestException('Nome do role já está em uso');
        }
        
        throw new BadRequestException('Dados já existem para outro role');
      }
      
      // Re-lançar outros erros
      throw error;
    }
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
    
    // Se tentar atualizar email, garantir unicidade
    if (patchDto.email && patchDto.email !== instructor.email) {
      const emailExists = await this.prisma.instructor.findUnique({ where: { email: patchDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso para outro instrutor');
      }
    }
    
    // Se tentar atualizar CPF, garantir unicidade
    if (patchDto.cpf && patchDto.cpf !== instructor.cpf) {
      const cpfExists = await this.prisma.instructor.findUnique({ where: { cpf: patchDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso para outro instrutor');
      }
    }
    
    // Se tentar atualizar CNPJ, garantir unicidade
    if (patchDto.cnpj && patchDto.cnpj !== instructor.cnpj) {
      const cnpjExists = await this.prisma.instructor.findUnique({ where: { cnpj: patchDto.cnpj } });
      if (cnpjExists) {
        throw new BadRequestException('CNPJ já está em uso para outro instrutor');
      }
    }
    
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    
    // Atualizar apenas campos fornecidos
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.instructor.update({
        where: { id },
        data: updateData,
      });
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        const fieldMessages = {
          email: 'Email já está em uso para outro instrutor',
          cpf: 'CPF já está em uso para outro instrutor',
          cnpj: 'CNPJ já está em uso para outro instrutor',
        };
        
        for (const field of fields) {
          if (fieldMessages[field]) {
            throw new BadRequestException(fieldMessages[field]);
          }
        }
        
        throw new BadRequestException('Dados já existem para outro instrutor');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar instrutor
  async deleteInstructor(id: string) {
    const instructor = await this.prisma.instructor.findUnique({ where: { id } });
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    // Verificar se o instrutor possui relacionamentos que impedem a exclusão
    const instructorWithRelations = await this.prisma.instructor.findUnique({
      where: { id },
      include: {
        lessons: {
          include: {
            class: {
              select: {
                id: true,
                training: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        classes: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
              },
            },
            students: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Signature: {
          select: {
            id: true,
            pngPath: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!instructorWithRelations) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar aulas ministradas
    if (instructorWithRelations.lessons.length > 0) {
      blockers.push({
        type: 'lessons',
        count: instructorWithRelations.lessons.length,
        message: `Instrutor possui ${instructorWithRelations.lessons.length} aula(s) ministrada(s)`,
        details: instructorWithRelations.lessons.map(lesson => ({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonDate: lesson.startDate,
          classId: lesson.class?.id,
          trainingTitle: lesson.class?.training?.title,
        })),
      });
      canDelete = false;
    }

    // Verificar turmas associadas
    if (instructorWithRelations.classes.length > 0) {
      blockers.push({
        type: 'classes',
        count: instructorWithRelations.classes.length,
        message: `Instrutor possui ${instructorWithRelations.classes.length} turma(s) associada(s)`,
        details: instructorWithRelations.classes.map(cls => ({
          classId: cls.id,
          trainingTitle: cls.training.title,
          startDate: cls.startDate,
          endDate: cls.endDate,
          studentsCount: cls.students.length,
        })),
      });
      canDelete = false;
    }

    // Verificar assinatura (não impede exclusão, mas informa)
    if (instructorWithRelations.Signature) {
      blockers.push({
        type: 'signature',
        count: 1,
        message: 'Instrutor possui assinatura cadastrada',
        details: [{
          signatureId: instructorWithRelations.Signature.id,
          pngPath: instructorWithRelations.Signature.pngPath,
        }],
      });
      // Assinatura não impede exclusão
    }

    // Verificar usuário vinculado (não impede exclusão, mas informa)
    if (instructorWithRelations.user) {
      blockers.push({
        type: 'user',
        count: 1,
        message: 'Instrutor possui usuário vinculado',
        details: [{
          userId: instructorWithRelations.user.id,
          userName: instructorWithRelations.user.name,
          userEmail: instructorWithRelations.user.email,
          isActive: instructorWithRelations.user.isActive,
        }],
      });
      // Usuário não impede exclusão (será removido em cascata)
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir este instrutor devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir este instrutor, você deve primeiro:',
          blockers.some(b => b.type === 'lessons') ? '• Remover ou transferir as aulas ministradas' : null,
          blockers.some(b => b.type === 'classes') ? '• Remover ou transferir as turmas associadas' : null,
          blockers.some(b => b.type === 'signature') ? '• A assinatura será removida automaticamente' : null,
          blockers.some(b => b.type === 'user') ? '• O usuário vinculado será removido automaticamente' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir o instrutor
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
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.training.update({ where: { id }, data: updateData });
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        if (fields.includes('title')) {
          throw new BadRequestException('Título já está em uso para outro treinamento');
        }
        
        throw new BadRequestException('Dados já existem para outro treinamento');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar treinamento
  async deleteTraining(id: string) {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    // Verificar se o treinamento possui relacionamentos que impedem a exclusão
    const trainingWithRelations = await this.prisma.training.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
            students: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        certificates: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        instructors: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!trainingWithRelations) {
      throw new NotFoundException('Treinamento não encontrado');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar turmas associadas
    if (trainingWithRelations.classes.length > 0) {
      blockers.push({
        type: 'classes',
        count: trainingWithRelations.classes.length,
        message: `Treinamento possui ${trainingWithRelations.classes.length} turma(s) associada(s)`,
        details: trainingWithRelations.classes.map(cls => ({
          classId: cls.id,
          startDate: cls.startDate,
          endDate: cls.endDate,
          instructorName: cls.instructor.name,
          studentsCount: cls.students.length,
        })),
      });
      canDelete = false;
    }

    // Verificar certificados emitidos
    if (trainingWithRelations.certificates.length > 0) {
      blockers.push({
        type: 'certificates',
        count: trainingWithRelations.certificates.length,
        message: `Treinamento possui ${trainingWithRelations.certificates.length} certificado(s) emitido(s)`,
        details: trainingWithRelations.certificates.map(cert => ({
          certificateId: cert.id,
          studentName: cert.student.name,
          issueDate: cert.issueDate,
          validationCode: cert.validationCode,
        })),
      });
      canDelete = false;
    }

    // Verificar instrutores vinculados (não impede exclusão, mas informa)
    if (trainingWithRelations.instructors.length > 0) {
      blockers.push({
        type: 'instructors',
        count: trainingWithRelations.instructors.length,
        message: `Treinamento possui ${trainingWithRelations.instructors.length} instrutor(es) habilitado(s)`,
        details: trainingWithRelations.instructors.map(instructor => ({
          instructorId: instructor.id,
          instructorName: instructor.name,
        })),
      });
      // Instrutores não impedem exclusão (relação many-to-many será desfeita)
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir este treinamento devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir este treinamento, você deve primeiro:',
          blockers.some(b => b.type === 'classes') ? '• Remover ou transferir as turmas associadas' : null,
          blockers.some(b => b.type === 'certificates') ? '• Certificados não podem ser removidos por questões de auditoria' : null,
          blockers.some(b => b.type === 'instructors') ? '• A vinculação com instrutores será removida automaticamente' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir o treinamento
    await this.prisma.training.delete({ where: { id } });
    return { message: 'Treinamento excluído com sucesso' };
  }

  // Criar novo estudante
  async createStudent(createStudentDto: CreateStudentDto) {
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
    
    // Verifica se a empresa (cliente) existe, caso o clientId seja fornecido
    if (createStudentDto.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: createStudentDto.clientId } });
      if (!client) {
        throw new BadRequestException('Empresa (cliente) não encontrada');
      }
    }
    
    // Remove strings vazias dos campos opcionais
    Object.keys(createStudentDto).forEach(key => {
      if (createStudentDto[key] === '') {
        createStudentDto[key] = undefined;
      }
    });
    const student = await this.prisma.student.create({ 
      data: createStudentDto,
      include: {
        client: true,
        classes: true,
        certificates: true,
      }
    });
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
            // Busca por empresa (cliente)
            { client: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { cpf: { contains: search, mode: 'insensitive' } },
                  { cnpj: { contains: search, mode: 'insensitive' } },
                ]
              }
            },
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
  async patchStudent(id: string, patchDto: PatchStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }
    
    // Verifica unicidade de email se alterado
    if (patchDto.email && patchDto.email !== student.email) {
      const emailExists = await this.prisma.student.findUnique({ where: { email: patchDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email já está em uso para outro estudante');
      }
    }
    
    // Verifica unicidade de CPF se alterado
    if (patchDto.cpf && patchDto.cpf !== student.cpf) {
      const cpfExists = await this.prisma.student.findUnique({ where: { cpf: patchDto.cpf } });
      if (cpfExists) {
        throw new BadRequestException('CPF já está em uso para outro estudante');
      }
    }
    
    // Verifica se a empresa (cliente) existe, caso o clientId seja fornecido ou alterado
    if (patchDto.clientId && patchDto.clientId !== student.clientId) {
      const client = await this.prisma.client.findUnique({ where: { id: patchDto.clientId } });
      if (!client) {
        throw new BadRequestException('Empresa (cliente) não encontrada');
      }
    }
    
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.student.update({ 
        where: { id }, 
        data: updateData,
        include: {
          client: true,
          classes: true,
          certificates: true,
        }
      });
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        const fieldMessages = {
          email: 'Email já está em uso para outro estudante',
          cpf: 'CPF já está em uso para outro estudante',
        };
        
        for (const field of fields) {
          if (fieldMessages[field]) {
            throw new BadRequestException(fieldMessages[field]);
          }
        }
        
        throw new BadRequestException('Dados já existem para outro estudante');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar estudante
  async deleteStudent(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se o estudante possui relacionamentos que impedem a exclusão
    const studentWithRelations = await this.prisma.student.findUnique({
      where: { id },
      include: {
        lessonAttendances: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                startDate: true,
              },
            },
          },
        },
        certificates: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        classes: {
          select: {
            id: true,
            training: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        accountsReceivable: {
          select: {
            id: true,
            description: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!studentWithRelations) {
      throw new NotFoundException('Estudante não encontrado');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar presenças em aulas
    if (studentWithRelations.lessonAttendances.length > 0) {
      blockers.push({
        type: 'lessonAttendances',
        count: studentWithRelations.lessonAttendances.length,
        message: `Estudante possui ${studentWithRelations.lessonAttendances.length} registro(s) de presença em aulas`,
        details: studentWithRelations.lessonAttendances.map(attendance => ({
          lessonId: attendance.lesson.id,
          lessonTitle: attendance.lesson.title,
          lessonDate: attendance.lesson.startDate,
          status: attendance.status,
        })),
      });
      canDelete = false;
    }

    // Verificar certificados
    if (studentWithRelations.certificates.length > 0) {
      blockers.push({
        type: 'certificates',
        count: studentWithRelations.certificates.length,
        message: `Estudante possui ${studentWithRelations.certificates.length} certificado(s) emitido(s)`,
        details: studentWithRelations.certificates.map(cert => ({
          certificateId: cert.id,
          trainingTitle: cert.training.title,
          issueDate: cert.issueDate,
          validationCode: cert.validationCode,
        })),
      });
      canDelete = false;
    }

    // Verificar turmas ativas
    if (studentWithRelations.classes.length > 0) {
      blockers.push({
        type: 'classes',
        count: studentWithRelations.classes.length,
        message: `Estudante está matriculado em ${studentWithRelations.classes.length} turma(s)`,
        details: studentWithRelations.classes.map(cls => ({
          classId: cls.id,
          trainingTitle: cls.training.title,
        })),
      });
      canDelete = false;
    }

    // Verificar contas a receber
    if (studentWithRelations.accountsReceivable.length > 0) {
      const pendingReceivables = studentWithRelations.accountsReceivable.filter(
        acc => acc.status === 'PENDING'
      );
      
      if (pendingReceivables.length > 0) {
        blockers.push({
          type: 'accountsReceivable',
          count: pendingReceivables.length,
          message: `Estudante possui ${pendingReceivables.length} conta(s) a receber pendente(s)`,
          details: pendingReceivables.map(acc => ({
            accountId: acc.id,
            description: acc.description,
            amount: acc.amount,
            status: acc.status,
          })),
        });
        canDelete = false;
      }
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir este estudante devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir este estudante, você deve primeiro:',
          blockers.some(b => b.type === 'lessonAttendances') ? '• Remover ou transferir os registros de presença' : null,
          blockers.some(b => b.type === 'certificates') ? '• Certificados não podem ser removidos por questões de auditoria' : null,
          blockers.some(b => b.type === 'classes') ? '• Remover o estudante das turmas em que está matriculado' : null,
          blockers.some(b => b.type === 'accountsReceivable') ? '• Resolver as contas a receber pendentes' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir o estudante
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Estudante excluído com sucesso' };
  }

  // --- CLASS CRUD ---

  // Criar nova turma
  async createClass(createClassDto: CreateClassDto) {
    // Verifica se existe a combinação de trainingId, instructorId, roomId e startDate
    const existing = await this.prisma.class.findFirst({
      where: {
        trainingId: createClassDto.trainingId,
        instructorId: createClassDto.instructorId,
       
        startDate: createClassDto.startDate,
      },
    });
    if (existing) {
      throw new BadRequestException('Já existe uma turma com esses dados');
    }
    // Remove strings vazias dos campos opcionais
    Object.keys(createClassDto).forEach(key => {
      if (createClassDto[key] === '') {
        createClassDto[key] = undefined;
      }
    });
    const turma = await this.prisma.class.create({ data: createClassDto });
    return turma;
  }

  // Buscar turma por ID
  async getClassById(id: string) {
    const turma = await this.prisma.class.findUnique({
      where: { id },
      include: {
        training: true,
        instructor: true,
        
        client: true,
        students: true,
        lessons: true,
      },
    });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }
    return turma;
  }

  // Listar todas as turmas (com paginação e busca)
  async getClasses(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { type: { contains: search, mode: 'insensitive' } },
            { status: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { observations: { contains: search, mode: 'insensitive' } },
            // Busca por treinamento
            { training: { 
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ]
            }},
            // Busca por instrutor
            { instructor: { 
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { corporateName: { contains: search, mode: 'insensitive' } },
              ]
            }},
            // Busca por cliente
            { client: { 
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search, mode: 'insensitive' } },
                { cnpj: { contains: search, mode: 'insensitive' } },
              ]
            }},
          ],
        }
      : {};
    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: true,
          instructor: true,
          students: true,
          lessons: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);
    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Atualizar parcialmente turma (PATCH)
  async patchClass(id: string, patchDto: PatchClassDto) {
    const turma = await this.prisma.class.findUnique({ where: { id } });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }
    
    // Remove strings vazias dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    // Se não há dados para atualizar, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.class.update({ where: { id }, data: updateData });
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        throw new BadRequestException('Dados já existem para outra turma');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar turma
  async deleteClass(id: string) {
    const turma = await this.prisma.class.findUnique({ where: { id } });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se a turma possui relacionamentos que impedem a exclusão
    const classWithRelations = await this.prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          include: {
            attendances: {
              select: {
                id: true,
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        training: {
          select: {
            id: true,
            title: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!classWithRelations) {
      throw new NotFoundException('Turma não encontrada');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar estudantes matriculados
    if (classWithRelations.students.length > 0) {
      blockers.push({
        type: 'students',
        count: classWithRelations.students.length,
        message: `Turma possui ${classWithRelations.students.length} estudante(s) matriculado(s)`,
        details: classWithRelations.students.map(student => ({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
        })),
      });
      canDelete = false;
    }

    // Verificar aulas ministradas
    if (classWithRelations.lessons.length > 0) {
      const lessonsWithAttendance = classWithRelations.lessons.filter(
        lesson => lesson.attendances.length > 0
      );

      if (lessonsWithAttendance.length > 0) {
        blockers.push({
          type: 'lessons',
          count: lessonsWithAttendance.length,
          message: `Turma possui ${lessonsWithAttendance.length} aula(s) com presença registrada`,
          details: lessonsWithAttendance.map(lesson => ({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDate: lesson.startDate,
            attendancesCount: lesson.attendances.length,
          })),
        });
        canDelete = false;
      } else {
        // Aulas sem presença não impedem exclusão, mas informa
        blockers.push({
          type: 'lessons_no_attendance',
          count: classWithRelations.lessons.length,
          message: `Turma possui ${classWithRelations.lessons.length} aula(s) sem presença registrada`,
          details: classWithRelations.lessons.map(lesson => ({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonDate: lesson.startDate,
          })),
        });
      }
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir esta turma devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir esta turma, você deve primeiro:',
          blockers.some(b => b.type === 'students') ? '• Remover os estudantes matriculados' : null,
          blockers.some(b => b.type === 'lessons') ? '• Remover as aulas com presença registrada' : null,
          blockers.some(b => b.type === 'lessons_no_attendance') ? '• As aulas sem presença serão removidas automaticamente' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir a turma
    await this.prisma.class.delete({ where: { id } });
    return { message: 'Turma excluída com sucesso' };
  }

  // --- LESSON CRUD ---

  // Criar nova aula
  async createLesson(createLessonDto: CreateLessonDto) {
    // Remove strings vazias dos campos opcionais
    Object.keys(createLessonDto).forEach(key => {
      if (createLessonDto[key] === '') {
        createLessonDto[key] = undefined;
      }
    });
    const lesson = await this.prisma.lesson.create({ data: createLessonDto });
    return lesson;
  }

  // Buscar aula por ID
  async getLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        instructor: true,
        client: true,
        class: true,
        attendances: true,
      },
    });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    return lesson;
  }

  // Listar todas as aulas (com paginação e busca)
  async getLessons(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { status: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { observations: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: true,
          client: true,
          class: true,
          attendances: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lesson.count({ where }),
    ]);
    return {
      lessons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Atualizar parcialmente aula (PATCH)
  async patchLesson(id: string, patchDto: PatchLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    
    // Limpa strings vazias
    Object.keys(patchDto).forEach(key => {
      if ((patchDto as any)[key] === '') {
        (patchDto as any)[key] = undefined;
      }
    });
    
    // Monta objeto de atualização apenas com campos definidos
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo fornecido para atualização');
    }
    
    try {
      const updated = await this.prisma.lesson.update({ 
        where: { id }, 
        data: updateData 
      });
      
      return updated;
    } catch (error: any) {
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        throw new BadRequestException('Dados já existem para outra aula');
      }
      
      // Re-lançar outros erros
      throw error;
    }
  }

  // Deletar aula
  async deleteLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    // Verificar se a aula possui relacionamentos que impedem a exclusão
    const lessonWithRelations = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            training: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lessonWithRelations) {
      throw new NotFoundException('Aula não encontrada');
    }

    const blockers: Array<{
      type: string;
      count: number;
      message: string;
      details: any[];
    }> = [];
    let canDelete = true;

    // Verificar presenças registradas
    if (lessonWithRelations.attendances.length > 0) {
      blockers.push({
        type: 'attendances',
        count: lessonWithRelations.attendances.length,
        message: `Aula possui ${lessonWithRelations.attendances.length} registro(s) de presença`,
        details: lessonWithRelations.attendances.map(attendance => ({
          attendanceId: attendance.id,
          studentName: attendance.student.name,
          status: attendance.status,
          observations: attendance.observations,
        })),
      });
      canDelete = false;
    }

    // Se não pode excluir, retornar erro detalhado
    if (!canDelete) {
      throw new BadRequestException({
        message: 'Não é possível excluir esta aula devido aos relacionamentos existentes',
        blockers,
        suggestions: [
          'Para excluir esta aula, você deve primeiro:',
          blockers.some(b => b.type === 'attendances') ? '• Remover todos os registros de presença' : null,
        ].filter(Boolean),
      });
    }

    // Se chegou até aqui, pode excluir a aula
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Aula excluída com sucesso' };
  }

  // --- LESSON ATTENDANCE CRUD ---


  /**
   * Buscar todas as presenças de aula de uma turma
   */
  async getLessonAttendanceByClassId(classId: string) {
    // Busca todas as aulas da turma
    const lessons = await this.prisma.lesson.findMany({
      where: { classId },
      select: { id: true }
    });
    const lessonIds = lessons.map(l => l.id);
    if (lessonIds.length === 0) {
      return { attendances: [], message: 'Nenhuma aula encontrada para esta turma.' };
    }
    // Busca todas as presenças dessas aulas
    const attendances = await this.prisma.lessonAttendance.findMany({
      where: { lessonId: { in: lessonIds } },
      include: {
        lesson: true,
        student: true,
      }
    });
    return { attendances };
  }

  /**
   * Marcar todos os alunos de uma turma como ausentes em uma aula específica
   */
  async markAllStudentsAbsent(classId: string, lessonId: string) {
    // Verifica se a turma existe
    const turma = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { students: true },
    });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verifica se a aula existe e pertence à turma
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }
    if (lesson.classId !== classId) {
      throw new BadRequestException('Esta aula não pertence à turma informada');
    }

    // Verifica se há alunos na turma
    if (turma.students.length === 0) {
      throw new BadRequestException('Não há alunos cadastrados nesta turma');
    }

    // Busca presenças já existentes para esta aula
    const existingAttendances = await this.prisma.lessonAttendance.findMany({
      where: { lessonId },
      select: { studentId: true },
    });
    const existingStudentIds = existingAttendances.map(att => att.studentId);

    // Filtra apenas alunos que ainda não têm presença registrada
    const studentsToMarkAbsent = turma.students.filter(student => !existingStudentIds.includes(student.id));

    if (studentsToMarkAbsent.length === 0) {
      return { 
        message: 'Todos os alunos da turma já possuem presença registrada para esta aula',
        markedAbsent: 0,
        totalStudents: turma.students.length
      };
    }

    // Cria registros de presença como "AUSENTE" para todos os alunos que não têm presença
    const attendanceData = studentsToMarkAbsent.map(student => ({
      lessonId,
      studentId: student.id,
      status: 'AUSENTE',
      observations: 'Marcado como ausente automaticamente',
    }));

    await this.prisma.lessonAttendance.createMany({
      data: attendanceData,
    });

    return { 
      message: `${studentsToMarkAbsent.length} alunos marcados como ausentes`,
      markedAbsent: studentsToMarkAbsent.length,
      totalStudents: turma.students.length,
      studentsMarked: studentsToMarkAbsent.map(s => ({ id: s.id, name: s.name }))
    };
  }

  // Criar nova presença de aula
  async createLessonAttendance(createDto: CreateLessonAttendanceDto) {
    // Garante unicidade por lessonId + studentId
    const existing = await this.prisma.lessonAttendance.findUnique({
      where: {

        lessonId_studentId: {
          lessonId: createDto.lessonId,
          studentId: createDto.studentId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Já existe presença para este aluno nesta aula');
    }
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === '') {
        createDto[key] = undefined;
      }
    });
    const attendance = await this.prisma.lessonAttendance.create({ data: createDto });
    return attendance;
  }

  // Buscar presença por ID
  async getLessonAttendanceById(id: string) {
    const attendance = await this.prisma.lessonAttendance.findUnique({
      where: { id },
      include: {
        lesson: true,
        student: true,
      },
    });
    if (!attendance) {
      throw new NotFoundException('Presença não encontrada');
    }
    return attendance;
  }

  // Listar todas as presenças (com paginação e busca)
  async getLessonAttendances(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    // Busca por status ou observações
    const where: any = search
      ? {
          OR: [
            { status: { contains: search, mode: 'insensitive' } },
            { observations: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [attendances, total] = await Promise.all([
      this.prisma.lessonAttendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          lesson: true,
          student: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lessonAttendance.count({ where }),
    ]);
    return {
      attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Atualizar parcialmente presença (PATCH)
  async patchLessonAttendance(id: string, patchDto: PatchLessonAttendanceDto) {
    console.log('patchLessonAttendance called with:', { id, patchDto });
    
    // Validar ID
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('ID da presença é obrigatório e deve ser uma string válida');
    }
    
    const attendance = await this.prisma.lessonAttendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Presença não encontrada');
    }
    
    // Verificar se patchDto é válido
    if (!patchDto || typeof patchDto !== 'object') {
      throw new BadRequestException('Dados de atualização inválidos');
    }
    
    // Validar se pelo menos um campo foi fornecido
    const allowedFields = ['lessonId', 'studentId', 'status', 'observations'];
    const providedFields = Object.keys(patchDto).filter(key => allowedFields.includes(key));
    
    console.log('Provided fields:', providedFields);
    
    if (providedFields.length === 0) {
      throw new BadRequestException('Pelo menos um campo válido deve ser fornecido para atualização');
    }
    
    // Remove strings vazias e valores nulos dos campos opcionais
    Object.keys(patchDto).forEach(key => {
      if ((patchDto as any)[key] === '' || (patchDto as any)[key] === null) {
        (patchDto as any)[key] = undefined;
      }
    });
    
    const updateData: any = {};
    for (const key of Object.keys(patchDto)) {
      if ((patchDto as any)[key] !== undefined && allowedFields.includes(key)) {
        updateData[key] = (patchDto as any)[key];
      }
    }
    
    console.log('Update data:', updateData);
    
    // Se não há dados para atualizar após limpeza, retornar erro
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nenhum campo válido fornecido para atualização');
    }
    
    // Validar se lessonId e studentId existem (se fornecidos)
    if (updateData.lessonId && updateData.lessonId !== attendance.lessonId) {
      const lessonExists = await this.prisma.lesson.findUnique({ where: { id: updateData.lessonId } });
      if (!lessonExists) {
        throw new BadRequestException('Aula não encontrada');
      }
    }
    
    if (updateData.studentId && updateData.studentId !== attendance.studentId) {
      const studentExists = await this.prisma.student.findUnique({ where: { id: updateData.studentId } });
      if (!studentExists) {
        throw new BadRequestException('Estudante não encontrado');
      }
    }
    
    try {
      const updated = await this.prisma.lessonAttendance.update({ 
        where: { id }, 
        data: updateData,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return updated;
    } catch (error: any) {
      console.error('Erro ao atualizar presença:', error);
      
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        
        if (fields.includes('lessonId_studentId')) {
          throw new BadRequestException('Já existe presença para este aluno nesta aula');
        }
        
        throw new BadRequestException('Dados já existem para outra presença');
      }
      
      if (error.code === 'P2003') {
        const field = error.meta?.field_name || 'campo relacionado';
        throw new BadRequestException(`Dados relacionados não encontrados para ${field}`);
      }
      
      if (error.code === 'P2025') {
        throw new NotFoundException('Presença não encontrada para atualização');
      }
      
      // Re-lançar outros erros
      throw new BadRequestException('Erro interno ao atualizar presença');
    }
  }

  // Deletar presença
  async deleteLessonAttendance(id: string) {
    const attendance = await this.prisma.lessonAttendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Presença não encontrada');
    }
    await this.prisma.lessonAttendance.delete({ where: { id } });
    return { message: 'Presença excluída com sucesso' };
  }

  // --- SIGNATURE CRUD ---

  // Criar ou atualizar assinatura de instrutor
  async uploadSignature(instructorId: string, filename: string) {
    // Verificar se o instrutor existe
    const instructor = await this.prisma.instructor.findUnique({ 
      where: { id: instructorId } 
    });
    
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    // Verificar se já existe uma assinatura para este instrutor
    const existingSignature = await this.prisma.signature.findUnique({
      where: { instructorId }
    });

    const pngPath = `/uploads/signatures/${filename}`;

    if (existingSignature) {
      // Deletar arquivo antigo se existir
      const oldFilePath = path.join(process.cwd(), 'uploads', 'signatures', path.basename(existingSignature.pngPath));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Atualizar assinatura existente
      const updatedSignature = await this.prisma.signature.update({
        where: { instructorId },
        data: { pngPath },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        message: 'Assinatura atualizada com sucesso',
        signature: updatedSignature
      };
    } else {
      // Criar nova assinatura
      const newSignature = await this.prisma.signature.create({
        data: {
          instructorId,
          pngPath
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        message: 'Assinatura criada com sucesso',
        signature: newSignature
      };
    }
  }

  // Criar ou atualizar assinatura de instrutor com path da imagem
  async createInstructorSignature(instructorId: string, imagePath: string) {
    // Verificar se o instrutor existe
    const instructor = await this.prisma.instructor.findUnique({ 
      where: { id: instructorId } 
    });
    
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    // Verificar se já existe uma assinatura para este instrutor
    const existingSignature = await this.prisma.signature.findUnique({
      where: { instructorId }
    });

    if (existingSignature) {
      // Deletar arquivo antigo se existir e for diferente do novo
      if (existingSignature.pngPath !== imagePath) {
        const oldFilePath = path.join(process.cwd(), existingSignature.pngPath.replace(/^\//, ''));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Atualizar assinatura existente
      const updatedSignature = await this.prisma.signature.update({
        where: { instructorId },
        data: { pngPath: imagePath },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        message: 'Assinatura atualizada com sucesso',
        signature: updatedSignature
      };
    } else {
      // Criar nova assinatura
      const newSignature = await this.prisma.signature.create({
        data: {
          instructorId,
          pngPath: imagePath
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        message: 'Assinatura criada com sucesso',
        signature: newSignature
      };
    }
  }

  // Buscar assinatura por ID do instrutor
  async getSignatureByInstructorId(instructorId: string) {
    const signature = await this.prisma.signature.findUnique({
      where: { instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!signature) {
      throw new NotFoundException('Assinatura não encontrada para este instrutor');
    }

    return signature;
  }

  // Listar todas as assinaturas
  async getAllSignatures(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.instructor = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [signatures, total] = await Promise.all([
      this.prisma.signature.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.signature.count({ where })
    ]);

    return {
      signatures,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Deletar assinatura
  async deleteSignature(instructorId: string) {
    const signature = await this.prisma.signature.findUnique({
      where: { instructorId }
    });

    if (!signature) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    // Deletar arquivo físico
    const filePath = path.join(process.cwd(), 'uploads', 'signatures', path.basename(signature.pngPath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar registro do banco
    await this.prisma.signature.delete({
      where: { instructorId }
    });

    return { message: 'Assinatura excluída com sucesso' };
  }

  // Buscar próprios estudantes (empresa do usuário logado)
  async getOwnStudents(userId: string, page: number = 1, limit: number = 10, search?: string) {
    // Buscar o cliente vinculado ao usuário logado
    const client = await this.prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundException('Usuário não possui empresa vinculada');
    }

    const skip = (page - 1) * limit;
    const where: any = {
      clientId: client.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          classes: {
            include: {
              training: true,
              instructor: true,
            },
          },
          certificates: true,
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

  // Buscar próprias turmas (empresa do usuário logado)
  async getOwnClasses(userId: string, page: number = 1, limit: number = 10, search?: string) {
    // Buscar o cliente vinculado ao usuário logado
    const client = await this.prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundException('Usuário não possui empresa vinculada');
    }

    const skip = (page - 1) * limit;
    const where: any = {
      clientId: client.id,
    };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { training: { 
          OR: [
                                                
                                                 { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ]
            }},
            { instructor: { 
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { corporateName: { contains: search, mode: 'insensitive' } },
              ]
            }},
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: true,
          instructor: true,
          students: true,
          lessons: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);
    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Buscar próprias turmas (instrutor logado)
  async getInstructorClasses(userId: string, page: number = 1, limit: number = 10, search?: string) {
    // Buscar o instrutor vinculado ao usuário logado
    const instructor = await this.prisma.instructor.findFirst({
      where: { userId },
    });

    if (!instructor) {
      throw new NotFoundException('Usuário não possui perfil de instrutor vinculado');
    }

    const skip = (page - 1) * limit;
    const where: any = {
      instructorId: instructor.id,
    };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { training: { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }},
        { client: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: true,
          client: true,
          students: true,
          lessons: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Dashboard do cliente
  async getClientDashboard(clientId: string): Promise<ClientDashboardDto> {
    // Validar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Buscar dados do dashboard em paralelo
    const [
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      scheduledLessons
    ] = await Promise.all([
      // Quantidade total de estudantes da empresa
      this.prisma.student.count({
        where: { clientId }
      }),
      
      // Quantidade total de turmas da empresa
      this.prisma.class.count({
        where: { clientId }
      }),
      
      // Quantidade de aulas agendadas nas turmas da empresa
      this.prisma.lesson.count({
        where: { 
          clientId,
          status: 'AGENDADA'
        }
      }),
      
      // Quantidade de turmas com status = CONCLUIDO
      this.prisma.class.count({
        where: { 
          clientId,
          status: 'CONCLUIDO'
        }
      }),
      
      // Aulas agendadas para exibir na agenda
      this.prisma.lesson.findMany({
        where: { 
          clientId,
          status: 'AGENDADA'
        },
        include: {
          instructor: {
            select: {
              name: true
            }
          },
          class: {
            select: {
              training: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' },
        take: 50 // Limitando a 50 aulas para não sobrecarregar
      })
    ]);

    // Transformar as aulas agendadas para o formato do DTO
    const scheduledLessonsDto: ScheduledLessonDto[] = scheduledLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      startDate: lesson.startDate,
      endDate: lesson.endDate,
      location: lesson.location,
      status: lesson.status,
      instructorName: lesson.instructor.name,
      className: lesson.class?.training?.title,
      observations: lesson.observations
    }));

    return {
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      scheduledLessons: scheduledLessonsDto
    };
  }

  // Dashboard do instrutor
  async getInstructorDashboard(instructorId: string): Promise<InstructorDashboardDto> {
    // Validar se o instrutor existe
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
    });
    
    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    // Buscar dados do dashboard em paralelo
    const [
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      scheduledLessons
    ] = await Promise.all([
      // Quantidade total de estudantes nas turmas do instrutor
      this.prisma.student.count({
        where: { 
          classes: {
            some: {
              instructorId
            }
          }
        }
      }),
      
      // Quantidade total de turmas do instrutor
      this.prisma.class.count({
        where: { instructorId }
      }),
      
      // Quantidade de aulas agendadas do instrutor
      this.prisma.lesson.count({
        where: { 
          instructorId,
          status: 'AGENDADA'
        }
      }),
      
      // Quantidade de turmas com status = CONCLUIDO
      this.prisma.class.count({
        where: { 
          instructorId,
          status: 'CONCLUIDO'
        }
      }),
      
      // Aulas agendadas para exibir na agenda
      this.prisma.lesson.findMany({
        where: { 
          instructorId,
          status: 'AGENDADA'
        },
        include: {
          client: {
            select: {
              name: true
            }
          },
          class: {
            select: {
              training: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' },
        take: 50 // Limitando a 50 aulas para não sobrecarregar
      })
    ]);

    // Transformar as aulas agendadas para o formato do DTO
    const scheduledLessonsDto: InstructorScheduledLessonDto[] = scheduledLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      startDate: lesson.startDate,
      endDate: lesson.endDate,
      location: lesson.location,
      status: lesson.status,
      className: lesson.class?.training?.title,
      clientName: lesson.client?.name,
      observations: lesson.observations
    }));

    return {
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      scheduledLessons: scheduledLessonsDto
    };
  }

  // Dashboard do admin
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    // Buscar dados do dashboard em paralelo
    const [
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      totalInstructors,
      totalClients,
      totalTrainings,
      scheduledLessons,
      recentClasses,
      recentLessons,
      recentStudents
    ] = await Promise.all([
      // Quantidade total de estudantes
      this.prisma.student.count(),
      
      // Quantidade total de turmas
      this.prisma.class.count(),
      
      // Quantidade de aulas agendadas
      this.prisma.lesson.count({
        where: { 
          status: 'AGENDADA'
        }
      }),
      
      // Quantidade de turmas com status = CONCLUIDO
      this.prisma.class.count({
        where: { 
          status: 'CONCLUIDO'
        }
      }),
      
      // Quantidade total de instrutores
      this.prisma.instructor.count(),
      
      // Quantidade total de clientes
      this.prisma.client.count(),
      
      // Quantidade total de treinamentos
      this.prisma.training.count(),
      
      // Aulas agendadas para exibir na agenda
      this.prisma.lesson.findMany({
        where: { 
          status: 'AGENDADA'
        },
        include: {
          instructor: {
            select: {
              name: true
            }
          },
          client: {
            select: {
              name: true
            }
          },
          class: {
            select: {
              training: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' },
        take: 50 // Limitando a 50 aulas para não sobrecarregar
      }),
      
      // Turmas criadas recentemente (últimos 30 dias)
      this.prisma.class.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
          }
        },
        include: {
          training: {
            select: {
              title: true
            }
          },
          client: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Aulas criadas recentemente (últimos 7 dias)
      this.prisma.lesson.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
          }
        },
        include: {
          instructor: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Estudantes matriculados recentemente (últimos 7 dias)
      this.prisma.student.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
          }
        },
        include: {
          client: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Transformar as aulas agendadas para o formato do DTO
    const scheduledLessonsDto: AdminScheduledLessonDto[] = scheduledLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      startDate: lesson.startDate,
      endDate: lesson.endDate,
      location: lesson.location,
      status: lesson.status,
      instructorName: lesson.instructor.name,
      clientName: lesson.client?.name,
      className: lesson.class?.training?.title,
      observations: lesson.observations
    }));

    // Criar atividades recentes
    const recentActivities: RecentActivityDto[] = [];
    
    // Adicionar turmas criadas
    recentClasses.forEach(cls => {
      recentActivities.push({
        id: cls.id,
        type: 'CLASS_CREATED',
        description: `Nova turma criada: ${cls.training?.title} ${cls.client?.name ? `para ${cls.client.name}` : ''}`,
        createdAt: cls.createdAt,
        entityId: cls.id,
        entityType: 'CLASS'
      });
    });
    
    // Adicionar aulas criadas
    recentLessons.forEach(lesson => {
      recentActivities.push({
        id: lesson.id,
        type: 'LESSON_CREATED',
        description: `Nova aula agendada: ${lesson.title} com ${lesson.instructor.name}`,
        createdAt: lesson.createdAt,
        entityId: lesson.id,
        entityType: 'LESSON'
      });
    });
    
    // Adicionar estudantes matriculados
    recentStudents.forEach(student => {
      recentActivities.push({
        id: student.id,
        type: 'STUDENT_ENROLLED',
        description: `Novo estudante matriculado: ${student.name} ${student.client?.name ? `(${student.client.name})` : ''}`,
        createdAt: student.createdAt,
        entityId: student.id,
        entityType: 'STUDENT'
      });
    });

    // Ordenar atividades por data (mais recentes primeiro) e limitar a 20
    recentActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const limitedActivities = recentActivities.slice(0, 20);

    return {
      totalStudents,
      totalClasses,
      totalScheduledLessons,
      totalCompletedClasses,
      totalInstructors,
      totalClients,
      totalTrainings,
      scheduledLessons: scheduledLessonsDto,
      recentActivities: limitedActivities
    };
  }

  // Buscar clientId baseado no userId
  async getClientIdByUserId(userId: string) {
    // Busca o cliente que tem o userId vinculado
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return null; // Retorna null se não encontrar cliente vinculado
    }

    return client.id;
  }

  // Buscar instructorId baseado no userId
  async getInstructorIdByUserId(userId: string) {
    // Busca o instrutor que tem o userId vinculado
    const instructor = await this.prisma.instructor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!instructor) {
      return null; // Retorna null se não encontrar instrutor vinculado
    }

    return instructor.id;
  }

  // Buscar todas as classes finalizadas
  async getFinishedClasses(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      status: 'CONCLUIDO'
    };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { training: { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }},
        { instructor: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { corporateName: { contains: search, mode: 'insensitive' } },
          ]
        }},
        { client: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            select: {
              id: true,
              title: true,
              description: true,
              durationHours: true,
              validityDays: true,
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              corporateName: true,
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              cnpj: true,
            }
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              birthDate: true,
              mobileAreaCode: true,
              mobileNumber: true,
              landlineAreaCode: true,
              landlineNumber: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              createdAt: true,
            }
          },
          lessons: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              attendances: {
                select: {
                  id: true,
                  status: true,
                  observations: true,
                  student: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    }
                  }
                }
              }
            }
          },
        },
        orderBy: { endDate: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);

    // Processar as classes para adicionar informações de presença
    const processedClasses = classes.map(classItem => {
      const studentsWithAttendance = classItem.students.map(student => {
        const attendances = classItem.lessons.flatMap(lesson => 
          lesson.attendances.filter(attendance => attendance.student.id === student.id)
        );
        
        const absences = attendances.filter(attendance => attendance.status === 'AUSENTE');
        
        return {
          ...student,
          attendances: attendances.map(attendance => ({
            id: attendance.id,
            status: attendance.status,
            observations: attendance.observations,
            lessonId: classItem.lessons.find(lesson => 
              lesson.attendances.some(att => att.id === attendance.id)
            )?.id,
          })),
          totalAbsences: absences.length,
          hasAbsences: absences.length > 0,
        };
      });

      return {
        ...classItem,
        students: studentsWithAttendance,
        attendanceSummary: {
          totalLessons: classItem.lessons.length,
          totalStudents: classItem.students.length,
          studentsWithoutAbsences: studentsWithAttendance.filter(s => !s.hasAbsences).length,
          studentsWithAbsences: studentsWithAttendance.filter(s => s.hasAbsences).length,
        }
      };
    });

    return {
      classes: processedClasses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Buscar classes finalizadas por ID do cliente
  async getFinishedClassesByClientId(clientId: string, page: number = 1, limit: number = 10, search?: string) {
    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const skip = (page - 1) * limit;
    
    const where: any = {
      clientId,
      status: 'CONCLUIDO'
    };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { training: { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }},
        { instructor: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { corporateName: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            select: {
              id: true,
              title: true,
              description: true,
              durationHours: true,
              validityDays: true,
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              corporateName: true,
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              cnpj: true,
            }
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              birthDate: true,
              mobileAreaCode: true,
              mobileNumber: true,
              landlineAreaCode: true,
              landlineNumber: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              createdAt: true,
            }
          },
          lessons: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              attendances: {
                select: {
                  id: true,
                  status: true,
                  observations: true,
                  student: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    }
                  }
                }
              }
            }
          },
        },
        orderBy: { endDate: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);

    // Processar as classes para adicionar informações de presença
    const processedClasses = classes.map(classItem => {
      const studentsWithAttendance = classItem.students.map(student => {
        const attendances = classItem.lessons.flatMap(lesson => 
          lesson.attendances.filter(attendance => attendance.student.id === student.id)
        );
        
        const absences = attendances.filter(attendance => attendance.status === 'AUSENTE');
        
        return {
          ...student,
          attendances: attendances.map(attendance => ({
            id: attendance.id,
            status: attendance.status,
            observations: attendance.observations,
            lessonId: classItem.lessons.find(lesson => 
              lesson.attendances.some(att => att.id === attendance.id)
            )?.id,
          })),
          totalAbsences: absences.length,
          hasAbsences: absences.length > 0,
        };
      });

      return {
        ...classItem,
        students: studentsWithAttendance,
        attendanceSummary: {
          totalLessons: classItem.lessons.length,
          totalStudents: classItem.students.length,
          studentsWithoutAbsences: studentsWithAttendance.filter(s => !s.hasAbsences).length,
          studentsWithAbsences: studentsWithAttendance.filter(s => s.hasAbsences).length,
        }
      };
    });

    return {
      classes: processedClasses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Buscar classes finalizadas por ID do instrutor
  async getFinishedClassesByInstructorId(instructorId: string, page: number = 1, limit: number = 10, search?: string) {
    // Verificar se o instrutor existe
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      throw new NotFoundException('Instrutor não encontrado');
    }

    const skip = (page - 1) * limit;
    
    const where: any = {
      instructorId,
      status: 'CONCLUIDO'
    };

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { training: { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }},
        { client: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search, mode: 'insensitive' } },
            { cnpj: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          training: {
            select: {
              id: true,
              title: true,
              description: true,
              durationHours: true,
              validityDays: true,
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              corporateName: true,
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              cnpj: true,
            }
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              birthDate: true,
              mobileAreaCode: true,
              mobileNumber: true,
              landlineAreaCode: true,
              landlineNumber: true,
              address: true,
              city: true,
              state: true,
              zipCode: true,
              createdAt: true,
            }
          },
          lessons: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              status: true,
              attendances: {
                select: {
                  id: true,
                  status: true,
                  observations: true,
                  student: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    }
                  }
                }
              }
            }
          },
        },
        orderBy: { endDate: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);

    // Processar as classes para adicionar informações de presença
    const processedClasses = classes.map(classItem => {
      const studentsWithAttendance = classItem.students.map(student => {
        const attendances = classItem.lessons.flatMap(lesson => 
          lesson.attendances.filter(attendance => attendance.student.id === student.id)
        );
        
        const absences = attendances.filter(attendance => attendance.status === 'AUSENTE');
        
        return {
          ...student,
          attendances: attendances.map(attendance => ({
            id: attendance.id,
            status: attendance.status,
            observations: attendance.observations,
            lessonId: classItem.lessons.find(lesson => 
              lesson.attendances.some(att => att.id === attendance.id)
            )?.id,
          })),
          totalAbsences: absences.length,
          hasAbsences: absences.length > 0,
        };
      });

      return {
        ...classItem,
        students: studentsWithAttendance,
        attendanceSummary: {
          totalLessons: classItem.lessons.length,
          totalStudents: classItem.students.length,
          studentsWithoutAbsences: studentsWithAttendance.filter(s => !s.hasAbsences).length,
          studentsWithAbsences: studentsWithAttendance.filter(s => s.hasAbsences).length,
        }
      };
    });

    return {
      classes: processedClasses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
