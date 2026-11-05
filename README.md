# KnowzyPI

## 📌 Descrição
Desenvolver um aplicativo de quizzes educacionais para auxiliar estudantes no aprendizado de diferentes matérias de forma prática e acessível.


## 🎯 Objetivo
Criar uma interface intuitiva aonde o usuário pode escolher quizzes separados por matérias, favoritar um quiz específico, exibir desempenho e conquistas do usuário.


## 🧩 Tecnologias Utilizadas
### Backend 
- Node.js
- Firebase

### Mobile
- React Native

## 🚀 Funcionalidades
Login/Cadastro
Lista das matérias disponíveis.
Sistema de quizzes.
Pontuação e desempenho.
Página de conquistas
Área onde o usuário poderá visualizar medalhas, níveis e conquistas desbloqueadas conforme seu desempenho nos quizzes e participação na plataforma.



## 📂 Estrutura do Projeto
- `backend/`: servidor Express, autenticação, controllers, models, rotas, páginas EJS, assets, testes e dados de fallback.
- `mobile/`: aplicativo Expo/React Native, telas, componentes, serviços HTTP, contexto de autenticação e assets.
- `docs/README-pitch-original.md`: cópia preservada do README anterior, incluindo o texto original do pitch e integrantes.

## ▶️ Como Executar

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

## 👥 Integrantes
- Amanda Xavier de Almeida Costa
- Davi Eduardo Dutra de Carvalho
- Gabriel de Carvalho Soares
- Heloisa Ferreira Gomes 
- Maria Heloisa Rodrigues
- Nicolly Freitas Bizerra

## 🎤 Pitch
O Knowzy é um aplicativo desenvolvido para facilitar o aprendizado dos estudantes por meio de quizzes interativos. A plataforma permite criar uma conta, escolher matérias, responder perguntas com tempo determinado e acompanhar o desempenho. Também conta com perfil, histórico e favoritos, além de futuras funcionalidades, como conquistas, rankings e estatísticas. Desenvolvido com React Native, Node.js e Firebase, o objetivo do Knowzy é tornar os estudos mais práticos, dinâmicos e eficientes.

## 📎 Links Importantes
knowzypi.onrender.com
https://github.com/heloasis/KnowzyPI.git 
https://youtu.be/yxxp8rGxZ64?si=qJJBJ1Pbi_t5Z-rc

