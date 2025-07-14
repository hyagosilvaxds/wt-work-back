# API para Criar Usuário Instrutor

## Endpoint

**POST** `/superadmin/instructors`

## Descrição

Este endpoint permite criar um usuário com role INSTRUCTOR e todos os dados associados na tabela Instructor.

## Permissões Necessárias

- `CREATE_USERS`

## Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Body da Requisição

```json
{
  // Dados do usuário (obrigatórios)
  "name": "João Silva",
  "email": "joao.silva@empresa.com",
  "password": "senha123",
  
  // Dados do usuário (opcionais)
  "bio": "Instrutor especializado em segurança do trabalho",
  "skillIds": ["skill_id_1", "skill_id_2"],
  "isActive": true,
  
  // Dados do instrutor (opcionais)
  "corporateName": "João Silva LTDA",
  "personType": "JURIDICA", // ou "FISICA"
  "cpf": "123.456.789-00",
  "cnpj": "12.345.678/0001-90",
  "municipalRegistration": "123456",
  "stateRegistration": "789012",
  "zipCode": "12345-678",
  "address": "Rua das Flores, 123",
  "addressNumber": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "landlineAreaCode": "11",
  "landlineNumber": "1234-5678",
  "mobileAreaCode": "11",
  "mobileNumber": "98765-4321",
  "instructorEmail": "joao.instrutor@empresa.com",
  "education": "Ensino Superior Completo",
  "registrationNumber": "REG123456",
  "observations": "Instrutor certificado em diversas áreas"
}
```

## Exemplo de Resposta de Sucesso (201 Created)

```json
{
  "user": {
    "id": "cm1234567890",
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "isActive": true,
    "bio": "Instrutor especializado em segurança do trabalho",
    "role": {
      "id": "role_instructor_id",
      "name": "INSTRUCTOR",
      "description": "Instrutor que pode ministrar aulas"
    },
    "skills": [
      {
        "id": "skill_id_1",
        "name": "JavaScript"
      },
      {
        "id": "skill_id_2",
        "name": "React"
      }
    ],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "instructor": {
    "id": "instructor_id_123",
    "userId": "cm1234567890",
    "isActive": true,
    "name": "João Silva",
    "corporateName": "João Silva LTDA",
    "personType": "JURIDICA",
    "cpf": null,
    "cnpj": "12.345.678/0001-90",
    "municipalRegistration": "123456",
    "stateRegistration": "789012",
    "zipCode": "12345-678",
    "address": "Rua das Flores, 123",
    "addressNumber": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "landlineAreaCode": "11",
    "landlineNumber": "1234-5678",
    "mobileAreaCode": "11",
    "mobileNumber": "98765-4321",
    "email": "joao.instrutor@empresa.com",
    "education": "Ensino Superior Completo",
    "registrationNumber": "REG123456",
    "observations": "Instrutor certificado em diversas áreas",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Exemplos de Erro

### 400 Bad Request - Email já existe
```json
{
  "statusCode": 400,
  "message": "Email já está em uso",
  "error": "Bad Request"
}
```

### 400 Bad Request - CPF já existe
```json
{
  "statusCode": 400,
  "message": "CPF já está em uso",
  "error": "Bad Request"
}
```

### 400 Bad Request - CNPJ obrigatório
```json
{
  "statusCode": 400,
  "message": "CNPJ é obrigatório para pessoa jurídica",
  "error": "Bad Request"
}
```

### 400 Bad Request - Skill não encontrada
```json
{
  "statusCode": 400,
  "message": "Uma ou mais skills não foram encontradas",
  "error": "Bad Request"
}
```

### 401 Unauthorized - Token inválido
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden - Sem permissão
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

## Exemplo de Uso com cURL

```bash
# Fazer login primeiro
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "password": "123456"
  }'

# Criar instrutor
curl -X POST http://localhost:3000/superadmin/instructors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "password": "senha123",
    "bio": "Instrutor especializado em segurança do trabalho",
    "personType": "FISICA",
    "cpf": "123.456.789-00",
    "city": "São Paulo",
    "state": "SP",
    "education": "Ensino Superior Completo"
  }'
```

## Validações Implementadas

1. **Email único**: Verifica se o email do usuário já existe
2. **Role INSTRUCTOR**: Automaticamente associa o usuário ao role INSTRUCTOR
3. **Documentos únicos**: Verifica se CPF/CNPJ já existem
4. **Validação de pessoa jurídica**: CNPJ obrigatório para personType = 'JURIDICA'
5. **Email do instrutor único**: Verifica se o email específico do instrutor já existe
6. **Skills válidas**: Verifica se as skills fornecidas existem
7. **Transação**: Usa transação do Prisma para garantir consistência

## Funcionalidades

- ✅ Criação completa de usuário + instrutor
- ✅ Associação automática com role INSTRUCTOR
- ✅ Validação de documentos únicos
- ✅ Associação com skills (opcional)
- ✅ Suporte a pessoa física e jurídica
- ✅ Validações de negócio robustas
- ✅ Tratamento de erros apropriado
- ✅ Resposta sanitizada (sem senha)
