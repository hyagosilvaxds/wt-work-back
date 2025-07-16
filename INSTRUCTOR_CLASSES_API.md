# API de Turmas do Instrutor

## Endpoint para Instrutor Buscar Suas Próprias Turmas

### `GET /superadmin/instructor-classes`

Este endpoint permite que um instrutor autenticado busque todas as turmas onde ele é o instrutor responsável.

#### Autenticação e Autorização
- **Autenticação**: Requer JWT token válido
- **Permissão**: `VIEW_CLASSES`
- **Role**: INSTRUTOR

#### Parâmetros de Query (opcionais)

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|---------|
| `page` | number | Número da página | 1 |
| `limit` | number | Itens por página | 10 |
| `search` | string | Termo de busca | - |

#### Campos de Busca

O parâmetro `search` faz busca nos seguintes campos:
- `type` - Tipo da turma
- `status` - Status da turma
- `location` - Local da turma
- `observations` - Observações da turma
- `training.title` - Título do treinamento
- `training.description` - Descrição do treinamento
- `client.name` - Nome do cliente/empresa
- `client.email` - Email do cliente
- `client.cpf` - CPF do cliente
- `client.cnpj` - CNPJ do cliente

#### Exemplo de Requisição

```bash
# Buscar todas as turmas do instrutor (primeira página)
GET /superadmin/instructor-classes

# Buscar turmas com paginação
GET /superadmin/instructor-classes?page=2&limit=5

# Buscar turmas com filtro
GET /superadmin/instructor-classes?search=NR10&page=1&limit=10
```

#### Exemplo de Resposta

```json
{
  "classes": [
    {
      "id": "uuid-turma-1",
      "type": "PRESENCIAL",
      "status": "ATIVO",
      "startDate": "2025-01-15T08:00:00.000Z",
      "endDate": "2025-01-19T17:00:00.000Z",
      "location": "São Paulo - SP",
      "observations": "Turma para funcionários da empresa ABC",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z",
      "training": {
        "id": "uuid-training-1",
        "title": "NR10 - Segurança em Instalações Elétricas",
        "description": "Treinamento sobre normas de segurança",
        "durationHours": 40,
        "isActive": true,
        "validityDays": 730,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      },
      "client": {
        "id": "uuid-client-1",
        "name": "Empresa ABC Ltda",
        "email": "contato@empresaabc.com",
        "cpf": null,
        "cnpj": "12.345.678/0001-90",
        "isActive": true,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      },
      "students": [
        {
          "id": "uuid-student-1",
          "name": "João Silva",
          "email": "joao.silva@empresaabc.com",
          "cpf": "123.456.789-00",
          "birthDate": "1985-03-15T00:00:00.000Z",
          "createdAt": "2025-01-08T10:00:00.000Z",
          "updatedAt": "2025-01-08T10:00:00.000Z"
        }
      ],
      "lessons": [
        {
          "id": "uuid-lesson-1",
          "title": "Aula 1 - Introdução à NR10",
          "description": "Conceitos básicos de segurança",
          "startDate": "2025-01-15T08:00:00.000Z",
          "endDate": "2025-01-15T12:00:00.000Z",
          "status": "AGENDADA",
          "location": "Sala 101",
          "createdAt": "2025-01-10T10:00:00.000Z",
          "updatedAt": "2025-01-10T10:00:00.000Z"
        }
      ]
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

#### Códigos de Status HTTP

- `200 OK` - Sucesso na busca
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Usuário não tem permissão VIEW_CLASSES
- `404 Not Found` - Usuário não possui perfil de instrutor vinculado
- `500 Internal Server Error` - Erro interno do servidor

#### Diferenças com o Endpoint de Cliente

| Aspecto | Cliente (`/my-classes`) | Instrutor (`/instructor-classes`) |
|---------|-------------------------|-----------------------------------|
| Filtro principal | `clientId` | `instructorId` |
| Relacionamento incluído | `instructor` | `client` |
| Busca em relacionamentos | Por instrutor | Por cliente |
| Validação | Empresa vinculada | Perfil de instrutor |

#### Casos de Uso

1. **Dashboard do Instrutor**: Listar turmas ativas
2. **Agenda do Instrutor**: Visualizar próximas turmas
3. **Relatórios**: Histórico de turmas ministradas
4. **Planejamento**: Verificar turmas agendadas
5. **Busca**: Encontrar turmas específicas por cliente ou treinamento

#### Exemplo de Uso no Frontend

```javascript
// Buscar turmas do instrutor
const fetchInstructorClasses = async (page = 1, search = '') => {
  try {
    const response = await fetch(`/api/superadmin/instructor-classes?page=${page}&limit=10&search=${search}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar turmas');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

// Usar no componente
const classes = await fetchInstructorClasses(1, 'NR10');
```

#### Observações Importantes

1. **Segurança**: O endpoint só retorna turmas do instrutor autenticado
2. **Performance**: Usar paginação para grandes volumes de dados
3. **Busca**: A busca é case-insensitive e aceita busca parcial
4. **Ordenação**: Turmas ordenadas por data de criação (mais recentes primeiro)
5. **Relacionamentos**: Inclui dados completos de treinamento, cliente, estudantes e aulas
