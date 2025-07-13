import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exemplo de como verificar permissões de um usuário
async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) return false;

  return user.role.permissions.some(
    rolePermission => rolePermission.permission.name === permissionName
  );
}

// Exemplo de como buscar usuários por role
async function getUsersByRole(roleName: string) {
  return await prisma.user.findMany({
    where: {
      role: {
        name: roleName,
      },
    },
    include: {
      role: true,
      skills: true,
    },
  });
}

// Exemplo de como buscar instrutores com suas habilidades
async function getInstructorsWithSkills() {
  return await prisma.user.findMany({
    where: {
      role: {
        name: 'INSTRUCTOR',
      },
    },
    include: {
      role: true,
      skills: true,
      instructor: {
        include: {
          classes: {
            include: {
              training: true,
              students: true,
            },
          },
        },
      },
    },
  });
}

// Exemplo de como buscar estudantes de um cliente específico
async function getStudentsByClient(clientId: string) {
  return await prisma.student.findMany({
    where: {
      clientId: clientId,
    },
    include: {
      client: true,
      classes: {
        include: {
          training: true,
          instructor: true,
        },
      },
      certificates: true,
    },
  });
}

// Exemplo de como criar um usuário instrutor com role e permissões
async function createInstructorUser(userData: {
  name: string;
  email: string;
  password: string;
  bio?: string;
  skillIds?: string[];
}) {
  const role = await prisma.role.findUnique({
    where: { name: 'INSTRUCTOR' },
  });

  if (!role) {
    throw new Error('Role INSTRUCTOR não encontrada');
  }

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      roleId: role.id,
      bio: userData.bio,
      skills: userData.skillIds ? {
        connect: userData.skillIds.map(id => ({ id }))
      } : undefined,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      skills: true,
    },
  });

  return user;
}

// Exemplo de middleware para verificar permissões
export function requirePermission(permissionName: string) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.id; // Assumindo que o usuário está no request
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const permitted = await hasPermission(userId, permissionName);
    
    if (!permitted) {
      return res.status(403).json({ error: 'Permissão negada' });
    }

    next();
  };
}

// Exemplo de como buscar todas as permissões de um usuário
async function getUserPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  return user.role.permissions.map(rp => rp.permission);
}

export {
  hasPermission,
  getUsersByRole,
  getInstructorsWithSkills,
  getStudentsByClient,
  createInstructorUser,
  getUserPermissions,
};
