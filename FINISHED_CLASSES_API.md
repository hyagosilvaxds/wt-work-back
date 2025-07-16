# API de Classes Finalizadas

Este documento descreve os novos endpoints criados para buscar classes que foram finalizadas (status: "CONCLUIDO").

## Endpoints Criados

### 1. Buscar todas as classes finalizadas
**GET** `/superadmin/classes/finished`

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 10)
- `search` (opcional): Termo de busca para filtrar resultados

**Descrição:** Retorna todas as classes com status "CONCLUIDO" do sistema, incluindo dados completos dos alunos matriculados.

**Resposta:**
```json
{
  "classes": [
    {
      "id": "string",
      "status": "CONCLUIDO",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-15T00:00:00.000Z",
      "location": "string",
      "observations": "string",
      "training": {
        "id": "string",
        "title": "string",
        "description": "string",
        "durationHours": 40,
        "validityDays": 365
      },
      "instructor": {
        "id": "string",
        "name": "string",
        "email": "string",
        "corporateName": "string"
      },
      "client": {
        "id": "string",
        "name": "string",
        "email": "string",
        "cpf": "string",
        "cnpj": "string"
      },
      "students": [
        {
          "id": "string",
          "name": "string",
          "email": "string",
          "cpf": "string",
          "birthDate": "1990-01-01T00:00:00.000Z",
          "mobileAreaCode": "11",
          "mobileNumber": "999999999",
          "landlineAreaCode": "11",
          "landlineNumber": "33333333",
          "address": "string",
          "city": "string",
          "state": "string",
          "zipCode": "string",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ],
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "startDate": "2025-01-01T00:00:00.000Z",
          "endDate": "2025-01-01T00:00:00.000Z",
          "status": "string"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 2. Buscar classes finalizadas por ID do cliente
**GET** `/superadmin/classes/finished/client/:clientId`

**Parâmetros de URL:**
- `clientId` (obrigatório): ID do cliente

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 10)
- `search` (opcional): Termo de busca para filtrar resultados

**Descrição:** Retorna todas as classes finalizadas de um cliente específico, incluindo dados completos dos alunos matriculados.

**Resposta:** Mesmo formato do endpoint anterior, mas filtrado por cliente.

### 3. Buscar classes finalizadas por ID do instrutor
**GET** `/superadmin/classes/finished/instructor/:instructorId`

**Parâmetros de URL:**
- `instructorId` (obrigatório): ID do instrutor

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 10)
- `search` (opcional): Termo de busca para filtrar resultados

**Descrição:** Retorna todas as classes finalizadas de um instrutor específico, incluindo dados completos dos alunos matriculados.

**Resposta:** Mesmo formato do endpoint anterior, mas filtrado por instrutor.

## Permissões Necessárias

Todos os endpoints requerem a permissão `VIEW_USERS` para serem acessados.

## Funcionalidades de Busca

Os endpoints suportam busca por:
- Tipo da classe
- Localização
- Observações
- Título do treinamento
- Descrição do treinamento
- Nome do instrutor
- Email do instrutor
- Nome corporativo do instrutor
- Nome do cliente
- Email do cliente
- CPF/CNPJ do cliente

## Ordenação

Os resultados são ordenados por `endDate` em ordem decrescente (classes finalizadas mais recentemente primeiro).

## Validações

- Para os endpoints por cliente/instrutor, o sistema verifica se o cliente/instrutor existe antes de buscar as classes
- Retorna erro 404 se o cliente/instrutor não for encontrado
- Paginação padrão de 10 itens por página se não especificado
- Todos os campos de telefone são retornados separadamente (mobileAreaCode, mobileNumber, landlineAreaCode, landlineNumber)

## Exemplos de Uso

### Buscar todas as classes finalizadas
```bash
GET /superadmin/classes/finished?page=1&limit=5&search=NR10
```

### Buscar classes finalizadas de um cliente específico
```bash
GET /superadmin/classes/finished/client/cm7abc123def456?page=1&limit=10
```

### Buscar classes finalizadas de um instrutor específico
```bash
GET /superadmin/classes/finished/instructor/cm7xyz789ghi012?search=soldador
```
