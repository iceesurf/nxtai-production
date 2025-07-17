# Guia de Contribuição - NXT.AI

## 🤝 Como Contribuir

### 1. Configuração do Ambiente

```bash
# Fork o repositório
# Clone seu fork
git clone https://github.com/seu-usuario/nxtai-production.git
cd nxtai-production

# Adicione o repositório original como upstream
git remote add upstream https://github.com/nxtai/nxtai-production.git

# Instale as dependências
npm install
```

### 2. Fluxo de Trabalho

1. Crie uma branch para sua feature
```bash
git checkout -b feature/nome-da-feature
```

2. Faça suas alterações seguindo os padrões

3. Commit suas mudanças
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

4. Push para seu fork
```bash
git push origin feature/nome-da-feature
```

5. Abra um Pull Request

### 3. Padrões de Código

#### JavaScript
- Use ES6+
- Semicolons obrigatórios
- Aspas simples para strings
- 2 espaços para indentação

#### CSS
- Use variáveis CSS
- Mobile-first
- BEM para nomenclatura

#### Commits
Seguimos Conventional Commits:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### 4. Testes

Todos os PRs devem:
- Passar nos testes existentes
- Incluir novos testes quando aplicável
- Manter coverage acima de 80%

```bash
# Rodar testes
npm test

# Rodar testes com coverage
npm run test:coverage
```

### 5. Code Review

Todos os PRs passam por review. Esperamos:
- Código limpo e legível
- Documentação adequada
- Sem código comentado
- Performance otimizada

## 📋 Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Sem conflitos com main
- [ ] PR tem descrição clara
- [ ] Screenshots (se aplicável)

## 🐛 Reportando Bugs

Use o template de issue para bugs:
1. Descrição clara
2. Passos para reproduzir
3. Comportamento esperado
4. Screenshots
5. Ambiente (OS, Browser, etc)

## 💡 Sugerindo Features

1. Verifique se já não existe
2. Abra uma issue de discussão
3. Aguarde aprovação antes de implementar

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.
