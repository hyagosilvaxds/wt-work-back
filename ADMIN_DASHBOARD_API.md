# ADMIN DASHBOARD API

## Endpoint: GET /superadmin/dashboard

### Descrição
Retorna os dados do dashboard geral do sistema para administradores, incluindo estatísticas globais, aulas agendadas e atividades recentes.

### Parâmetros
Nenhum parâmetro necessário.

### Permissões Necessárias
- `VIEW_USERS`

### Resposta de Sucesso (200)

```json
{
  "totalStudents": 150,
  "totalClasses": 25,
  "totalScheduledLessons": 45,
  "totalCompletedClasses": 12,
  "totalInstructors": 8,
  "totalClients": 15,
  "totalTrainings": 20,
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
      "clientName": "Empresa ABC Ltda",
      "className": "Curso de Segurança no Trabalho",
      "observations": "Trazer equipamentos de proteção"
    }
  ],
  "recentActivities": [
    {
      "id": "activity-id-1",
      "type": "CLASS_CREATED",
      "description": "Nova turma criada: Curso de Primeiros Socorros para Empresa XYZ S/A",
      "createdAt": "2025-01-15T10:30:00Z",
      "entityId": "class-id-123",
      "entityType": "CLASS"
    },
    {
      "id": "activity-id-2",
      "type": "STUDENT_ENROLLED",
      "description": "Novo estudante matriculado: Maria Santos (Empresa ABC Ltda)",
      "createdAt": "2025-01-15T09:15:00Z",
      "entityId": "student-id-456",
      "entityType": "STUDENT"
    },
    {
      "id": "activity-id-3",
      "type": "LESSON_CREATED",
      "description": "Nova aula agendada: Prevenção de Acidentes com João Silva",
      "createdAt": "2025-01-14T16:45:00Z",
      "entityId": "lesson-id-789",
      "entityType": "LESSON"
    }
  ]
}
```

### Dados Retornados

#### Estatísticas Gerais
- `totalStudents`: Número total de estudantes no sistema
- `totalClasses`: Número total de turmas no sistema
- `totalScheduledLessons`: Número total de aulas agendadas (status = "AGENDADA")
- `totalCompletedClasses`: Número total de turmas concluídas (status = "CONCLUIDO")
- `totalInstructors`: Número total de instrutores no sistema
- `totalClients`: Número total de clientes/empresas no sistema
- `totalTrainings`: Número total de treinamentos disponíveis

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
  - `clientName`: Nome da empresa/cliente (opcional)
  - `className`: Nome do treinamento/curso
  - `observations`: Observações sobre a aula (opcional)

#### Atividades Recentes
- `recentActivities`: Array com as atividades mais recentes (limitado a 20 itens)
  - `id`: ID da atividade
  - `type`: Tipo da atividade
    - `CLASS_CREATED`: Nova turma criada
    - `LESSON_CREATED`: Nova aula agendada
    - `STUDENT_ENROLLED`: Novo estudante matriculado
    - `TRAINING_COMPLETED`: Treinamento concluído
  - `description`: Descrição da atividade
  - `createdAt`: Data e hora da atividade
  - `entityId`: ID da entidade relacionada
  - `entityType`: Tipo da entidade (`CLASS`, `LESSON`, `STUDENT`, `TRAINING`)

### Exemplo de Uso

```bash
curl -X GET "https://api.exemplo.com/superadmin/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Notas
- As aulas agendadas são ordenadas por data de início (mais próximas primeiro)
- Apenas aulas com status "AGENDADA" são incluídas na agenda
- O limite de 50 aulas agendadas é aplicado para evitar sobrecarga de dados
- As atividades recentes são ordenadas por data de criação (mais recentes primeiro)
- As atividades incluem:
  - Turmas criadas nos últimos 30 dias
  - Aulas criadas nos últimos 7 dias
  - Estudantes matriculados nos últimos 7 dias
- Todas as datas são retornadas no formato ISO 8601 (UTC)

### Filtros de Período para Atividades Recentes
- **Turmas criadas**: Últimos 30 dias
- **Aulas criadas**: Últimos 7 dias
- **Estudantes matriculados**: Últimos 7 dias

### Comparação com Outros Dashboards
- **Admin Dashboard**: Visão geral completa do sistema
- **Client Dashboard**: Dados específicos de uma empresa
- **Instructor Dashboard**: Dados específicos de um instrutor

### Performance
- Utiliza `Promise.all()` para executar queries em paralelo
- Limites aplicados para evitar sobrecarga de dados
- Índices otimizados no banco de dados para consultas rápidas
