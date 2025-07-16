# Guia para Configurar seu Domínio Personalizado no Firebase

Siga estes passos para conectar `dnxtai.com`, `app.dnxtai.com` e `admin.dnxtai.com` ao seu projeto Firebase.

## Passo 1: Configurar o Domínio Principal (`dnxtai.com`)

1.  **Acesse o Firebase Hosting:**
    *   Abra o link: [https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites](https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites)

2.  **Selecione o Site Correto:**
    *   Na lista de sites, encontre o site com o ID **`dnxtai`**. Clique nele.

3.  **Adicione o Domínio:**
    *   Clique no botão **"Adicionar domínio personalizado"**.
    *   No campo que aparecer, digite: `dnxtai.com`
    *   Marque a opção "Redirecionar dnxtai.com para www.dnxtai.com" se desejar. Recomendo **NÃO** marcar por enquanto para manter o domínio raiz.
    *   Clique em "Continuar".

4.  **Verifique a Propriedade do Domínio:**
    *   O Firebase irá gerar um **Registro TXT**. Será algo parecido com `google-site-verification=...`.
    *   Vá até o painel de controle do seu provedor de domínio (onde você comprou `dnxtai.com`).
    *   Na seção de gerenciamento de DNS, crie um novo registro do tipo **TXT**.
    *   Copie o valor fornecido pelo Firebase e cole no campo de valor do registro TXT.
    *   Salve o registro no seu provedor de domínio. Pode levar alguns minutos (ou até horas) para que essa alteração se propague pela internet.
    *   Volte ao console do Firebase e clique em **"Verificar"**.

5.  **Configure os Registros A (Conectar o Site):**
    *   Após a verificação ser bem-sucedida, o Firebase mostrará uma lista de endereços de IP (geralmente dois).
    *   No seu provedor de domínio, crie **dois registros do tipo A** para o domínio `dnxtai.com`.
    *   Para cada registro, cole um dos endereços de IP fornecidos pelo Firebase.
    *   Salve as alterações.

## Passo 2: Configurar o Subdomínio do App (`app.dnxtai.com`)

1.  **Volte para a Lista de Sites:**
    *   Use este link: [https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites](https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites)

2.  **Selecione o Site do App:**
    *   Encontre o site com o ID **`app-nxt-ai-2025-prod`** e clique nele.

3.  **Adicione o Subdomínio:**
    *   Clique em **"Adicionar domínio personalizado"**.
    *   Digite: `app.dnxtai.com`
    *   Siga o mesmo processo de verificação (adicionando um registro TXT, se solicitado) e configuração dos **registros A** que o Firebase fornecer.

## Passo 3: Configurar o Subdomínio de Admin (`admin.dnxtai.com`)

1.  **Volte para a Lista de Sites:**
    *   Use este link: [https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites](https://console.firebase.google.com/project/nxt-ai-2025-prod/hosting/sites)

2.  **Selecione o Site de Admin:**
    *   Encontre o site com o ID **`admin-nxt-ai-2025-prod`** e clique nele.

3.  **Adicione o Subdomínio:**
    *   Clique em **"Adicionar domínio personalizado"**.
    *   Digite: `admin.dnxtai.com`
    *   Siga o mesmo processo de verificação e configuração dos **registros A**.

## Finalização

*   **Aguarde a Propagação:** As alterações de DNS podem levar de alguns minutos a 48 horas para se propagarem completamente pela internet.
*   **Status no Firebase:** O console do Firebase mostrará o status "Pendente" e mudará para "Conectado" quando tudo estiver pronto. O Firebase também provisionará automaticamente um certificado SSL para cada domínio.

Depois de seguir estes passos, seu sistema estará totalmente configurado para usar seu domínio personalizado.
