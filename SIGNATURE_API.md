# API de Upload de Assinaturas

## Descrição
Esta API permite fazer upload, visualizar e gerenciar assinaturas de instrutores. As assinaturas são armazenadas como arquivos PNG/JPG na pasta `uploads/signatures/` e o caminho é salvo na tabela `signature` do banco de dados.

## Endpoints Disponíveis

### 1. Upload de Assinatura
**POST** `/superadmin/signatures/upload`

Faz upload de uma imagem de assinatura para um instrutor específico.

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Parâmetros:**
- `signature` (file): Arquivo de imagem (PNG, JPG, JPEG) - máximo 5MB
- `instructorId` (string): ID do instrutor

**Exemplo usando curl:**
```bash
curl -X POST http://localhost:4000/superadmin/signatures/upload \
  -H "Authorization: Bearer seu_token_aqui" \
  -F "signature=@caminho/para/assinatura.png" \
  -F "instructorId=clxxxxx"
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Assinatura criada com sucesso",
  "signature": {
    "id": "clxxxxx",
    "instructorId": "clxxxxx",
    "pngPath": "/uploads/signatures/signature-clxxxxx-1234567890.png",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "instructor": {
      "id": "clxxxxx",
      "name": "Nome do Instrutor",
      "email": "instrutor@email.com"
    }
  }
}
```

### 2. Buscar Assinatura por Instrutor
**GET** `/superadmin/signatures/instructor/{instructorId}`

Busca a assinatura de um instrutor específico.

**Headers:**
- `Authorization: Bearer {token}`

**Resposta de Sucesso (200):**
```json
{
  "id": "clxxxxx",
  "instructorId": "clxxxxx",
  "pngPath": "/uploads/signatures/signature-clxxxxx-1234567890.png",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "instructor": {
    "id": "clxxxxx",
    "name": "Nome do Instrutor",
    "email": "instrutor@email.com"
  }
}
```

### 3. Listar Todas as Assinaturas
**GET** `/superadmin/signatures`

Lista todas as assinaturas com paginação e filtro de busca.

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Busca por nome ou email do instrutor

**Exemplo:**
```
GET /superadmin/signatures?page=1&limit=10&search=João
```

**Resposta de Sucesso (200):**
```json
{
  "signatures": [
    {
      "id": "clxxxxx",
      "instructorId": "clxxxxx",
      "pngPath": "/uploads/signatures/signature-clxxxxx-1234567890.png",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "instructor": {
        "id": "clxxxxx",
        "name": "Nome do Instrutor",
        "email": "instrutor@email.com"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 4. Deletar Assinatura
**DELETE** `/superadmin/signatures/instructor/{instructorId}`

Remove a assinatura de um instrutor (tanto o arquivo quanto o registro no banco).

**Headers:**
- `Authorization: Bearer {token}`

**Resposta de Sucesso (200):**
```json
{
  "message": "Assinatura excluída com sucesso"
}
```

## Permissões Necessárias
- **Upload/Criação**: `CREATE_USERS`
- **Visualização**: `VIEW_USERS`
- **Exclusão**: `DELETE_USERS`

## Funcionalidades Especiais

### Upload Inteligente
- Se um instrutor já possui uma assinatura, o upload irá **sobrescrever** a assinatura existente
- O arquivo antigo será automaticamente removido do sistema de arquivos
- Apenas um arquivo de assinatura por instrutor é permitido

### Validações
- Apenas arquivos PNG, JPG e JPEG são aceitos
- Tamanho máximo do arquivo: 5MB
- O instrutor deve existir no sistema antes do upload

### Estrutura de Arquivos
- Arquivos são salvos em: `uploads/signatures/`
- Nome do arquivo: `signature-{instructorId}-{timestamp}.{extensão}`
- Exemplo: `signature-clxxxxx-1641024000000.png`

## Códigos de Erro

### 400 - Bad Request
- Arquivo não fornecido
- Tipo de arquivo inválido
- Arquivo muito grande

### 404 - Not Found
- Instrutor não encontrado
- Assinatura não encontrada

### 401 - Unauthorized
- Token inválido ou expirado

### 403 - Forbidden
- Permissões insuficientes

## Exemplo de Uso com JavaScript (Frontend)

```javascript
// Função para fazer upload de assinatura
async function uploadSignature(instructorId, file, token) {
  const formData = new FormData();
  formData.append('signature', file);
  formData.append('instructorId', instructorId);

  try {
    const response = await fetch('/superadmin/signatures/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erro no upload');
    }

    const result = await response.json();
    console.log('Upload realizado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

// Exemplo de uso
const fileInput = document.getElementById('signature-file');
const file = fileInput.files[0];
const instructorId = 'clxxxxx';
const token = 'seu_token_jwt';

uploadSignature(instructorId, file, token)
  .then(result => {
    // Sucesso
    console.log('Assinatura enviada:', result.signature.pngPath);
  })
  .catch(error => {
    // Erro
    console.error('Falha no upload:', error);
  });
```

## Notas Importantes

1. **Backup**: Recomenda-se fazer backup regular da pasta `uploads/signatures/`
2. **Segurança**: Os arquivos são servidos estaticamente através da rota `/uploads/`
3. **Performance**: Para grandes volumes, considere usar um serviço de armazenamento em nuvem
4. **Nomenclatura**: O ID do instrutor é incluído no nome do arquivo para facilitar identificação
