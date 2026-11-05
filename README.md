# KnowzyPI — Web + Mobile

Projeto de estudos com backend Node.js/Express/EJS, banco Firebase Realtime Database opcional no preview e aplicativo React Native com Expo Router.

## Estrutura

- `backend/`: servidor Express, autenticação, controllers, models, rotas, páginas EJS, assets, testes e dados de fallback.
- `mobile/`: aplicativo Expo/React Native, telas, componentes, serviços HTTP, contexto de autenticação e assets.
- `docs/README-pitch-original.md`: cópia preservada do README anterior, incluindo o texto original do pitch e integrantes.

## Requisitos

- Node.js 20 ou superior.
- npm.
- Expo Go ou emulador para testar o aplicativo mobile.

## 1. Iniciar o backend

```bash
cd backend
npm install
```

Copie `backend/.env.example` para `backend/.env` e ajuste, no mínimo, `SESSION_SECRET` e `AUTH_TOKEN_SECRET` para valores aleatórios e privados. Para o preview local, o Firebase pode ficar sem credenciais: o servidor inicia em modo local e permite criar contas de teste. Essas contas ficam em `backend/.local-preview-users.json`, arquivo ignorado pelo Git.

Inicie:

```bash
npm start
```

O servidor utiliza `PORT` do ambiente ou `3000` localmente.

### Deploy no Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Configure as variáveis de ambiente listadas em `backend/.env.example` no painel do Render. Não envie `.env` ou chaves para o GitHub.

## 2. Firebase original

A URL original foi preservada: `https://knowzypi-default-rtdb.firebaseio.com`.

O backend inicializa o Firebase Admin somente quando `FIREBASE_SERVICE_ACCOUNT` estiver configurada. A conta de serviço privada que estava no arquivo enviado não foi incluída neste ZIP, para evitar distribuir uma chave secreta. Nenhum dado remoto foi apagado, alterado, migrado ou sobrescrito durante o trabalho.

A responsável pelo Firebase deve:

1. Criar/guardar a conta de serviço em local seguro.
2. Configurar `FIREBASE_SERVICE_ACCOUNT` como JSON em variável protegida no ambiente do backend.
3. Manter `FIREBASE_DATABASE_URL=https://knowzypi-default-rtdb.firebaseio.com`.
4. Confirmar as regras de segurança e testar leitura/gravação no projeto original.

Sem credenciais, o backend usa fallback local de preview. Esse modo não sincroniza com o Firebase e não compartilha dados entre instalações/servidores diferentes.

## 3. Iniciar o aplicativo mobile

```bash
cd mobile
npm install
```

Copie `mobile/.env.example` para `mobile/.env`. Configure `EXPO_PUBLIC_API_URL` para o endereço acessível do backend:

- Emulador Android: normalmente `http://10.0.2.2:3000`.
- Celular físico: `http://IP-DO-COMPUTADOR-NA-REDE:3000`, com os dois dispositivos na mesma rede.
- Produção: URL HTTPS pública do backend.

Inicie o Expo:

```bash
npx expo start
```

O aplicativo guarda sessão e resultados pendentes localmente com AsyncStorage. A API utiliza token Bearer assinado pelo backend; `AUTH_TOKEN_SECRET` deve ser forte e privado em produção.

## 4. Matérias e Quizzes

- **Matérias** é a área de aprendizagem: explicações, exemplos e tópicos para Português, Matemática, História, Geografia e Biologia. O progresso de leitura e os favoritos são salvos localmente por conta no navegador ou no aparelho.
- **Quizzes** é a área de atividades de perguntas e respostas. As páginas EJS e os bancos de questões existentes foram preservados. Quando o Firebase não está configurado, o preview utiliza as perguntas de fallback que já existiam nas cinco páginas originais.

Os conteúdos didáticos novos ficam em `backend/src/data/conteudosEstudo.json`; uma cópia para fallback mobile fica em `mobile/src/data/conteudosEstudo.json`.

## 5. Sistema de XP

- Cada resposta correta vale 5 XP.
- Resposta incorreta vale 0 XP.
- A pontuação é deduplicada por usuário, matéria e ID da questão.
- A finalização do mesmo conjunto de questões não aumenta o XP nem a contagem de quizzes novamente.
- No Firebase, a atualização é feita em transação no registro do usuário.
- No preview sem Firebase, o perfil de teste e o XP são guardados em `.local-preview-users.json`.
- O navegador e o mobile mantêm filas de resultados pendentes para tentar sincronizar quando a API voltar.

A fonte autoritativa do XP compartilhado entre dispositivos é o backend com Firebase conectado. O modo local é destinado a desenvolvimento/preview.

## 6. Tutor IA

O Tutor IA está sendo preparado para um lançamento futuro. As telas do site e do aplicativo informam que a funcionalidade chegará em breve; o serviço de perguntas ainda não está disponível.

## 7. Testes

Backend:

```bash
cd backend
npm test
```

Mobile:

```bash
cd mobile
npx tsc --noEmit
```

O relatório `RELATORIO_FINAL.md` descreve os testes executados e as integrações que ainda dependem de credenciais externas.
