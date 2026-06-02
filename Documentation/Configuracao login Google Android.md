# Configuração do login Google no Android

O código do aplicativo já usa o fluxo nativo do Android com Credential Manager.
Para habilitar o botão "Entrar com Google" no APK, conclua a configuração externa:

1. No Firebase Console, abra o projeto `plot-570f8`.
2. Em Authentication > Sign-in method, habilite o provedor Google.
3. Registre um aplicativo Android com o pacote `io.ionic.starter`.
4. Cadastre as impressões digitais do certificado debug:

```text
SHA-1:   32:F6:BA:1C:24:92:A1:7A:1A:03:12:FE:71:46:D7:70:0D:D2:BC:73
SHA-256: A4:4E:C4:13:B9:50:22:9C:D8:B1:41:17:95:76:14:1D:36:3F:BE:38:02:7B:F4:42:67:DF:27:93:CD:E9:BA:FC
```

5. No Google Cloud Console, localize ou crie uma credencial OAuth 2.0 do tipo
   "Aplicativo da Web" vinculada ao mesmo projeto.
6. Preencha o Client ID em:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

Campo:

```ts
googleWebClientId: "SEU_CLIENT_ID.apps.googleusercontent.com"
```

7. Gere novamente o APK e valide o login em um aparelho Android com Google Play
   Services.

## Ambiente de build

O plugin nativo exige Java 21. Antes de executar tarefas Gradle nesta máquina:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.11'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

Depois gere o APK:

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
