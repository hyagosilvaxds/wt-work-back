# API de Estudantes - Vinculação com Empresas

## Visão Geral

Os estudantes agora podem ser vinculados a empresas (clientes) através do campo `clientId`. Esta funcionalidade permite que funcionários de uma empresa sejam cadastrados como estudantes nos treinamentos.

## Endpoints Disponíveis

### 1. Criar Estudante

**POST** `/api/superadmin/students`

```json
{
  "name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@empresa.com",
  "clientId": "cliente-uuid-123",
  "rg": "123456789",
  "gender": "MASCULINO",
  "birthDate": "1990-01-15",
  "education": "SUPERIOR",
  "zipCode": "12345-678",
  "address": "Rua das Flores, 123",
  "addressNumber": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "mobileAreaCode": "11",
  "mobileNumber": "987654321",
  "observations": "Funcionário da empresa XYZ",
  "isActive": true
}
```

### 2. Atualizar Estudante (PATCH)

**PATCH** `/api/superadmin/students/:id`

```json
{
  "clientId": "novo-cliente-uuid-456",
  "name": "João Silva Santos",
  "email": "joao.santos@novaempresa.com",
  "observations": "Transferido para nova empresa"
}
```

### 3. Listar Todos os Estudantes

**GET** `/api/superadmin/students?page=1&limit=10&search=joão`

Retorna todos os estudantes com paginação e busca opcional.

### 4. Listar Estudantes de uma Empresa

**GET** `/api/superadmin/clients/:clientId/students?page=1&limit=10&search=maria`

Retorna apenas os estudantes vinculados à empresa específica.

### 5. Buscar Estudante por ID

**GET** `/api/superadmin/students/:id`

Retorna um estudante específico com informações da empresa vinculada.

### 6. Deletar Estudante

**DELETE** `/api/superadmin/students/:id`

## Validações Implementadas

### Criação de Estudante
- ✅ `name`: Obrigatório
- ✅ `cpf`: Obrigatório, mínimo 11 caracteres, deve ser único
- ✅ `email`: Opcional, deve ser único se fornecido
- ✅ `clientId`: Opcional, deve ser UUID válido, empresa deve existir
- ✅ Todos os outros campos são opcionais

### Atualização de Estudante
- ✅ Verifica se estudante existe
- ✅ Verifica unicidade de CPF se alterado
- ✅ Verifica unicidade de email se alterado
- ✅ Verifica se empresa existe se clientId for alterado
- ✅ Remove strings vazias automaticamente

## Exemplos de Uso

### Cenário 1: Cadastrar funcionário de empresa

```bash
# 1. Primeiro, criar ou obter ID da empresa
POST /api/superadmin/clients
{
  "name": "Empresa XYZ Ltda",
  "cnpj": "12345678000190",
  "email": "contato@empresaxyz.com"
}

# 2. Cadastrar funcionário vinculado à empresa
POST /api/superadmin/students
{
  "name": "Maria Santos",
  "cpf": "98765432109",
  "email": "maria@empresaxyz.com",
  "clientId": "empresa-uuid-obtido-acima",
  "isActive": true
}
```

### Cenário 2: Listar todos os funcionários de uma empresa

```bash
GET /api/superadmin/clients/empresa-uuid-123/students?page=1&limit=20
```

### Cenário 3: Transferir funcionário para outra empresa

```bash
PATCH /api/superadmin/students/estudante-uuid-456
{
  "clientId": "nova-empresa-uuid-789",
  "observations": "Transferido para nova unidade"
}
```

### Cenário 4: Remover vínculo com empresa

```bash
PATCH /api/superadmin/students/estudante-uuid-456
{
  "clientId": null
}
```

## Estrutura de Resposta

### Estudante com Empresa

```json
{
  "id": "estudante-uuid-123",
  "name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@empresa.com",
  "clientId": "empresa-uuid-456",
  "isActive": true,
  "enrollmentDate": "2025-01-15T10:00:00Z",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "client": {
    "id": "empresa-uuid-456",
    "name": "Empresa XYZ Ltda",
    "cnpj": "12345678000190",
    "email": "contato@empresaxyz.com"
  },
  "classes": [],
  "certificates": []
}
```

### Lista de Estudantes de Empresa

```json
{
  "students": [
    {
      "id": "estudante-uuid-123",
      "name": "João Silva",
      "cpf": "12345678901",
      "email": "joao@empresa.com",
      "client": {
        "id": "empresa-uuid-456",
        "name": "Empresa XYZ Ltda"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Códigos de Erro

- `400 Bad Request`: Dados inválidos ou empresa não encontrada
- `404 Not Found`: Estudante não encontrado
- `409 Conflict`: CPF ou email já em uso

## Mensagens de Erro Comuns

```json
{
  "statusCode": 400,
  "message": "Empresa (cliente) não encontrada",
  "error": "Bad Request"
}

{
  "statusCode": 400,
  "message": "Email já está em uso para outro estudante",
  "error": "Bad Request"
}

{
  "statusCode": 400,
  "message": "CPF já está em uso para outro estudante",
  "error": "Bad Request"
}
```

## Permissões Necessárias

- `CREATE_USERS`: Para criar estudantes
- `VIEW_USERS`: Para visualizar estudantes
- `EDIT_USERS`: Para atualizar estudantes
- `DELETE_USERS`: Para deletar estudantes
