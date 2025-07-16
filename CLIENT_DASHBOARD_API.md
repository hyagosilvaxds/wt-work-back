# CLIENT DASHBOARD API

## Endpoint: GET /superadmin/clients/:id/dashboard

### Descrição
Retorna os dados do dashboard para um cliente específico, incluindo estatísticas e aulas agendadas.

### Parâmetros
- `id` (string): ID do cliente

### Permissões Necessárias
- `VIEW_USERS`

### Resposta de Sucesso (200)

```json
{
  "totalStudents": 25,
  "totalClasses": 8,
  "totalScheduledLessons": 12,
  "totalCompletedClasses": 3,
  "scheduledLessons": [
    {
      "id": "lesson-id-1",
      "title": "Aula de Segurança no Trabalho",
      "description": "Introdução aos equipamentos de proteção individual",
      "startDate": "2025-01-20T08:00:00Z",
      "endDate": "2025-01-20T12:00:00Z",
      "location": "Sala A - Prédio Principal",
      "status": "AGENDADA",
      "instructorName": "João Silva",
      "className": "Curso de Segurança no Trabalho",
      "observations": "Trazer equipamentos de proteção"
    },
    {
      "id": "lesson-id-2",
      "title": "Primeiros Socorros",
      "description": "Técnicas básicas de primeiros socorros",
      "startDate": "2025-01-22T14:00:00Z",
      "endDate": "2025-01-22T18:00:00Z",
      "location": "Laboratório de Práticas",
      "status": "AGENDADA",
      "instructorName": "Maria Santos",
      "className": "Curso de Primeiros Socorros",
      "observations": null
    }
  ]
}
```

### Resposta de Erro (404)

```json
{
  "statusCode": 404,
  "message": "Cliente não encontrado"
}
```

### Dados Retornados

#### Estatísticas
- `totalStudents`: Número total de estudantes vinculados ao cliente
- `totalClasses`: Número total de turmas do cliente
- `totalScheduledLessons`: Número total de aulas agendadas (status = "AGENDADA")
- `totalCompletedClasses`: Número total de turmas concluídas (status = "CONCLUIDO")

#### Aulas Agendadas
- `scheduledLessons`: Array com as próximas aulas agendadas (limitado a 50 itens)
  - `id`: ID da aula
  - `title`: Título da aula
  - `description`: Descrição da aula (opcional)
  - `startDate`: Data e hora de início
  - `endDate`: Data e hora de fim
  - `location`: Local da aula (opcional)
  - `status`: Status da aula
  - `instructorName`: Nome do instrutor
  - `className`: Nome do treinamento/curso
  - `observations`: Observações sobre a aula (opcional)

### Exemplo de Uso

```bash
curl -X GET "https://api.exemplo.com/superadmin/clients/client-id-123/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Notas
- As aulas agendadas são ordenadas por data de início (mais próximas primeiro)
- Apenas aulas com status "AGENDADA" são incluídas na agenda
- O limite de 50 aulas agendadas é aplicado para evitar sobrecarga de dados
- Todas as datas são retornadas no formato ISO 8601 (UTC)
