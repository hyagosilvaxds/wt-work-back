# API: Adicionar Alunos a uma Turma

## Endpoint
```
POST /superadmin/classes/{classId}/students
```

## Descrição
Adiciona um ou mais alunos a uma turma existente.

## Autenticação
- **Requer**: Token JWT válido
- **Permissão**: `EDIT_USERS`

## Parâmetros da URL
- `classId` (string): ID da turma onde os alunos serão adicionados

## Corpo da Requisição
```json
{
  "studentIds": ["student-id-1", "student-id-2", "student-id-3"]
}
```

### Validações
- `studentIds`: Array obrigatório com pelo menos 1 elemento
- Cada ID deve ser uma string válida e não vazia

## Respostas

### 200 OK - Sucesso
```json
{
  "message": "Alunos adicionados à turma com sucesso",
  "addedStudents": [
    {
      "id": "student-id-1",
      "name": "João Silva"
    },
    {
      "id": "student-id-2", 
      "name": "Maria Santos"
    }
  ],
  "classId": "class-id-123"
}
```

### 400 Bad Request - Erro de Validação
```json
{
  "statusCode": 400,
  "message": "Estudantes não encontrados: student-id-999, student-id-888",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Os seguintes estudantes já estão na turma: João Silva, Maria Santos",
  "error": "Bad Request"
}
```

### 401 Unauthorized - Não Autenticado
```json
{
  "statusCode": 401,
  "message": "Token inválido",
  "error": "Unauthorized"
}
```

### 403 Forbidden - Sem Permissão
```json
{
  "statusCode": 403,
  "message": "Acesso negado. Permissão necessária: EDIT_USERS",
  "error": "Forbidden"
}
```

### 404 Not Found - Turma Não Encontrada
```json
{
  "statusCode": 404,
  "message": "Turma não encontrada",
  "error": "Not Found"
}
```

## Exemplos de Uso

### Curl
```bash
curl -X POST \
  http://localhost:3000/superadmin/classes/class-id-123/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": ["student-id-1", "student-id-2"]
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/superadmin/classes/class-id-123/students', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentIds: ['student-id-1', 'student-id-2']
  })
});

const result = await response.json();
console.log(result);
```

## Comportamento
1. Verifica se a turma existe
2. Verifica se todos os estudantes existem
3. Verifica se algum estudante já está na turma (evita duplicação)
4. Adiciona os estudantes à turma
5. Retorna confirmação com detalhes dos estudantes adicionados

## Notas
- A operação é atômica - se algum estudante não for encontrado, nenhum é adicionado
- Estudantes que já estão na turma não podem ser adicionados novamente
- A resposta inclui os nomes dos estudantes para facilitar a confirmação
