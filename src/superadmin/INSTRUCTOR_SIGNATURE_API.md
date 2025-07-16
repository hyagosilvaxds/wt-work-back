# API de Assinatura de Instrutor com Path de Imagem

## Endpoint

**POST** `/superadmin/signatures`

## Descrição

Este endpoint permite criar ou atualizar a assinatura de um instrutor usando o path de uma imagem já salva no servidor através do sistema de upload de imagens.

## Fluxo de Uso

1. **Primeiro**, faça o upload da imagem usando o endpoint de upload:
   ```bash
   POST /upload/image
   ```

2. **Depois**, use o path retornado para criar a assinatura do instrutor:
   ```bash
   POST /superadmin/signatures
   ```

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
  "instructorId": "clxxxxx",
  "imagePath": "/uploads/images/signatures/12345678-1234-1234-1234-123456789012.png"
}
```

### Parâmetros

- `instructorId` (string, obrigatório): ID do instrutor
- `imagePath` (string, obrigatório): Path da imagem salva no servidor

## Exemplo de Resposta de Sucesso (201 Created)

### Criar Nova Assinatura

```json
{
  "message": "Assinatura criada com sucesso",
  "signature": {
    "id": "clxxxxx",
    "instructorId": "clxxxxx",
    "pngPath": "/uploads/images/signatures/12345678-1234-1234-1234-123456789012.png",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "instructor": {
      "id": "clxxxxx",
      "name": "João Silva",
      "email": "joao.silva@empresa.com"
    }
  }
}
```

### Atualizar Assinatura Existente

```json
{
  "message": "Assinatura atualizada com sucesso",
  "signature": {
    "id": "clxxxxx",
    "instructorId": "clxxxxx",
    "pngPath": "/uploads/images/signatures/12345678-1234-1234-1234-123456789012.png",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:05:00.000Z",
    "instructor": {
      "id": "clxxxxx",
      "name": "João Silva",
      "email": "joao.silva@empresa.com"
    }
  }
}
```

## Exemplos de Erro

### 400 Bad Request - Instrutor não encontrado

```json
{
  "statusCode": 400,
  "message": "Instrutor não encontrado",
  "error": "Bad Request"
}
```

### 401 Unauthorized - Token inválido

```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado",
  "error": "Unauthorized"
}
```

### 403 Forbidden - Sem permissão

```json
{
  "statusCode": 403,
  "message": "Acesso negado. Permissões necessárias: CREATE_USERS",
  "error": "Forbidden"
}
```

### 400 Bad Request - Dados inválidos

```json
{
  "statusCode": 400,
  "message": [
    "instructorId must be a string",
    "imagePath must be a string"
  ],
  "error": "Bad Request"
}
```

## Exemplo de Uso Completo

### 1. Fazer Upload da Imagem

```bash
curl -X POST http://localhost:4000/upload/image \
  -F "file=@/path/to/signature.png" \
  -F "category=signatures"
```

**Resposta:**
```json
{
  "filename": "12345678-1234-1234-1234-123456789012.png",
  "originalname": "signature.png",
  "path": "uploads/images/signatures/12345678-1234-1234-1234-123456789012.png",
  "mimetype": "image/png",
  "size": 123456,
  "url": "/uploads/images/signatures/12345678-1234-1234-1234-123456789012.png"
}
```

### 2. Criar Assinatura do Instrutor

```bash
curl -X POST http://localhost:4000/superadmin/signatures \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": "clxxxxx",
    "imagePath": "/uploads/images/signatures/12345678-1234-1234-1234-123456789012.png"
  }'
```

## Uso no Frontend

### JavaScript/TypeScript

```javascript
const createInstructorSignature = async (instructorId, imagePath) => {
  const response = await fetch('http://localhost:4000/superadmin/signatures', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instructorId,
      imagePath
    })
  });
  
  return response.json();
};

// Exemplo de uso completo
const uploadAndCreateSignature = async (file, instructorId) => {
  // 1. Upload da imagem
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'signatures');
  
  const uploadResponse = await fetch('http://localhost:4000/upload/image', {
    method: 'POST',
    body: formData
  });
  
  const uploadResult = await uploadResponse.json();
  
  // 2. Criar assinatura
  const signatureResult = await createInstructorSignature(
    instructorId,
    uploadResult.url
  );
  
  return signatureResult;
};
```

### React

```jsx
import React, { useState } from 'react';

const SignatureUpload = ({ instructorId, token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadSignature = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    
    try {
      // 1. Upload da imagem
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'signatures');
      
      const uploadResponse = await fetch('http://localhost:4000/upload/image', {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      
      // 2. Criar assinatura
      const signatureResponse = await fetch('http://localhost:4000/superadmin/signatures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instructorId,
          imagePath: uploadResult.url
        })
      });
      
      const signatureResult = await signatureResponse.json();
      setSignature(signatureResult.signature);
      
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect} 
        disabled={loading}
      />
      <button 
        onClick={handleUploadSignature}
        disabled={!selectedFile || loading}
      >
        {loading ? 'Processando...' : 'Upload Assinatura'}
      </button>
      
      {signature && (
        <div>
          <h3>Assinatura Salva</h3>
          <p>Instrutor: {signature.instructor.name}</p>
          <img 
            src={`http://localhost:4000${signature.pngPath}`} 
            alt="Assinatura" 
            style={{maxWidth: '300px'}}
          />
        </div>
      )}
    </div>
  );
};
```

## Funcionalidades

- ✅ Criação de nova assinatura
- ✅ Atualização de assinatura existente
- ✅ Validação de instrutor existente
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros
- ✅ Resposta com dados do instrutor
- ✅ Integração com sistema de upload de imagens
- ✅ Permissões de acesso
