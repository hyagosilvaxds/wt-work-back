# PUT vs PATCH para Atualização de Roles

## Resumo das Diferenças

### PUT `/superadmin/roles/{id}`
- **Atualização Completa**: Substitui completamente o recurso
- **Permissões**: Se `permissionIds` não for fornecido, as permissões atuais são mantidas
- **Comportamento**: Atualiza todos os campos fornecidos

### PATCH `/superadmin/roles/{id}`
- **Atualização Parcial**: Modifica apenas os campos fornecidos
- **Permissões**: Se `permissionIds` não for fornecido, as permissões atuais são **preservadas**
- **Comportamento**: Mais conservador, ideal para mudanças específicas

## Casos de Uso

### Quando usar PUT
```bash
# Atualizar nome, descrição e permissões
curl -X PUT http://localhost:4000/superadmin/roles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "NOVO_NOME",
    "description": "Nova descrição",
    "permissionIds": ["perm1", "perm2", "perm3"]
  }'
```

### Quando usar PATCH
```bash
# Atualizar apenas a descrição (mantém nome e permissões)
curl -X PATCH http://localhost:4000/superadmin/roles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "description": "Descrição atualizada"
  }'

# Atualizar apenas o nome (mantém descrição e permissões)
curl -X PATCH http://localhost:4000/superadmin/roles/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "NOME_ATUALIZADO"
  }'
```

## Comportamento com Permissões

### PUT
- `permissionIds` não fornecido: Mantém permissões atuais
- `permissionIds: []`: Remove todas as permissões
- `permissionIds: ["id1", "id2"]`: Substitui por essas permissões

### PATCH
- `permissionIds` não fornecido: **Preserva** permissões atuais
- `permissionIds: []`: Remove todas as permissões
- `permissionIds: ["id1", "id2"]`: Substitui por essas permissões

## Exemplo Prático

### Estado Inicial do Role
```json
{
  "id": "role123",
  "name": "MODERATOR",
  "description": "Role de moderador",
  "permissions": [
    {"id": "perm1", "name": "VIEW_USERS"},
    {"id": "perm2", "name": "EDIT_USERS"}
  ]
}
```

### Atualização com PUT
```bash
# Request
{
  "description": "Nova descrição"
}

# Resultado: Mantém nome e permissões, atualiza descrição
{
  "name": "MODERATOR",
  "description": "Nova descrição",
  "permissions": [
    {"id": "perm1", "name": "VIEW_USERS"},
    {"id": "perm2", "name": "EDIT_USERS"}
  ]
}
```

### Atualização com PATCH
```bash
# Request
{
  "description": "Nova descrição via PATCH"
}

# Resultado: Idêntico ao PUT para este caso
{
  "name": "MODERATOR",
  "description": "Nova descrição via PATCH",
  "permissions": [
    {"id": "perm1", "name": "VIEW_USERS"},
    {"id": "perm2", "name": "EDIT_USERS"}
  ]
}
```

## Recomendações

1. **Use PATCH** quando quiser fazer mudanças específicas sem afetar outros campos
2. **Use PUT** quando quiser fazer uma atualização mais completa do role
3. **Sempre seja explícito** com `permissionIds` se quiser alterar permissões
4. **Use PATCH** para operações de UI que alteram um campo por vez
5. **Use PUT** para formulários completos de edição

## Validações

Ambos os endpoints têm as mesmas validações:
- ✅ Nome único (se fornecido)
- ✅ Role deve existir
- ✅ Permissões devem existir (se fornecidas)
- ✅ Permissão `EDIT_ROLES` necessária
