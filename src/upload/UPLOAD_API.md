# Upload de Imagens API

Este módulo fornece endpoints para upload, visualização e exclusão de imagens.

## Endpoints

### 1. Upload de Imagem Única

**POST** `/upload/image`

**Content-Type:** `multipart/form-data`

**Parâmetros:**
- `file` (obrigatório): Arquivo de imagem
- `category` (opcional): Categoria para organizar as imagens
- `description` (opcional): Descrição da imagem

**Exemplo de uso:**
```bash
curl -X POST http://localhost:4000/upload/image \
  -F "file=@/path/to/image.jpg" \
  -F "category=profile" \
  -F "description=Foto de perfil"
```

**Resposta:**
```json
{
  "filename": "12345678-1234-1234-1234-123456789012.jpg",
  "originalname": "image.jpg",
  "path": "uploads/images/profile/12345678-1234-1234-1234-123456789012.jpg",
  "mimetype": "image/jpeg",
  "size": 123456,
  "url": "/uploads/images/profile/12345678-1234-1234-1234-123456789012.jpg"
}
```

### 2. Visualizar Imagem

**GET** `/upload/image/:category/:filename`
**GET** `/upload/image/:filename` (sem categoria)

**Exemplo:**
```bash
curl http://localhost:4000/upload/image/profile/12345678-1234-1234-1234-123456789012.jpg
```

### 3. Excluir Imagem

**DELETE** `/upload/image`

**Body:**
```json
{
  "path": "uploads/images/profile/12345678-1234-1234-1234-123456789012.jpg"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Arquivo deletado com sucesso"
}
```

## Restrições

- Apenas arquivos de imagem são permitidos
- Tamanho máximo: 5MB
- Formatos suportados: JPEG, PNG, GIF, WebP, etc.

## Estrutura de Diretórios

```
uploads/
├── images/
│   ├── profile/
│   ├── signatures/
│   └── general/
```

## Uso no Frontend

### JavaScript/TypeScript

```javascript
const uploadImage = async (file, category = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  
  const response = await fetch('http://localhost:4000/upload/image', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// Uso
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const result = await uploadImage(file, 'profile');
console.log('Imagem salva em:', result.url);
```

### React

```jsx
import React, { useState } from 'react';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', 'profile');

    try {
      const response = await fetch('http://localhost:4000/upload/image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setImageUrl(`http://localhost:4000${result.url}`);
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <button onClick={handleUpload}>Upload</button>
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{maxWidth: '300px'}} />}
    </div>
  );
};
```
