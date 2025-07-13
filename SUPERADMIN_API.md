# API de Superadmin - Gerenciamento de Usuários

## Visão Geral
O módulo de superadmin fornece endpoints para gerenciar usuários do sistema, incluindo criação, edição, exclusão e listagem de usuários (instrutores, administradores, etc.).

## Autenticação
Todas as rotas requerem autenticação via JWT e a permissão `MANAGE_USERS`.

**Header obrigatório:**
```
Authorization: Bearer <token>
```

## Endpoints Disponíveis

### 1. Listar Usuários
**GET** `/superadmin/users`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Quantidade por página (padrão: 10)
- `search` (opcional): Busca por nome, email, CPF ou CNPJ

**Exemplo de Request:**
```
GET /superadmin/users?page=1&limit=5&search=maria
```

**Resposta:**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "Maria Instrutora",
      "email": "maria@sistema.com",
      "isActive": true,
      "role": {
        "id": "role_id",
        "name": "INSTRUCTOR",
        "description": "Instrutor que pode ministrar aulas"
      },
      "cpf": "123.456.789-00",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "totalPages": 2
  }
}
```

### 2. Buscar Usuário por ID
**GET** `/superadmin/users/:id`

**Resposta:**
```json
{
  "id": "user_id",
  "name": "Maria Instrutora",
  "email": "maria@sistema.com",
  "isActive": true,
  "role": {
    "id": "role_id",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  },
  "skills": [
    {
      "id": "skill_id",
      "name": "JavaScript"
    }
  ],
  "trainings": [
    {
      "id": "training_id",
      "title": "React Básico",
      "description": "Curso introdutório de React"
    }
  ]
}
```

### 3. Criar Usuário
**POST** `/superadmin/users`

**Body:**
```json
{
  "name": "João Instrutor",
  "email": "joao@sistema.com",
  "password": "senha123",
  "roleId": "role_id_instructor",
  "isActive": true,
  "personType": "FISICA",
  "cpf": "987.654.321-00",
  "zipCode": "01234-567",
  "address": "Rua das Flores, 123",
  "addressNumber": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "landlineAreaCode": "11",
  "landlineNumber": "1234-5678",
  "mobileAreaCode": "11",
  "mobileNumber": "99999-9999",
  "education": "Superior Completo",
  "registrationNumber": "12345",
  "observations": "Instrutor especializado em JavaScript"
}
```

**Resposta:** 201 Created
```json
{
  "id": "new_user_id",
  "name": "João Instrutor",
  "email": "joao@sistema.com",
  "isActive": true,
  "role": {
    "id": "role_id",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### 4. Atualizar Usuário
**PUT** `/superadmin/users/:id`

**Body:** (todos os campos são opcionais)
```json
{
  "name": "João Silva Instrutor",
  "email": "joao.silva@sistema.com",
  "isActive": false,
  "observations": "Observações atualizadas"
}
```

**Resposta:**
```json
{
  "id": "user_id",
  "name": "João Silva Instrutor",
  "email": "joao.silva@sistema.com",
  "isActive": false,
  "role": {
    "id": "role_id",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  },
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### 5. Excluir Usuário
**DELETE** `/superadmin/users/:id`

**Resposta:** 200 OK
```json
{
  "message": "Usuário excluído com sucesso"
}
```

**Erros possíveis:**
- 400: Usuário possui turmas associadas
- 400: Usuário possui sessões ativas
- 404: Usuário não encontrado

### 6. Alternar Status do Usuário
**PATCH** `/superadmin/users/:id/toggle-status`

Alterna entre ativo/inativo.

**Resposta:**
```json
{
  "id": "user_id",
  "name": "João Instrutor",
  "email": "joao@sistema.com",
  "isActive": false,
  "role": {
    "id": "role_id",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  }
}
```

### 7. Listar Roles Disponíveis
**GET** `/superadmin/roles`

**Resposta:**
```json
[
  {
    "id": "role_id_1",
    "name": "SUPER_ADMIN",
    "description": "Administrador com acesso total"
  },
  {
    "id": "role_id_2",
    "name": "INSTRUCTOR",
    "description": "Instrutor que pode ministrar aulas"
  },
  {
    "id": "role_id_3",
    "name": "STUDENT",
    "description": "Estudante que pode se inscrever em aulas"
  }
]
```

## Validações

### Campos Obrigatórios (Criação):
- `email`: Email válido
- `password`: Mínimo 6 caracteres
- `roleId`: UUID válido de role existente

### Validações Automáticas:
- Email único no sistema
- CPF único (se fornecido)
- CNPJ único (se fornecido)
- Role deve existir

## Códigos de Erro

- **400 Bad Request**: Dados inválidos ou violação de regras de negócio
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário sem permissão `MANAGE_USERS`
- **404 Not Found**: Usuário não encontrado
- **500 Internal Server Error**: Erro interno do servidor

## Exemplos de Uso

### Login como Super Admin
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "password": "123456"
  }'
```

### Listar Usuários
```bash
curl -X GET http://localhost:3000/superadmin/users \
  -H "Authorization: Bearer <token>"
```

### Criar Instrutor
```bash
curl -X POST http://localhost:3000/superadmin/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Instrutora",
    "email": "ana@sistema.com",
    "password": "senha123",
    "roleId": "instructor_role_id",
    "cpf": "111.222.333-44"
  }'
```
