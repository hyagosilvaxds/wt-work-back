# Sistema de Roles e Permissões

## Visão Geral

O sistema foi reestruturado para usar um modelo baseado em **roles** (papéis) e **permissions** (permissões), eliminando a necessidade de tabelas separadas para `Instructor` e `Student`.

## Estrutura Principal

### 1. **User (Usuário)**
- **Único modelo** para todos os tipos de usuário
- **Campos específicos** baseados no role:
  - `bio`: Para instrutores
  - `clientId`, `enrollmentDate`: Para estudantes
- **Relacionamentos**: Mantém as relações com classes, certificados, etc.

### 2. **Role (Papel)**
- Define tipos de usuário: `SUPER_ADMIN`, `INSTRUCTOR`, `STUDENT`
- Cada usuário tem **obrigatoriamente** um role (`roleId` obrigatório)
- Conectado às permissões através de `RolePermission`

### 3. **Permission (Permissão)**
- Define ações específicas: `CREATE_TRAINING`, `TEACH_CLASS`, `ENROLL_CLASS`, etc.
- Reutilizável entre diferentes roles

### 4. **RolePermission (Relacionamento)**
- Tabela de ligação entre roles e permissões
- Permite controle granular de acesso

## Exemplos de Uso

### Criar um Instrutor
```typescript
const instructor = await prisma.user.create({
  data: {
    name: 'Maria Silva',
    email: 'maria@empresa.com',
    password: 'senha_hash',
    roleId: instructorRoleId,
    bio: 'Instrutora especializada em desenvolvimento web',
    skills: {
      connect: [{ id: 'javascript_skill_id' }]
    }
  }
});
```

### Criar um Estudante
```typescript
const student = await prisma.user.create({
  data: {
    name: 'João Santos',
    email: 'joao@empresa.com',
    password: 'senha_hash',
    roleId: studentRoleId,
    clientId: 'client_id',
    enrollmentDate: new Date(),
  }
});
```

### Verificar Permissões
```typescript
const canCreateTraining = await hasPermission(userId, 'CREATE_TRAINING');
if (canCreateTraining) {
  // Usuário pode criar treinamentos
}
```

## Permissões Sugeridas

- **CREATE_TRAINING**: Criar treinamentos
- **EDIT_TRAINING**: Editar treinamentos
- **DELETE_TRAINING**: Deletar treinamentos
- **TEACH_CLASS**: Ministrar aulas
- **ENROLL_CLASS**: Se inscrever em aulas
- **MANAGE_USERS**: Gerenciar usuários
- **VIEW_FINANCIAL**: Visualizar dados financeiros
- **MANAGE_FINANCIAL**: Gerenciar dados financeiros

## Distribuição de Permissões

### Super Admin
- Todas as permissões

### Instructor
- `TEACH_CLASS`
- `VIEW_FINANCIAL`

### Student
- `ENROLL_CLASS`

## Vantagens desta Abordagem

1. **Flexibilidade**: Fácil adição de novos roles e permissões
2. **Escalabilidade**: Não precisa criar novas tabelas para novos tipos de usuário
3. **Manutenibilidade**: Código mais limpo e centralizalizado
4. **Controle granular**: Permissões específicas por funcionalidade
5. **Extensibilidade**: Fácil evolução do sistema de autorização

## Migrações

Execute o seguinte comando para aplicar as mudanças:

```bash
npx prisma migrate dev --name restructure-user-roles-permissions
```

Para popular o banco com dados de exemplo:

```bash
npx ts-node prisma/seed.ts
```
