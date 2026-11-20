# Controle de Não Conformidades

App web instalável para celular e desktop, baseado no painel HTML existente.

## Aplicativo Android

Baixe o [código-fonte Android](./Controle-NC-Android-Source-v1.0.zip). Após extrair o arquivo, o projeto fica na pasta `android-app`; as instruções de build e privacidade estão em `android-app/README.md`. O APK funciona sem CDN: Excel, OCR em português/inglês e compartilhamento de arquivos estão empacotados no app.

O APK de distribuição está em [Releases do GitHub](https://github.com/gamebral26-stack/controle-nao-conformidades/releases). O keystore de assinatura é local e nunca deve ser enviado ao repositório.

## Dados e privacidade

- Lançamentos, produção, cadastros e exclusões ficam no armazenamento local do navegador.
- A pasta do app não contém a base histórica. O backup inicial é separado e deve ser importado uma vez.
- No primeiro uso, toque em **Restaurar base inicial** e selecione o arquivo privado `base-inicial.json`.
- A foto é processada pelo OCR no aparelho; a primeira utilização do OCR precisa carregar o mecanismo pela internet.
- O botão de backup compartilha ou baixa um arquivo JSON. No celular, escolha o Google Drive no menu de compartilhamento.
- A versão HTML exportada é um snapshot portátil. Para devolver alterações, exporte um backup JSON e importe/mescle no outro aparelho.
- Conflitos e exclusões são mostrados para revisão; o app não substitui ou remove registros silenciosamente.
- No PC, abra o HTML exportado sem instalar nada. Ele mantém alterações localmente; para transferi-las ao celular, exporte um backup JSON no PC e restaure/mescle no celular.

## Teste local

Na pasta do app:

```powershell
python -m http.server 8766 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8766/` no navegador do computador.

## Instalação no celular

Para instalar como app, publique somente os arquivos desta pasta em um endereço HTTPS. Não publique o arquivo de backup inicial. Depois:

- Android: abra o endereço no Chrome e escolha **Instalar app** ou **Adicionar à tela inicial**.
- iPhone: abra o endereço no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

Os dados não são enviados ao servidor da aplicação. Celular e computador mantêm bases locais independentes e trocam alterações por arquivos de backup.

### Publicar no GitHub Pages

1. Envie somente os arquivos do app web para a raiz do repositório público. O diretório `android-app` contém o projeto nativo e não altera a publicação do Pages na raiz.
2. No repositório, abra **Settings > Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main` e pasta `/(root)`.
4. Quando o GitHub mostrar o endereço HTTPS, abra-o no celular para instalar.

O código do app ficará público, mas os arquivos do ZIP não contêm os registros. Nunca envie para o repositório `base-inicial.json` nem `Sistema_NC_Portatil.html`, pois eles contêm os dados da empresa.
