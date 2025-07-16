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

    console.log('� Criando roles...');
    // Criar roles primeiro para usar seus IDs
    const clienteRole = await prisma.role.create({
      data: {
        id: 'cmd3ynn8p0000vbouraxlw6xy',
        name: 'CLIENTE',
        description: 'Cliente com acesso limitado',
      },
    });

    const instrutorRole = await prisma.role.create({
      data: {
        id: 'cmcxv2jvf001evbxl5leu0bsm',
        name: 'INSTRUTOR',
        description: 'Instrutor que pode ministrar aulas',
      },
    });

    const diretorRole = await prisma.role.create({
      data: {
        id: 'cmcxv2jve001dvbxlngd0jium',
        name: 'DIRETOR',
        description: 'Diretor com acesso administrativo',
      },
    });

    const financialRole = await prisma.role.create({
      data: {
        id: 'cmcxv2jvh001gvbxlig3uzzwr',
        name: 'FINANCIALs',
        description: 'Responsável financeiro com acesso a dados financeiros',
      },
    });

    const studentRole = await prisma.role.create({
      data: {
        id: 'cmcxv2jvg001fvbxljwrw5kak',
        name: 'STUDENT',
        description: 'Estudante que pode se inscrever em aulas',
      },
    });

    const superadminRole = await prisma.role.create({
      data: {
        id: 'cmcxv2jvi001hvbxl9k3m8n4p',
        name: 'SUPERADMIN',
        description: 'Super Administrador com acesso total a todas as funcionalidades',
      },
    });

    console.log('✅ 6 roles criadas');

    console.log('📝 Criando permissões...');
    // Criar permissões exatas conforme especificado com IDs específicos
    const permissionsData = [
      { id: 'cmcxv2ju90004vbxloh52kiik', name: 'CREATE_CERTIFICATES', description: 'Criar Certificados', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv40011vbxlso4n1m74', name: 'CREATE_CLASSES', description: 'Criar Aulas', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2juu000evbxlvb664d1h', name: 'CREATE_FINANCIAL', description: 'Criar Registros Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2juh0006vbxll8pbxuxh', name: 'CREATE_OWN_CERTIFICATES', description: 'Emitir Certificados Apenas de Treinamentos Ministrados por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000pvbxlvyuu2hp6', name: 'CREATE_REPORTS', description: 'Criar Relatórios', roles: [diretorRole.id] },
      { id: 'cmcxv2jvb001bvbxljcr6y65v', name: 'CREATE_ROLES', description: 'Criar Funções', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv3000zvbxlkouaowse', name: 'CREATE_STUDENTS', description: 'Criar Alunos', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jut000cvbxlv0p39x1u', name: 'CREATE_TRAININGS', description: 'Criar Treinamentos', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jva001avbxl4shz2t9c', name: 'CREATE_USERS', description: 'Criar Usuários', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50014vbxlet64hzy8', name: 'DELETE_CLASSES', description: 'Excluir Aulas', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jtt0001vbxlpw0xlls3', name: 'DELETE_FINANCIAL', description: 'Excluir Registros Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000qvbxlbwucxrny', name: 'DELETE_REPORTS', description: 'Excluir Relatórios', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jum0008vbxlzvd14c56', name: 'DELETE_ROLES', description: 'Excluir Funções', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jut000bvbxlqslngy42', name: 'DELETE_STUDENTS', description: 'Excluir Alunos', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50015vbxlddjexhv7', name: 'DELETE_TRAININGS', description: 'Excluir Treinamentos', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jus0009vbxlq6iimva3', name: 'DELETE_USERS', description: 'Excluir Usuários', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2juv000gvbxlatw7poc6', name: 'EDIT_CLASSES', description: 'Editar Aulas', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jut000avbxl4etkjqct', name: 'EDIT_FINANCIAL', description: 'Editar Dados Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50016vbxlzs3x2wfh', name: 'EDIT_OWN_CLASSES', description: 'Editar Apenas Aulas Ministradas por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50013vbxl04124luk', name: 'EDIT_OWN_TRAININGS', description: 'Editar Apenas Treinamentos Ministrados por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000ovbxl0lhgnejf', name: 'EDIT_PROFILE', description: 'Editar Perfil', roles: [financialRole.id, diretorRole.id, studentRole.id] },
      { id: 'cmcxv2jv3000xvbxlq44bbthb', name: 'EDIT_REPORTS', description: 'Editar Relatórios', roles: [diretorRole.id] },
      { id: 'cmcxv2juz000lvbxll7te86hd', name: 'EDIT_ROLES', description: 'Editar Funções', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jut000dvbxly5ouxhws', name: 'EDIT_STUDENTS', description: 'Editar Alunos', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jsy0000vbxlqjl1y0z7', name: 'EDIT_TRAININGS', description: 'Editar Treinamentos', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000rvbxlegbjl90j', name: 'EDIT_USERS', description: 'Editar Usuários', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000svbxlghg78rm5', name: 'EXPORT_REPORTS', description: 'Exportar Relatórios', roles: [diretorRole.id] },
      { id: 'cmcxv2ju00003vbxl4jtibfuo', name: 'GENERATE_FINANCIAL_REPORTS', description: 'Gerar Relatórios Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2juu000fvbxlvmajrth6', name: 'MANAGE_BANK_ACCOUNTS', description: 'Gerenciar Contas Bancárias', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jv2000vvbxlivrktmgz', name: 'MANAGE_USERS', description: 'Gerenciar Usuários (Acesso Total)', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50017vbxljxk8tk27', name: 'SETTLE_ACCOUNTS', description: 'Quitar Contas', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jul0007vbxlruimtboh', name: 'VIEW_ACCOUNTS_PAYABLE', description: 'Visualizar Contas a Pagar', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jv3000yvbxlku4nptf3', name: 'VIEW_ACCOUNTS_RECEIVABLE', description: 'Visualizar Contas a Receber', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jv2000tvbxlh2w14iq0', name: 'VIEW_ANALYTICS', description: 'Visualizar Análises', roles: [financialRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv50018vbxlzbauvcvj', name: 'VIEW_CASH_FLOW', description: 'Visualizar Fluxo de Caixa', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2juv000hvbxlg8xpbqlb', name: 'VIEW_CERTIFICATES', description: 'Visualizar Certificados', roles: [clienteRole.id, instrutorRole.id, diretorRole.id, studentRole.id] },
      { id: 'cmcxv2jv40012vbxltilwycrg', name: 'VIEW_CLASSES', description: 'Visualizar Todas as Aulas', roles: [clienteRole.id, instrutorRole.id, diretorRole.id, studentRole.id] },
      { id: 'cmcxv2jv2000uvbxl3g13dwg9', name: 'VIEW_DASHBOARD', description: 'Visualizar Dashboard', roles: [financialRole.id, clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv2000wvbxlhededrpo', name: 'VIEW_FINANCIAL', description: 'Visualizar Dados Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jtw0002vbxlag8jp2y8', name: 'VIEW_FINANCIAL_REPORTS', description: 'Visualizar Relatórios Financeiros', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jux000kvbxlw5txdweb', name: 'VIEW_OWN_CERTIFICATES', description: 'Visualizar Apenas Certificados de Treinamentos Ministrados por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv70019vbxl5fl0nqmu', name: 'VIEW_OWN_CLASSES', description: 'Visualizar Apenas Aulas Ministradas por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2juz000mvbxlx2854l3z', name: 'VIEW_OWN_TRAININGS', description: 'Visualizar Apenas Treinamentos Ministrados por Ele', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jux000jvbxldbtlpdd7', name: 'VIEW_PROFILE', description: 'Visualizar Perfil', roles: [financialRole.id, studentRole.id, diretorRole.id] },
      { id: 'cmcxv2jv1000nvbxlg85qp6e3', name: 'VIEW_REPORTS', description: 'Visualizar Relatórios', roles: [financialRole.id, diretorRole.id] },
      { id: 'cmcxv2jug0005vbxlzc2rur9t', name: 'VIEW_ROLES', description: 'Visualizar Funções', roles: [instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jv40010vbxloczasxrm', name: 'VIEW_STUDENTS', description: 'Visualizar Alunos', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jux000ivbxl3iey6axr', name: 'VIEW_TRAININGS', description: 'Visualizar Todos os Treinamentos', roles: [studentRole.id, clienteRole.id, instrutorRole.id, diretorRole.id] },
      { id: 'cmcxv2jvb001cvbxlu1tvz4pr', name: 'VIEW_USERS', description: 'Visualizar Usuários', roles: [clienteRole.id, instrutorRole.id, diretorRole.id] },
    ];

    // Criar permissões
    const permissions: Array<{
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = [];
    for (const permData of permissionsData) {
      const permission = await prisma.permission.create({
        data: {
          id: permData.id,
          name: permData.name,
          description: permData.description,
        },
      });
      permissions.push(permission);
    }
    console.log(`✅ ${permissions.length} permissões criadas`);

    console.log('🔗 Associando permissões às roles...');
    // Associar permissões às roles
    for (let i = 0; i < permissionsData.length; i++) {
      const permData = permissionsData[i];
      const permission = permissions[i];
      
      // Associar permissão ao SUPERADMIN (todas as permissões)
      await prisma.rolePermission.create({
        data: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      });
      
      // Associar permissão aos roles específicos
      for (const roleId of permData.roles) {
        await prisma.rolePermission.create({
          data: {
            roleId: roleId,
            permissionId: permission.id,
          },
        });
      }
    }
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
    const superadmin = await prisma.user.create({
      data: {
        name: 'Super Administrador',
        email: 'superadmin@sistema.com',
        password: hashedPassword,
        roleId: superadminRole.id,
      },
    });

    const diretor = await prisma.user.create({
      data: {
        name: 'Diretor Admin',
        email: 'diretor@sistema.com',
        password: hashedPassword,
        roleId: diretorRole.id,
      },
    });

    const instructor = await prisma.user.create({
      data: {
        name: 'Maria Instrutora',
        email: 'maria@sistema.com',
        password: hashedPassword,
        roleId: instrutorRole.id,
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

    const clienteUser = await prisma.user.create({
      data: {
        name: 'Carlos Cliente',
        email: 'carlos@sistema.com',
        password: hashedPassword,
        roleId: clienteRole.id,
        bio: 'Representante da empresa cliente.',
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
    console.log(`   - 6 roles`);
    console.log(`   - ${skills.length} skills`);
    console.log(`   - 1 cliente`);
    console.log(`   - 5 usuários + 1 estudante`);
    console.log('');
    console.log('👤 Usuários criados:');
    console.log(`   - Superadmin: ${superadmin.email} | Senha: ${defaultPassword}`);
    console.log(`   - Diretor: ${diretor.email} | Senha: ${defaultPassword}`);
    console.log(`   - Instructor: ${instructor.email} | Senha: ${defaultPassword}`);
    console.log(`   - Financial: ${financial.email} | Senha: ${defaultPassword}`);
    console.log(`   - Cliente: ${clienteUser.email} | Senha: ${defaultPassword}`);
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
