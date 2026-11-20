# Controle NC para Android

Este projeto empacota a interface web do app em um APK Android usando Capacitor. A interface e os dados permanecem no dispositivo; não há sincronização automática.

## Privacidade

- Os dados ficam no espaço privado do app Android, protegido pelo isolamento do sistema e pela criptografia do aparelho.
- O backup automático e a transferência de dados do Android estão desativados para este app.
- O backup JSON manual não é criptografado. Trate-o como dado corporativo e salve-o somente em um Drive privado.
- Desinstalar o app ou trocar de aparelho apaga os dados locais; exporte um backup antes.
- O código público não deve conter a base histórica, planilhas de produção, cópias HTML com registros nem a chave de assinatura.
- Excel, OCR, modelos de português/inglês e compartilhamento de arquivos estão empacotados no APK; o uso desses recursos não depende de CDN.

## Desenvolvimento

Requisitos: Node.js, JDK 21 e Android SDK (platform 36).

```powershell
npm install
npm run android:debug
```

O APK de depuração é gerado em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Assinatura de versão

O keystore permanente fica fora do repositório em `%LOCALAPPDATA%\AndroidToolchain\controle-nc-release.p12`. A senha é guardada em arquivo criptografado pelo Windows DPAPI para o usuário local.

```powershell
npm run android:release
```

O comando gera e verifica `dist/Controle-NC-v1.0.apk`. Mantenha uma cópia segura do keystore: sem a mesma chave, o Android não aceitará uma atualização por cima do app instalado. Nunca publique o keystore, a senha DPAPI ou backups com dados.
