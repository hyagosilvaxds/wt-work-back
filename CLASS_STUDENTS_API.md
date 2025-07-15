# API para Gerenciar Alunos em Turmas

Esta documentação descreve os novos endpoints para adicionar e remover alunos de turmas.

## Endpoints Disponíveis

### 1. Adicionar Alunos à Turma
**POST** `/superadmin/classes/:id/students`

Adiciona um ou mais alunos a uma turma específica.

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Parâmetros da URL:**
- `id` (string): ID da turma

**Body:**
```json
{
  "studentIds": ["student_id_1", "student_id_2", "student_id_3"]
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "2 aluno(s) adicionado(s) à turma com sucesso",
  "class": {
    "id": "class_id",
    "trainingId": "training_id",
    "instructorId": "instructor_id",
    "startDate": "2025-07-15T10:00:00.000Z",
    "endDate": "2025-07-15T18:00:00.000Z",
    "type": "CURSO",
    "recycling": "NÃO",
    "status": "EM_ABERTO",
    "location": "Sala 1",
    "clientId": "client_id",
    "observations": null,
    "createdAt": "2025-07-15T08:00:00.000Z",
    "updatedAt": "2025-07-15T10:30:00.000Z",
    "training": { /* dados do treinamento */ },
    "instructor": { /* dados do instrutor */ },
    "client": { /* dados do cliente */ },
    "students": [ /* lista de alunos matriculados */ ],
    "lessons": [ /* lista de aulas */ ]
  },
  "addedStudents": 2,
  "totalStudents": 5
}
```

### 2. Remover Alunos da Turma
**DELETE** `/superadmin/classes/:id/students`

Remove um ou mais alunos de uma turma específica.

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Parâmetros da URL:**
- `id` (string): ID da turma

**Body:**
```json
{
  "studentIds": ["student_id_1", "student_id_2"]
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "2 aluno(s) removido(s) da turma com sucesso",
  "class": {
    "id": "class_id",
    "trainingId": "training_id",
    "instructorId": "instructor_id",
    "startDate": "2025-07-15T10:00:00.000Z",
    "endDate": "2025-07-15T18:00:00.000Z",
    "type": "CURSO",
    "recycling": "NÃO",
    "status": "EM_ABERTO",
    "location": "Sala 1",
    "clientId": "client_id",
    "observations": null,
    "createdAt": "2025-07-15T08:00:00.000Z",
    "updatedAt": "2025-07-15T10:30:00.000Z",
    "training": { /* dados do treinamento */ },
    "instructor": { /* dados do instrutor */ },
    "client": { /* dados do cliente */ },
    "students": [ /* lista de alunos matriculados */ ],
    "lessons": [ /* lista de aulas */ ]
  },
  "removedStudents": 2,
  "totalStudents": 3
}
```

## Validações e Regras de Negócio

### Para Adicionar Alunos:
1. **Turma deve existir**: O ID da turma deve corresponder a uma turma válida no sistema
2. **Alunos devem existir**: Todos os IDs de alunos fornecidos devem existir no sistema
3. **Duplicidade**: Alunos que já estão matriculados na turma são ignorados
4. **Resultado vazio**: Se todos os alunos já estiverem matriculados, retorna erro

### Para Remover Alunos:
1. **Turma deve existir**: O ID da turma deve corresponder a uma turma válida no sistema
2. **Alunos matriculados**: Apenas alunos que estão atualmente matriculados na turma podem ser removidos
3. **Resultado vazio**: Se nenhum dos alunos especificados estiver matriculado na turma, retorna erro

## Códigos de Erro

### 400 - Bad Request
- Todos os alunos já estão matriculados nesta turma (ao adicionar)
- Nenhum dos alunos especificados está matriculado nesta turma (ao remover)
- Um ou mais alunos não foram encontrados (ao adicionar)

### 404 - Not Found
- Turma não encontrada

### 401 - Unauthorized
- Token inválido ou expirado

### 403 - Forbidden
- Permissões insuficientes (requer `EDIT_USERS`)

## Permissões Necessárias
- **Adicionar/Remover alunos**: `EDIT_USERS`

## Exemplo de Uso com curl

### Adicionar alunos:
```bash
curl -X POST http://localhost:4000/superadmin/classes/cl_xxxx/students \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": ["student_id_1", "student_id_2"]
  }'
```

### Remover alunos:
```bash
curl -X DELETE http://localhost:4000/superadmin/classes/cl_xxxx/students \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": ["student_id_1"]
  }'
```

## Notas Importantes

1. **Relacionamento Many-to-Many**: O sistema usa uma relação many-to-many entre turmas e alunos, permitindo que um aluno esteja em várias turmas
2. **Transações**: As operações são atômicas - ou todos os alunos válidos são processados ou nada é alterado
3. **Retorno Completo**: Ambos endpoints retornam a turma completa com todos os relacionamentos após a operação
4. **Contadores**: Os endpoints retornam contadores úteis (`addedStudents`, `removedStudents`, `totalStudents`)
