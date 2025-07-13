# API SuperAdmin - Gerenciamento de Usuários

## Visão Geral
API para gerenciamento completo de usuários do sistema de treinamentos. Inclui funcionalidades de CRUD com autenticação JWT e controle de permissões.

## Autenticação
Todos os endpoints requerem autenticação via JWT Bearer token.

## Endpoints de Autenticação

### Login
**POST** `/auth/signin`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@sistema.com",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "user": {
    "name": "Super Admin",
    "email": "admin@sistema.com",
    "id": "cmctq6xgh0016vbhzspork629",
    "roleId": "cmctq6xdl0008vbhztjqsxs2p"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Consultar Minhas Permissões
**GET** `/auth/permissions`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "user": {
    "id": "cmcxijm0i006fvbvt8n2mwkza",
    "name": "Maria Instrutora",
    "email": "maria@sistema.com",
    "role": {
      "id": "cmcxijlvx001dvbvttff31rwt",
      "name": "INSTRUCTOR",
      "description": "Instrutor que pode ministrar aulas"
    }
  },
  "permissions": [
    {
      "id": "cmcxijlux0007vbvtkpecdsb4",
      "name": "EDIT_OWN_TRAININGS",
      "description": "Editar Apenas Treinamentos Ministrados por Ele"
    },
    {
      "id": "cmcxijlv8000uvbvtgfwfcgcf",
      "name": "EDIT_PROFILE",
      "description": "Editar Perfil"
    },
    {
      "id": "cmcxijlv7000rvbvtwtxgb6lb",
      "name": "VIEW_OWN_CERTIFICATES",
      "description": "Visualizar Apenas Certificados de Treinamentos Ministrados por Ele"
    }
  ]
}
```

## Endpoints

### 1. Listar Usuários
**GET** `/superadmin/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Resposta:**
```json
{
  "users": [
    {
      "id": "cmctq6xgl0018vbhzadvhkczx",
      "name": "Maria Instrutora",
      "email": "maria@sistema.com",
      "roleId": "cmctq6xdo0009vbhzk91kd935",
      "bio": "Instrutora especializada em desenvolvimento web",
      "isActive": true,
      "personType": "FISICA",
      "createdAt": "2025-07-07T23:21:50.566Z",
      "updatedAt": "2025-07-07T23:21:50.566Z",
      "role": {
        "id": "cmctq6xdo0009vbhzk91kd935",
        "name": "INSTRUCTOR",
        "description": "Instrutor que pode ministrar aulas"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

### 2. Criar Usuário
**POST** `/superadmin/users`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Instrutor",
  "email": "joao@sistema.com",
  "password": "123456",
  "roleId": "cmctq6xdo0009vbhzk91kd935",
  "personType": "FISICA",
  "bio": "Instrutor de segurança do trabalho",
  "cpf": "123.456.789-00",
  "city": "São Paulo",
  "state": "SP"
}
```

**Resposta:**
```json
{
  "id": "cmctqkjt00001vbcniw3eksa5",
  "name": "João Instrutor",
  "email": "joao@sistema.com",
  "roleId": "cmctq6xdo0009vbhzk91kd935",
  "bio": "Instrutor de segurança do trabalho",
  "isActive": true,
  "personType": "FISICA",
  "cpf": null,
  "city": null,
  "state": null,
  "createdAt": "2025-07-07T23:32:26.050Z",
  "updatedAt": "2025-07-07T23:32:26.050Z",
  "role": {
    "id": "cmctq6xdo0009vbhzk91kd935",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  }
}
```

### 3. Atualizar Usuário
**PUT** `/superadmin/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva Instrutor",
  "cpf": "123.456.789-00",
  "city": "São Paulo",
  "state": "SP"
}
```

**Resposta:**
```json
{
  "id": "cmctqkjt00001vbcniw3eksa5",
  "name": "João Silva Instrutor",
  "email": "joao@sistema.com",
  "cpf": "123.456.789-00",
  "city": "São Paulo",
  "state": "SP",
  "updatedAt": "2025-07-07T23:32:37.556Z"
}
```

### 4. Excluir Usuário
**DELETE** `/superadmin/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Usuário excluído com sucesso"
}
```

### 5. Listar Roles
**GET** `/superadmin/roles`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "cmctq6xdo0009vbhzk91kd935",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  },
  {
    "id": "cmctq6xdq000avbhzh3z4g9zd",
    "name": "STUDENT", 
    "description": "Estudante que pode se inscrever em aulas"
  },
  {
    "id": "cmctq6xdl0008vbhztjqsxs2p",
    "name": "SUPER_ADMIN",
    "description": "Administrador com acesso total"
  }
]
```

### 6. Criar Role
**POST** `/superadmin/roles`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "MODERATOR",
  "description": "Moderador com permissões limitadas",
  "permissionIds": [
    "cmctq6xdd0004vbhzj8xz0tny",
    "cmctq6xdb0003vbhzdzt06h76"
  ]
}
```

**Resposta:**
```json
{
  "id": "cmcwciu790000vb0b3iuykiii",
  "name": "MODERATOR",
  "description": "Moderador com permissões limitadas",
  "permissions": [
    {
      "id": "cmctq6xdb0003vbhzdzt06h76",
      "name": "EDIT_TRAINING",
      "description": "Pode editar treinamentos"
    },
    {
      "id": "cmctq6xdd0004vbhzj8xz0tny",
      "name": "CREATE_TRAINING",
      "description": "Pode criar treinamentos"
    }
  ],
  "createdAt": "2025-07-09T19:22:30.117Z",
  "updatedAt": "2025-07-09T19:22:30.117Z"
}
```

### 7. Buscar Role por ID
**GET** `/superadmin/roles/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "cmcwciu790000vb0b3iuykiii",
  "name": "MODERATOR",
  "description": "Moderador com permissões limitadas",
  "permissions": [
    {
      "id": "cmctq6xdb0003vbhzdzt06h76",
      "name": "EDIT_TRAINING",
      "description": "Pode editar treinamentos"
    },
    {
      "id": "cmctq6xdd0004vbhzj8xz0tny",
      "name": "CREATE_TRAINING",
      "description": "Pode criar treinamentos"
    }
  ],
  "users": [
    {
      "id": "cmctq6xgh0016vbhzspork629",
      "name": "João Silva",
      "email": "joao@exemplo.com"
    }
  ],
  "createdAt": "2025-07-09T19:22:30.117Z",
  "updatedAt": "2025-07-09T19:22:30.117Z"
}
```

### 8. Atualizar Role
**PUT** `/superadmin/roles/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "MODERATOR_UPDATED",
  "description": "Moderador com permissões atualizadas",
  "permissionIds": [
    "cmctq6xdd0004vbhzj8xz0tny",
    "cmctq6xdb0003vbhzdzt06h76",
    "cmctq6xdf0006vbhzm5q24f72"
  ]
}
```

**Observações:**
- Todos os campos são opcionais
- Se `permissionIds` não for fornecido, as permissões atuais são mantidas
- Se `permissionIds` for fornecido (mesmo vazio), todas as permissões serão substituídas

**Resposta:**
```json
{
  "id": "cmcwciu790000vb0b3iuykiii",
  "name": "MODERATOR_UPDATED",
  "description": "Moderador com permissões atualizadas",
  "permissions": [
    {
      "id": "cmctq6xdb0003vbhzdzt06h76",
      "name": "EDIT_TRAINING",
      "description": "Pode editar treinamentos"
    },
    {
      "id": "cmctq6xdd0004vbhzj8xz0tny",
      "name": "CREATE_TRAINING",
      "description": "Pode criar treinamentos"
    },
    {
      "id": "cmctq6xdf0006vbhzm5q24f72",
      "name": "DELETE_TRAINING",
      "description": "Pode deletar treinamentos"
    }
  ],
  "users": [
    {
      "id": "cmctq6xgh0016vbhzspork629",
      "name": "João Silva",
      "email": "joao@exemplo.com"
    }
  ],
  "createdAt": "2025-07-09T19:22:30.117Z",
  "updatedAt": "2025-07-10T15:30:45.234Z"
}
```

### 8.1. Atualizar Role Parcialmente (PATCH)
**PATCH** `/superadmin/roles/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Nova descrição do role"
}
```

**Observações:**
- Todos os campos são opcionais
- **Diferença do PUT**: Se `permissionIds` não for fornecido, as permissões atuais são **preservadas**
- Se `permissionIds` for fornecido (mesmo vazio), todas as permissões serão substituídas
- Ideal para atualizações que não afetam as permissões

**Resposta:**
```json
{
  "id": "cmcwciu790000vb0b3iuykiii",
  "name": "MODERATOR",
  "description": "Nova descrição do role",
  "permissions": [
    {
      "id": "cmctq6xdb0003vbhzdzt06h76",
      "name": "EDIT_TRAINING",
      "description": "Pode editar treinamentos"
    },
    {
      "id": "cmctq6xdd0004vbhzj8xz0tny",
      "name": "CREATE_TRAINING",
      "description": "Pode criar treinamentos"
    }
  ],
  "users": [
    {
      "id": "cmctq6xgh0016vbhzspork629",
      "name": "João Silva",
      "email": "joao@exemplo.com"
    }
  ],
  "createdAt": "2025-07-09T19:22:30.117Z",
  "updatedAt": "2025-07-10T15:30:45.234Z"
}
```

### 9. Deletar Role
**DELETE** `/superadmin/roles/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Role excluído com sucesso"
}
```

**Observações:**
- Não é possível deletar um role que possui usuários associados
- Erro 400 será retornado se houver usuários usando o role

### 10. Listar Permissões
**GET** `/superadmin/permissions`

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "cmctq6xdd0004vbhzj8xz0tny",
    "name": "CREATE_TRAINING",
    "description": "Pode criar treinamentos"
  },
  {
    "id": "cmctq6xdf0006vbhzm5q24f72",
    "name": "DELETE_TRAINING",
    "description": "Pode deletar treinamentos"
  },
  {
    "id": "cmctq6xdb0003vbhzdzt06h76",
    "name": "EDIT_TRAINING",
    "description": "Pode editar treinamentos"
  },
  {
    "id": "cmctq6xdi0007vbhz2w7xk9ws",
    "name": "ENROLL_CLASS",
    "description": "Pode se inscrever em aulas"
  },
  {
    "id": "cmctq6xde0005vbhz48fps267",
    "name": "MANAGE_FINANCIAL",
    "description": "Pode gerenciar dados financeiros"
  },
  {
    "id": "cmctq6xd70002vbhzp82hx1qv",
    "name": "MANAGE_USERS",
    "description": "Pode gerenciar usuários"
  },
  {
    "id": "cmctq6xd30001vbhzosewai8f",
    "name": "TEACH_CLASS",
    "description": "Pode ministrar aulas"
  },
  {
    "id": "cmctq6xce0000vbhz096sbc2t",
    "name": "VIEW_FINANCIAL",
    "description": "Pode visualizar dados financeiros"
  }
]
```

## Campos Disponíveis

### Campos Obrigatórios (Criação de Usuário)
- `name`: Nome do usuário
- `email`: Email único no sistema  
- `password`: Senha (mínimo 6 caracteres)
- `roleId`: ID da role do usuário

### Campos Obrigatórios (Criação de Role)
- `name`: Nome único do role
- `description`: Descrição do role

### Campos Opcionais (Role)
- `permissionIds`: Array de IDs das permissões a serem associadas ao role

### Campos Opcionais (Usuário)
- `isActive`: Status do usuário (padrão: true)
- `corporateName`: Razão social (para pessoa jurídica)
- `personType`: Tipo de pessoa (FISICA/JURIDICA)
- `cpf`: CPF (para pessoa física)
- `cnpj`: CNPJ (para pessoa jurídica)
- `municipalRegistration`: Inscrição municipal
- `stateRegistration`: Inscrição estadual
- `zipCode`: CEP
- `address`: Endereço
- `addressNumber`: Número do endereço
- `neighborhood`: Bairro
- `city`: Cidade
- `state`: Estado
- `landlineAreaCode`: DDD do telefone fixo
- `landlineNumber`: Número do telefone fixo
- `mobileAreaCode`: DDD do celular
- `mobileNumber`: Número do celular
- `education`: Formação acadêmica
- `registrationNumber`: Número de registro profissional
- `observations`: Observações
- `bio`: Biografia/descrição

## Permissões
- **MANAGE_USERS**: Necessária para todos os endpoints de gerenciamento de usuários

## Códigos de Status
- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Usuário não encontrado
- **409**: Conflito (email já existe)

## Observações Técnicas
- As senhas são automaticamente hasheadas usando bcrypt
- Campos sensíveis como senhas não são retornados nas respostas
- Validações incluem email único e verificação de relacionamentos
- Sistema suporta paginação em listagens
- Logs de debug foram removidos do sistema de permissões

## Testes Realizados ✅

### ✅ Login - Funcionando
```bash
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sistema.com", "password": "123456"}'
```

### ✅ Consultar Minhas Permissões - Funcionando
```bash
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer {token}"
```

### ✅ Listagem - Funcionando
```bash
curl -X GET http://localhost:4000/superadmin/users \
  -H "Authorization: Bearer {token}"
```

### ✅ Criação - Funcionando
```bash
curl -X POST http://localhost:4000/superadmin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "João Instrutor",
    "email": "joao@sistema.com", 
    "password": "123456",
    "roleId": "cmctq6xdo0009vbhzk91kd935",
    "personType": "FISICA",
    "bio": "Instrutor de segurança do trabalho"
  }'
```

### ✅ Atualização - Funcionando
```bash
curl -X PUT http://localhost:4000/superadmin/users/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "João Silva Instrutor",
    "cpf": "123.456.789-00",
    "city": "São Paulo",
    "state": "SP"
  }'
```

### ✅ Exclusão - Funcionando
```bash
curl -X DELETE http://localhost:4000/superadmin/users/{id} \
  -H "Authorization: Bearer {token}"
```

### ✅ Listar Roles - Funcionando
```bash
curl -X GET http://localhost:4000/superadmin/roles \
  -H "Authorization: Bearer {token}"
```

### ✅ Criar Role - Funcionando
```bash
curl -X POST http://localhost:4000/superadmin/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "MODERATOR",
    "description": "Moderador com permissões limitadas",
    "permissionIds": [
      "cmctq6xdd0004vbhzj8xz0tny",
      "cmctq6xdb0003vbhzdzt06h76"
    ]
  }'
```

### ✅ Buscar Role por ID - Funcionando
```bash
curl -X GET http://localhost:4000/superadmin/roles/{id} \
  -H "Authorization: Bearer {token}"
```

### ✅ Atualizar Role - Funcionando
```bash
curl -X PUT http://localhost:4000/superadmin/roles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "MODERATOR_UPDATED",
    "description": "Moderador com permissões atualizadas",
    "permissionIds": [
      "cmctq6xdd0004vbhzj8xz0tny",
      "cmctq6xdb0003vbhzdzt06h76",
      "cmctq6xdf0006vbhzm5q24f72"
    ]
  }'
```

### ✅ Atualizar Role Parcialmente (PATCH) - Funcionando
```bash
curl -X PATCH http://localhost:4000/superadmin/roles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "description": "Nova descrição do role"
  }'
```

### ✅ Deletar Role - Funcionando
```bash
curl -X DELETE http://localhost:4000/superadmin/roles/{id} \
  -H "Authorization: Bearer {token}"
```

### ✅ Listar Permissões - Funcionando
```bash
curl -X GET http://localhost:4000/superadmin/permissions \
  -H "Authorization: Bearer {token}"
```

## Correções Implementadas
1. **Problema UUID Resolvido**: Removida validação restritiva `@IsUUID()` em favor de `@IsString()`
2. **Logs Removidos**: Logs de debug do PermissionsGuard foram limpos
3. **Sistema de Permissões**: Funcionando corretamente com permissão `MANAGE_USERS`
4. **CRUD Completo**: Todos os endpoints testados e funcionando
