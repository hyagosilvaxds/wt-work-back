# Como Requisitar Permissões do Usuário

## 📋 Visão Geral

Existem diferentes formas de consultar as permissões de um usuário no sistema, dependendo do contexto e necessidade.

## 🔐 1. Endpoint Principal: Minhas Permissões

### **GET** `/auth/permissions`

**Descrição:** Permite ao usuário consultar suas próprias permissões.

**Autenticação:** JWT Bearer Token obrigatório

**Exemplo de Uso:**
```bash
# 1. Fazer login
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@sistema.com", "password": "123456"}'

# 2. Usar o token para consultar permissões
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer {token_obtido_no_login}"
```

**Resposta Completa:**
```json
{
  "user": {
    "id": "cmcxijm0i006fvbvt8n2mwkza",
    "name": "Maria Instrutora", 
    "email": "maria@sistema.com",
    "role": {
      "id": "cmcxijlvx001dvbvttff31rwt",
      "name": "INSTRUCTOR",
      "description": "Instrutor que pode ministrar aulas"
    }
  },
  "permissions": [
    {
      "id": "cmcxijlux0007vbvtkpecdsb4",
      "name": "EDIT_OWN_TRAININGS",
      "description": "Editar Apenas Treinamentos Ministrados por Ele"
    },
    {
      "id": "cmcxijlv8000uvbvtgfwfcgcf", 
      "name": "EDIT_PROFILE",
      "description": "Editar Perfil"
    },
    {
      "id": "cmcxijlv7000rvbvtwtxgb6lb",
      "name": "VIEW_OWN_CERTIFICATES", 
      "description": "Visualizar Apenas Certificados de Treinamentos Ministrados por Ele"
    }
  ]
}
```

## 🔍 2. Endpoint Administrativo: Listar Todas as Permissões

### **GET** `/superadmin/permissions`

**Descrição:** Lista todas as permissões disponíveis no sistema (apenas para administradores).

**Permissão Necessária:** `VIEW_USERS` ou `MANAGE_USERS`

**Exemplo de Uso:**
```bash
curl -X GET http://localhost:4000/superadmin/permissions \
  -H "Authorization: Bearer {admin_token}"
```

**Resposta:**
```json
[
  {
    "id": "cmcxijlux0007vbvtkpecdsb4",
    "name": "EDIT_OWN_TRAININGS",
    "description": "Editar Apenas Treinamentos Ministrados por Ele"
  },
  {
    "id": "cmcxijlv8000uvbvtgfwfcgcf",
    "name": "EDIT_PROFILE", 
    "description": "Editar Perfil"
  }
]
```

## 👥 3. Exemplos por Tipo de Usuário

### Super Admin (49 permissões)
```bash
# Login como admin
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sistema.com", "password": "123456"}'

# Consultar permissões
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer {token}"
```

**Retorna:** Todas as 49 permissões do sistema

### Instrutor (15 permissões específicas)
```bash
# Login como instrutor
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@sistema.com", "password": "123456"}'

# Consultar permissões
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer {token}"
```

**Retorna:** Apenas permissões relacionadas aos próprios treinamentos/aulas

### Financeiro (16 permissões financeiras)
```bash
# Login como financeiro
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@sistema.com", "password": "123456"}'

# Consultar permissões  
curl -X GET http://localhost:4000/auth/permissions \
  -H "Authorization: Bearer {token}"
```

**Retorna:** Apenas permissões relacionadas a dados financeiros

## 🛡️ 4. Verificação de Permissão Específica

Para verificar se um usuário tem uma permissão específica, você pode:

### Frontend/JavaScript
```javascript
// Após fazer login e obter o token
const response = await fetch('/auth/permissions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Verificar se tem permissão específica
const hasPermission = data.permissions.some(p => p.name === 'EDIT_OWN_TRAININGS');

if (hasPermission) {
  // Usuário pode editar seus próprios treinamentos
  showEditButton();
}
```

### Validação no Backend
```typescript
// O sistema automaticamente valida via @RequirePermissions decorator
@RequirePermissions('EDIT_OWN_TRAININGS')
async editTraining() {
  // Só executa se o usuário tiver a permissão
}
```

## 🔄 5. Fluxo Completo de Verificação

### 1. Login
```bash
POST /auth/signin
```

### 2. Consultar Permissões
```bash
GET /auth/permissions
```

### 3. Armazenar Permissões no Frontend
```javascript
// Armazenar no estado da aplicação
const userPermissions = data.permissions.map(p => p.name);
```

### 4. Verificar Antes de Ações
```javascript
// Antes de mostrar botão/link
if (userPermissions.includes('CREATE_TRAININGS')) {
  showCreateButton();
}

// Antes de fazer requisição
if (userPermissions.includes('EDIT_OWN_TRAININGS')) {
  await editTraining();
}
```

## 📊 6. Permissões por Role

### SUPER_ADMIN
- **Total:** 49 permissões
- **Acesso:** Irrestrito a todas as funcionalidades

### INSTRUCTOR  
- **Total:** 15 permissões
- **Foco:** Próprios treinamentos, aulas e certificados
- **Limitações:** Só vê/edita conteúdo próprio

### FINANCIAL
- **Total:** 16 permissões
- **Foco:** Dados financeiros completos
- **Especialidade:** Contas, fluxo de caixa, relatórios financeiros

### STUDENT
- **Total:** 5 permissões
- **Foco:** Visualização limitada
- **Restrições:** Apenas consulta básica

## 💡 7. Boas Práticas

### Segurança
- ✅ Sempre validar permissões no backend
- ✅ Não confiar apenas na validação frontend
- ✅ Usar JWT para autenticação
- ✅ Verificar permissões antes de cada ação

### Performance
- ✅ Cachear permissões no frontend após login
- ✅ Renovar cache apenas quando necessário
- ✅ Usar debounce para verificações frequentes

### UX
- ✅ Esconder botões/links que o usuário não pode usar
- ✅ Mostrar mensagens claras sobre falta de permissão
- ✅ Direcionar usuário para funcionalidades permitidas

## 🚀 Conclusão

O endpoint `/auth/permissions` é a forma principal e mais segura de consultar as permissões de um usuário. Ele retorna apenas as permissões do usuário autenticado, garantindo que cada pessoa veja apenas o que pode fazer no sistema.

**Endpoint principal:** `GET /auth/permissions`
**Requisito:** JWT Token válido
**Retorno:** Permissões específicas do usuário logado
