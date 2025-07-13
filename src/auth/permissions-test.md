// Teste das permissões de usuário

/**
 * Endpoint: GET /auth/permissions
 * Descrição: Retorna todas as permissões do usuário logado
 * 
 * Como testar:
 * 1. Faça login primeiro para obter o token:
 *    POST /auth/signin
 *    Body: { "email": "maria@sistema.com", "password": "123456" }
 * 
 * 2. Use o token retornado no header Authorization:
 *    GET /auth/permissions
 *    Headers: { "Authorization": "Bearer SEU_TOKEN_AQUI" }
 * 
 * Resposta esperada:
 * {
 *   "user": {
 *     "id": "user_id",
 *     "name": "Maria Instrutora",
 *     "email": "maria@sistema.com",
 *     "role": {
 *       "id": "role_id",
 *       "name": "INSTRUCTOR",
 *       "description": "Instrutor que pode ministrar aulas"
 *     }
 *   },
 *   "permissions": [
 *     {
 *       "id": "permission_id",
 *       "name": "TEACH_CLASS",
 *       "description": "Pode ministrar aulas"
 *     },
 *     {
 *       "id": "permission_id",
 *       "name": "VIEW_FINANCIAL",
 *       "description": "Pode visualizar dados financeiros"
 *     }
 *   ]
 * }
 */

// Exemplo de uso no frontend:
export async function getUserPermissions() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/auth/permissions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Erro ao obter permissões');
  }
  
  return await response.json();
}

// Exemplo de verificação de permissão específica:
export function hasPermission(userPermissions: any[], permissionName: string): boolean {
  return userPermissions.some(permission => permission.name === permissionName);
}

// Exemplo de uso em um componente:
/*
const { permissions } = await getUserPermissions();
const canTeach = hasPermission(permissions, 'TEACH_CLASS');
const canViewFinancial = hasPermission(permissions, 'VIEW_FINANCIAL');

if (canTeach) {
  // Mostrar botão de criar aula
}

if (canViewFinancial) {
  // Mostrar dados financeiros
}
*/
