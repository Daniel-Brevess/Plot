# Configuracao do login Google no Android

O codigo do aplicativo usa o fluxo nativo do Android com o plugin
`@capawesome/capacitor-google-sign-in` e troca o ID token por uma credencial do
Firebase Authentication.

## Estado atual

- Projeto Firebase: `plot-570f8`
- Pacote Android: `io.ionic.starter`
- Firebase Android App ID: `1:955297535767:android:f3d8ba8573a6c8b8104952`
- Firebase Web App ID: `1:955297535767:web:ea2605c9bc83b410104952`
- Web Client ID OAuth: `955297535767-s0kvm6n72q46i7kdif4ecl8gn1tfmol7.apps.googleusercontent.com`
- Android Client ID OAuth: `955297535767-4kfq8f9kd3n568s64a92q9rcqfvcnu2u.apps.googleusercontent.com`
- Arquivo Android do Firebase: `android/app/google-services.json`

## Impressao digital cadastrada

```text
SHA-1:   32:F6:BA:1C:24:92:A1:7A:1A:03:12:FE:71:46:D7:70:0D:D2:BC:73
SHA-256: A4:4E:C4:13:B9:50:22:9C:D8:B1:41:17:95:76:14:1D:36:3F:BE:38:02:7B:F4:42:67:DF:27:93:CD:E9:BA:FC
```

O novo `google-services.json` baixado apos o cadastro do SHA-1 inclui um OAuth
client Android (`client_type: 1`) com o hash:

```text
32f6ba1c2492a17a1a0312fe7146d7700dd2bc73
```

## Arquivos configurados

O Web Client ID foi preenchido em:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

Campo:

```ts
googleWebClientId: "955297535767-s0kvm6n72q46i7kdif4ecl8gn1tfmol7.apps.googleusercontent.com"
```

## Proxima validacao

Gerar o APK e testar o botao "Entrar com Google" em um aparelho Android com
Google Play Services.

## Ambiente de build

O plugin nativo exige Java 21. Antes de executar tarefas Gradle nesta maquina:

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
