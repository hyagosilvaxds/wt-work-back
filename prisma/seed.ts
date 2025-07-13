import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  try {
    // Verificar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Limpar dados existentes (para evitar conflitos)
    console.log('🧹 Limpando dados existentes...');
    await prisma.rolePermission.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.client.deleteMany({});
    console.log('✅ Dados limpos');

    console.log('📝 Criando permissões...');
    // Criar permissões organizadas por módulo
    const permissions = await Promise.all([
      // Permissões de Usuários
      prisma.permission.create({
        data: {
          name: 'CREATE_USERS',
          description: 'Criar Usuários',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_USERS',
          description: 'Visualizar Usuários',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_USERS',
          description: 'Editar Usuários',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_USERS',
          description: 'Excluir Usuários',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'MANAGE_USERS',
          description: 'Gerenciar Usuários (Acesso Total)',
        },
      }),

      // Permissões de Funções (Roles)
      prisma.permission.create({
        data: {
          name: 'CREATE_ROLES',
          description: 'Criar Funções',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_ROLES',
          description: 'Visualizar Funções',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_ROLES',
          description: 'Editar Funções',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_ROLES',
          description: 'Excluir Funções',
        },
      }),

      // Permissões de Alunos
      prisma.permission.create({
        data: {
          name: 'CREATE_STUDENTS',
          description: 'Criar Alunos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_STUDENTS',
          description: 'Visualizar Alunos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_STUDENTS',
          description: 'Editar Alunos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_STUDENTS',
          description: 'Excluir Alunos',
        },
      }),

      // Permissões de Treinamentos
      prisma.permission.create({
        data: {
          name: 'CREATE_TRAININGS',
          description: 'Criar Treinamentos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_TRAININGS',
          description: 'Visualizar Todos os Treinamentos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_OWN_TRAININGS',
          description: 'Visualizar Apenas Treinamentos Ministrados por Ele',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_TRAININGS',
          description: 'Editar Treinamentos',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_OWN_TRAININGS',
          description: 'Editar Apenas Treinamentos Ministrados por Ele',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_TRAININGS',
          description: 'Excluir Treinamentos',
        },
      }),

      // Permissões de Aulas
      prisma.permission.create({
        data: {
          name: 'CREATE_CLASSES',
          description: 'Criar Aulas',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_CLASSES',
          description: 'Visualizar Todas as Aulas',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_OWN_CLASSES',
          description: 'Visualizar Apenas Aulas Ministradas por Ele',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_CLASSES',
          description: 'Editar Aulas',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_OWN_CLASSES',
          description: 'Editar Apenas Aulas Ministradas por Ele',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_CLASSES',
          description: 'Excluir Aulas',
        },
      }),

      // Permissões Financeiras
      prisma.permission.create({
        data: {
          name: 'CREATE_FINANCIAL',
          description: 'Criar Registros Financeiros',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_FINANCIAL',
          description: 'Visualizar Dados Financeiros',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_ACCOUNTS_RECEIVABLE',
          description: 'Visualizar Contas a Receber',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_ACCOUNTS_PAYABLE',
          description: 'Visualizar Contas a Pagar',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'SETTLE_ACCOUNTS',
          description: 'Quitar Contas',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_CASH_FLOW',
          description: 'Visualizar Fluxo de Caixa',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'MANAGE_BANK_ACCOUNTS',
          description: 'Gerenciar Contas Bancárias',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_FINANCIAL',
          description: 'Editar Dados Financeiros',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_FINANCIAL',
          description: 'Excluir Registros Financeiros',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_FINANCIAL_REPORTS',
          description: 'Visualizar Relatórios Financeiros',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'GENERATE_FINANCIAL_REPORTS',
          description: 'Gerar Relatórios Financeiros',
        },
      }),

      // Permissões de Certificados
      prisma.permission.create({
        data: {
          name: 'CREATE_CERTIFICATES',
          description: 'Criar Certificados',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'CREATE_OWN_CERTIFICATES',
          description: 'Emitir Certificados Apenas de Treinamentos Ministrados por Ele',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_CERTIFICATES',
          description: 'Visualizar Certificados',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_OWN_CERTIFICATES',
          description: 'Visualizar Apenas Certificados de Treinamentos Ministrados por Ele',
        },
      }),

      // Permissões de Perfil
      prisma.permission.create({
        data: {
          name: 'VIEW_PROFILE',
          description: 'Visualizar Perfil',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_PROFILE',
          description: 'Editar Perfil',
        },
      }),

      // Permissões de Relatórios
      prisma.permission.create({
        data: {
          name: 'CREATE_REPORTS',
          description: 'Criar Relatórios',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_REPORTS',
          description: 'Visualizar Relatórios',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EDIT_REPORTS',
          description: 'Editar Relatórios',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'DELETE_REPORTS',
          description: 'Excluir Relatórios',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'EXPORT_REPORTS',
          description: 'Exportar Relatórios',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_ANALYTICS',
          description: 'Visualizar Análises',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'VIEW_DASHBOARD',
          description: 'Visualizar Dashboard',
        },
      }),
    ]);
    console.log(`✅ ${permissions.length} permissões criadas`);

    console.log('👥 Criando roles...');
    // Criar roles
    const superAdminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Administrador com acesso total',
      },
    });

    const instructorRole = await prisma.role.create({
      data: {
        name: 'INSTRUCTOR',
        description: 'Instrutor que pode ministrar aulas',
      },
    });

    const studentRole = await prisma.role.create({
      data: {
        name: 'STUDENT',
        description: 'Estudante que pode se inscrever em aulas',
      },
    });

    const financialRole = await prisma.role.create({
      data: {
        name: 'FINANCIAL',
        description: 'Responsável financeiro com acesso a dados financeiros',
      },
    });
    console.log('✅ 4 roles criadas');

    console.log('🔗 Associando permissões às roles...');
    // Associar todas as permissões ao Super Admin
    await Promise.all(
      permissions.map(permission =>
        prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        })
      )
    );

    // Associar permissões específicas ao Instructor
    const instructorPermissions = permissions.filter(p => 
      [
        'VIEW_OWN_TRAININGS', 'EDIT_OWN_TRAININGS', 'CREATE_TRAININGS',
        'VIEW_OWN_CLASSES', 'EDIT_OWN_CLASSES', 'CREATE_CLASSES',
        'VIEW_STUDENTS', 'EDIT_STUDENTS',
        'VIEW_OWN_CERTIFICATES', 'CREATE_OWN_CERTIFICATES',
        'VIEW_PROFILE', 'EDIT_PROFILE',
        'VIEW_REPORTS', 'VIEW_ANALYTICS', 'VIEW_DASHBOARD'
      ].includes(p.name)
    );
    
    await Promise.all(
      instructorPermissions.map(permission =>
        prisma.rolePermission.create({
          data: {
            roleId: instructorRole.id,
            permissionId: permission.id,
          },
        })
      )
    );

    // Associar permissões específicas ao Student
    const studentPermissions = permissions.filter(p => 
      [
        'VIEW_TRAININGS', 'VIEW_CLASSES', 'VIEW_CERTIFICATES',
        'VIEW_PROFILE', 'EDIT_PROFILE'
      ].includes(p.name)
    );
    
    await Promise.all(
      studentPermissions.map(permission =>
        prisma.rolePermission.create({
          data: {
            roleId: studentRole.id,
            permissionId: permission.id,
          },
        })
      )
    );

    // Associar permissões específicas ao Financial
    const financialPermissions = permissions.filter(p => 
      [
        'VIEW_FINANCIAL', 'EDIT_FINANCIAL', 'CREATE_FINANCIAL', 'DELETE_FINANCIAL',
        'VIEW_ACCOUNTS_RECEIVABLE', 'VIEW_ACCOUNTS_PAYABLE', 'SETTLE_ACCOUNTS',
        'VIEW_CASH_FLOW', 'MANAGE_BANK_ACCOUNTS',
        'VIEW_FINANCIAL_REPORTS', 'GENERATE_FINANCIAL_REPORTS',
        'VIEW_PROFILE', 'EDIT_PROFILE',
        'VIEW_REPORTS', 'VIEW_ANALYTICS', 'VIEW_DASHBOARD'
      ].includes(p.name)
    );
    
    await Promise.all(
      financialPermissions.map(permission =>
        prisma.rolePermission.create({
          data: {
            roleId: financialRole.id,
            permissionId: permission.id,
          },
        })
      )
    );
    console.log('✅ Permissões associadas às roles');

    console.log('🎯 Criando skills...');
    // Criar skills
    const skills = await Promise.all([
      prisma.skill.create({ data: { name: 'JavaScript' } }),
      prisma.skill.create({ data: { name: 'TypeScript' } }),
      prisma.skill.create({ data: { name: 'React' } }),
      prisma.skill.create({ data: { name: 'Node.js' } }),
      prisma.skill.create({ data: { name: 'Python' } }),
      prisma.skill.create({ data: { name: 'Liderança' } }),
      prisma.skill.create({ data: { name: 'Comunicação' } }),
    ]);
    console.log(`✅ ${skills.length} skills criadas`);

    console.log('🏢 Criando cliente...');
    // Criar um cliente
    const client = await prisma.client.create({
      data: {
        name: 'Empresa ABC',
        responsibleName: 'João Silva',
        email: 'joao@empresaabc.com',
        responsiblePhone: '(11) 99999-9999',
        personType: 'JURIDICA',
        cnpj: '12.345.678/0001-90',
      },
    });
    console.log('✅ Cliente criado');

    console.log('🔐 Gerando senhas hasheadas...');
    // Gerar senhas hasheadas
    const defaultPassword = '123456'; // Senha padrão para todos os usuários
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log(`✅ Senha hasheada gerada (senha: ${defaultPassword})`);

    console.log('👤 Criando usuários...');
    // Criar usuários de exemplo
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@sistema.com',
        password: hashedPassword,
        roleId: superAdminRole.id,
      },
    });

    const instructor = await prisma.user.create({
      data: {
        name: 'Maria Instrutora',
        email: 'maria@sistema.com',
        password: hashedPassword,
        roleId: instructorRole.id,
        bio: 'Instrutora especializada em desenvolvimento web com mais de 5 anos de experiência.',
        skills: {
          connect: [
            { id: skills[0].id }, // JavaScript
            { id: skills[1].id }, // TypeScript
            { id: skills[2].id }, // React
          ],
        },
      },
    });

    const financial = await prisma.user.create({
      data: {
        name: 'Ana Financeira',
        email: 'ana@sistema.com',
        password: hashedPassword,
        roleId: financialRole.id,
        bio: 'Responsável pelo setor financeiro da empresa.',
      },
    });

    // Criar um estudante usando o modelo Student
    const student = await prisma.student.create({
      data: {
        name: 'Pedro Estudante',
        cpf: '123.456.789-00',
        email: 'pedro@sistema.com',
        clientId: client.id,
        enrollmentDate: new Date(),
      },
    });

    console.log('🎉 Seed executado com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${permissions.length} permissões`);
    console.log(`   - 4 roles`);
    console.log(`   - ${skills.length} skills`);
    console.log(`   - 1 cliente`);
    console.log(`   - 3 usuários + 1 estudante`);
    console.log('');
    console.log('👤 Usuários criados:');
    console.log(`   - Super Admin: ${superAdmin.email} | Senha: ${defaultPassword}`);
    console.log(`   - Instructor: ${instructor.email} | Senha: ${defaultPassword}`);
    console.log(`   - Financial: ${financial.email} | Senha: ${defaultPassword}`);
    console.log(`   - Student: ${student.email} | CPF: ${student.cpf}`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
