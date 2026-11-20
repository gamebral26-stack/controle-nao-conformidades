# Controle de Não Conformidades

App web instalável para celular e desktop, baseado no painel HTML existente.

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

1. Crie um repositório público novo e envie para a raiz os arquivos do ZIP do app.
2. No repositório, abra **Settings > Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main` e pasta `/(root)`.
4. Quando o GitHub mostrar o endereço HTTPS, abra-o no celular para instalar.

O código do app ficará público, mas os arquivos do ZIP não contêm os registros. Nunca envie para o repositório `base-inicial.json` nem `Sistema_NC_Portatil.html`, pois eles contêm os dados da empresa.
