# Sistema de Permissões - Guia de Uso

## 🔐 Endpoint: GET /auth/permissions

### Descrição
Retorna todas as permissões do usuário logado baseado na sua role.

### Autenticação
Requer token JWT no header `Authorization: Bearer {token}`

### Resposta
```json
{
  "user": {
    "id": "user_id",
    "name": "Maria Instrutora",
    "email": "maria@sistema.com",
    "role": {
      "id": "role_id",
      "name": "INSTRUCTOR",
      "description": "Instrutor que pode ministrar aulas"
    }
  },
  "permissions": [
    {
      "id": "permission_id",
      "name": "TEACH_CLASS",
      "description": "Pode ministrar aulas"
    },
    {
      "id": "permission_id",
      "name": "VIEW_FINANCIAL",
      "description": "Pode visualizar dados financeiros"
    }
  ]
}
```

## 🧪 Como Testar

### 1. Fazer Login
```bash
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@sistema.com",
    "password": "123456"
  }'
```

### 2. Obter Permissões
```bash
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔒 Usando Guards de Permissão

### Importar no Module
```typescript
import { PermissionsGuard } from './auth/permissions.guard';

@Module({
  providers: [PermissionsGuard],
  // ...
})
```

### Usar no Controller
```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { RequirePermissions } from './auth/permissions.decorator';

@Controller('training')
@UseGuards(AuthGuard, PermissionsGuard) // AuthGuard DEVE vir primeiro
export class TrainingController {
  
  @Post()
  @RequirePermissions('CREATE_TRAINING')
  async createTraining(@Body() dto: any) {
    return { message: 'Treinamento criado' };
  }
}
```

## 📋 Permissões Disponíveis

### Super Admin (SUPER_ADMIN)
- ✅ **Todas as permissões**

### Instrutor (INSTRUCTOR)
- ✅ `TEACH_CLASS` - Pode ministrar aulas
- ✅ `VIEW_FINANCIAL` - Pode visualizar dados financeiros

### Estudante (STUDENT)
- ✅ `ENROLL_CLASS` - Pode se inscrever em aulas

### Todas as Permissões
- `CREATE_TRAINING` - Pode criar treinamentos
- `EDIT_TRAINING` - Pode editar treinamentos
- `DELETE_TRAINING` - Pode deletar treinamentos
- `TEACH_CLASS` - Pode ministrar aulas
- `ENROLL_CLASS` - Pode se inscrever em aulas
- `MANAGE_USERS` - Pode gerenciar usuários
- `VIEW_FINANCIAL` - Pode visualizar dados financeiros
- `MANAGE_FINANCIAL` - Pode gerenciar dados financeiros

## 🎯 Usuários de Teste

### Super Admin
- **Email:** `admin@sistema.com`
- **Senha:** `123456`
- **Permissões:** Todas

### Instrutor
- **Email:** `maria@sistema.com`
- **Senha:** `123456`
- **Permissões:** `TEACH_CLASS`, `VIEW_FINANCIAL`

### Estudante
- **Email:** `pedro@sistema.com`
- **Senha:** `123456`
- **Permissões:** `ENROLL_CLASS`

## 🔧 Implementação no Frontend

### Obter Permissões
```typescript
async function getUserPermissions() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/auth/permissions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
}
```

### Verificar Permissão
```typescript
function hasPermission(permissions: any[], permissionName: string): boolean {
  return permissions.some(permission => permission.name === permissionName);
}
```

### Exemplo de Uso
```typescript
const { permissions } = await getUserPermissions();

// Verificar permissões específicas
const canCreateTraining = hasPermission(permissions, 'CREATE_TRAINING');
const canTeach = hasPermission(permissions, 'TEACH_CLASS');
const canViewFinancial = hasPermission(permissions, 'VIEW_FINANCIAL');

// Mostrar/ocultar elementos baseado nas permissões
if (canCreateTraining) {
  // Mostrar botão "Criar Treinamento"
}

if (canTeach) {
  // Mostrar seção "Minhas Aulas"
}

if (canViewFinancial) {
  // Mostrar dados financeiros
}
```

## 🚨 Tratamento de Erros

### 401 - Não Autenticado
```json
{
  "message": "Token inválido ou expirado",
  "statusCode": 401
}
```

### 403 - Sem Permissão
```json
{
  "message": "Usuário não tem permissão para acessar este recurso",
  "statusCode": 403
}
```

### 404 - Usuário Não Encontrado
```json
{
  "message": "Usuário não encontrado",
  "statusCode": 404
}
```
