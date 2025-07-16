# INSTRUCTOR DASHBOARD API

## Endpoint: GET /superadmin/instructors/:id/dashboard

### Descrição
Retorna os dados do dashboard para um instrutor específico, incluindo estatísticas e aulas agendadas.

### Parâmetros
- `id` (string): ID do instrutor

### Permissões Necessárias
- `VIEW_USERS`

### Resposta de Sucesso (200)

```json
{
  "totalStudents": 45,
  "totalClasses": 6,
  "totalScheduledLessons": 18,
  "totalCompletedClasses": 2,
  "scheduledLessons": [
    {
      "id": "lesson-id-1",
      "title": "Aula de Segurança no Trabalho",
      "description": "Introdução aos equipamentos de proteção individual",
      "startDate": "2025-01-20T08:00:00Z",
      "endDate": "2025-01-20T12:00:00Z",
      "location": "Sala A - Prédio Principal",
      "status": "AGENDADA",
      "className": "Curso de Segurança no Trabalho",
      "clientName": "Empresa ABC Ltda",
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
      "className": "Curso de Primeiros Socorros",
      "clientName": "Empresa XYZ S/A",
      "observations": null
    }
  ]
}
```

### Resposta de Erro (404)

```json
{
  "statusCode": 404,
  "message": "Instrutor não encontrado"
}
```

### Dados Retornados

#### Estatísticas
- `totalStudents`: Número total de estudantes nas turmas do instrutor
- `totalClasses`: Número total de turmas ministradas pelo instrutor
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
  - `className`: Nome do treinamento/curso
  - `clientName`: Nome da empresa/cliente (opcional)
  - `observations`: Observações sobre a aula (opcional)

### Exemplo de Uso

```bash
curl -X GET "https://api.exemplo.com/superadmin/instructors/instructor-id-123/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Notas
- As aulas agendadas são ordenadas por data de início (mais próximas primeiro)
- Apenas aulas com status "AGENDADA" são incluídas na agenda
- O limite de 50 aulas agendadas é aplicado para evitar sobrecarga de dados
- O contador de estudantes considera apenas estudantes das turmas do instrutor
- Todas as datas são retornadas no formato ISO 8601 (UTC)

### Comparação com Client Dashboard
- **Client Dashboard**: Mostra dados baseados no `clientId` das aulas e turmas
- **Instructor Dashboard**: Mostra dados baseados no `instructorId` das aulas e turmas
- **Estudantes**: Client conta estudantes por `clientId`, Instructor conta estudantes nas turmas do instrutor
- **Aulas**: Client mostra instrutor na agenda, Instructor mostra cliente na agenda
