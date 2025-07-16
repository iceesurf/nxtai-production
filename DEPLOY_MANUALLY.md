# Guia de Deploy Manual para NXT.AI

Devido a restrições de segurança no seu ambiente Google Cloud, o deploy automático não foi possível. Siga estes passos para fazer o deploy do seu projeto manualmente a partir da sua máquina local.

## Passo 1: Baixe o Pacote de Deploy

Faça o download do arquivo `nxtai-deployment.tar.gz` que foi criado no ambiente.

## Passo 2: Extraia os Arquivos

No seu terminal local, navegue até a pasta onde você salvou o arquivo e execute o seguinte comando para extrair o conteúdo:

```bash
tar -xzvf nxtai-deployment.tar.gz
```

Isso criará uma pasta chamada `nxtai-production`.

## Passo 3: Navegue até a Pasta do Projeto

Entre no diretório do projeto que você acabou de extrair:

```bash
cd nxtai-production
```

## Passo 4: Instale as Dependências

É crucial instalar as dependências para o projeto principal e para as Cloud Functions.

**Instale as dependências da raiz:**
```bash
npm install
```

**Instale as dependências das functions:**
```bash
cd functions
npm install
cd ..
```

## Passo 5: Faça o Deploy

Agora você está pronto para fazer o deploy. Use o token de autenticação do Firebase que você gerou anteriormente.

**Execute o seguinte comando:**
```bash
firebase deploy --token "SEU_FIREBASE_TOKEN_AQUI"
```

**Importante:** Substitua `"SEU_FIREBASE_TOKEN_AQUI"` pelo token que você obteve ao executar `firebase login:ci` na sua máquina local. Se o token expirou, execute `firebase login:ci` novamente para gerar um novo.

---

Após a conclusão deste comando, seus três sites (`home`, `app`, `admin`) e todas as suas Cloud Functions estarão no ar.
