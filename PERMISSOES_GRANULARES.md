# Sistema de Permissões Granulares

## Visão Geral
Este documento detalha o sistema de permissões granulares implementado no sistema de treinamentos, permitindo controle fino sobre o que cada usuário pode fazer.

## 📋 Permissões por Módulo

### 👥 Usuários
- `CREATE_USERS` - Criar Usuários
- `VIEW_USERS` - Visualizar Usuários
- `EDIT_USERS` - Editar Usuários
- `DELETE_USERS` - Excluir Usuários
- `MANAGE_USERS` - Gerenciar Usuários (Acesso Total)

### 🎭 Funções (Roles)
- `CREATE_ROLES` - Criar Funções
- `VIEW_ROLES` - Visualizar Funções
- `EDIT_ROLES` - Editar Funções
- `DELETE_ROLES` - Excluir Funções

### 🎓 Alunos
- `CREATE_STUDENTS` - Criar Alunos
- `VIEW_STUDENTS` - Visualizar Alunos
- `EDIT_STUDENTS` - Editar Alunos
- `DELETE_STUDENTS` - Excluir Alunos

### 📚 Treinamentos
#### Permissões Gerais
- `CREATE_TRAININGS` - Criar Treinamentos
- `VIEW_TRAININGS` - Visualizar Todos os Treinamentos
- `EDIT_TRAININGS` - Editar Treinamentos
- `DELETE_TRAININGS` - Excluir Treinamentos

#### Permissões Específicas
- `VIEW_OWN_TRAININGS` - **Visualizar Apenas Treinamentos Ministrados por Ele**
- `EDIT_OWN_TRAININGS` - **Editar Apenas Treinamentos Ministrados por Ele**

### 🏫 Aulas
#### Permissões Gerais
- `CREATE_CLASSES` - Criar Aulas
- `VIEW_CLASSES` - Visualizar Todas as Aulas
- `EDIT_CLASSES` - Editar Aulas
- `DELETE_CLASSES` - Excluir Aulas

#### Permissões Específicas
- `VIEW_OWN_CLASSES` - **Visualizar Apenas Aulas Ministradas por Ele**
- `EDIT_OWN_CLASSES` - **Editar Apenas Aulas Ministradas por Ele**

### 💰 Financeiro
#### Gestão Geral
- `CREATE_FINANCIAL` - Criar Registros Financeiros
- `VIEW_FINANCIAL` - Visualizar Dados Financeiros
- `EDIT_FINANCIAL` - Editar Dados Financeiros
- `DELETE_FINANCIAL` - Excluir Registros Financeiros

#### Contas a Receber/Pagar
- `VIEW_ACCOUNTS_RECEIVABLE` - **Visualizar Contas a Receber**
- `VIEW_ACCOUNTS_PAYABLE` - **Visualizar Contas a Pagar**
- `SETTLE_ACCOUNTS` - **Quitar Contas**

#### Fluxo de Caixa e Bancos
- `VIEW_CASH_FLOW` - **Visualizar Fluxo de Caixa**
- `MANAGE_BANK_ACCOUNTS` - **Gerenciar Contas Bancárias**

#### Relatórios Financeiros
- `VIEW_FINANCIAL_REPORTS` - **Visualizar Relatórios Financeiros**
- `GENERATE_FINANCIAL_REPORTS` - **Gerar Relatórios Financeiros**

### 🎖️ Certificados
#### Permissões Gerais
- `CREATE_CERTIFICATES` - Criar Certificados
- `VIEW_CERTIFICATES` - Visualizar Certificados

#### Permissões Específicas
- `CREATE_OWN_CERTIFICATES` - **Emitir Certificados Apenas de Treinamentos Ministrados por Ele**
- `VIEW_OWN_CERTIFICATES` - **Visualizar Apenas Certificados de Treinamentos Ministrados por Ele**

### 👤 Perfil
- `VIEW_PROFILE` - Visualizar Perfil
- `EDIT_PROFILE` - Editar Perfil

### 📊 Relatórios
- `CREATE_REPORTS` - Criar Relatórios
- `VIEW_REPORTS` - Visualizar Relatórios
- `EDIT_REPORTS` - Editar Relatórios
- `DELETE_REPORTS` - Excluir Relatórios
- `EXPORT_REPORTS` - Exportar Relatórios
- `VIEW_ANALYTICS` - Visualizar Análises
- `VIEW_DASHBOARD` - Visualizar Dashboard

## 🎭 Roles e Suas Permissões

### 🔑 SUPER_ADMIN
**Descrição:** Administrador com acesso total
**Usuários:** admin@sistema.com
**Permissões:** TODAS as 49 permissões

### 👨‍🏫 INSTRUCTOR
**Descrição:** Instrutor que pode ministrar aulas
**Usuários:** maria@sistema.com

**Permissões Específicas:**
- Treinamentos: `VIEW_OWN_TRAININGS`, `EDIT_OWN_TRAININGS`, `CREATE_TRAININGS`
- Aulas: `VIEW_OWN_CLASSES`, `EDIT_OWN_CLASSES`, `CREATE_CLASSES`
- Alunos: `VIEW_STUDENTS`, `EDIT_STUDENTS`
- Certificados: `VIEW_OWN_CERTIFICATES`, `CREATE_OWN_CERTIFICATES`
- Perfil: `VIEW_PROFILE`, `EDIT_PROFILE`
- Relatórios: `VIEW_REPORTS`, `VIEW_ANALYTICS`, `VIEW_DASHBOARD`

### 💰 FINANCIAL
**Descrição:** Responsável financeiro com acesso a dados financeiros
**Usuários:** ana@sistema.com

**Permissões Específicas:**
- Financeiro: Todas as permissões financeiras
- Contas: `VIEW_ACCOUNTS_RECEIVABLE`, `VIEW_ACCOUNTS_PAYABLE`, `SETTLE_ACCOUNTS`
- Fluxo: `VIEW_CASH_FLOW`, `MANAGE_BANK_ACCOUNTS`
- Relatórios: `VIEW_FINANCIAL_REPORTS`, `GENERATE_FINANCIAL_REPORTS`
- Perfil: `VIEW_PROFILE`, `EDIT_PROFILE`
- Dashboard: `VIEW_REPORTS`, `VIEW_ANALYTICS`, `VIEW_DASHBOARD`

### 🎓 STUDENT
**Descrição:** Estudante que pode se inscrever em aulas
**Usuários:** Nenhum usuário no sistema (apenas estudantes na tabela separada)

**Permissões Limitadas:**
- Treinamentos: `VIEW_TRAININGS`
- Aulas: `VIEW_CLASSES`
- Certificados: `VIEW_CERTIFICATES`
- Perfil: `VIEW_PROFILE`, `EDIT_PROFILE`

## 🔐 Implementação de Segurança

### Permissões Granulares por Instrutor
As permissões `*_OWN_*` garantem que:
- **Instrutores só veem seus próprios treinamentos** (`VIEW_OWN_TRAININGS`)
- **Instrutores só editam seus próprios treinamentos** (`EDIT_OWN_TRAININGS`)
- **Instrutores só veem suas próprias aulas** (`VIEW_OWN_CLASSES`)
- **Instrutores só editam suas próprias aulas** (`EDIT_OWN_CLASSES`)
- **Instrutores só emitem certificados de seus treinamentos** (`CREATE_OWN_CERTIFICATES`)

### Separação Financeira
O role **FINANCIAL** tem acesso exclusivo a:
- Contas a receber e pagar
- Fluxo de caixa
- Gestão de contas bancárias
- Quitação de contas
- Relatórios financeiros específicos

## 📊 Estatísticas do Sistema

- **Total de Permissões:** 48
- **Total de Roles:** 4
- **Usuários Ativos:** 3
- **Estudantes:** 1

## 🔍 Como Usar

### Verificar Permissões de um Usuário
```bash
# Login
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "maria@sistema.com", "password": "123456"}'

# Usar o token retornado para acessar recursos protegidos
curl -X GET http://localhost:4000/superadmin/users \
  -H "Authorization: Bearer {token}"
```

### Criar Novo Role com Permissões Específicas
```bash
curl -X POST http://localhost:4000/superadmin/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "AUDITOR",
    "description": "Auditor com acesso de leitura",
    "permissionIds": [
      "VIEW_FINANCIAL_REPORTS",
      "VIEW_ACCOUNTS_RECEIVABLE", 
      "VIEW_ACCOUNTS_PAYABLE"
    ]
  }'
```

## 🚀 Benefícios

1. **Segurança Granular:** Controle fino sobre cada ação
2. **Separação de Responsabilidades:** Cada role tem acesso apenas ao necessário
3. **Escalabilidade:** Fácil adição de novas permissões
4. **Auditoria:** Rastreamento claro de quem pode fazer o quê
5. **Flexibilidade:** Combinação de permissões para roles específicos

## 📝 Próximos Passos

1. **Implementar Middleware de Verificação:** Para permissões `*_OWN_*`
2. **Logs de Auditoria:** Registrar todas as ações por permissão
3. **Interface de Gestão:** Dashboard para administrar permissões
4. **Permissões Temporárias:** Sistema de permissões com expiração
5. **Permissões por Cliente:** Isolamento de dados por cliente

---

**Nota:** Este sistema permite um controle muito fino sobre as ações dos usuários, garantindo que cada pessoa tenha acesso apenas ao que precisa para exercer sua função.
