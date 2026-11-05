# Relatório de atualização — KnowzyPI Web + Mobile

## Resumo

A atualização foi aplicada sobre a estrutura recebida, sem recriar o produto do zero. As páginas, identidade visual, mascotes, imagens, assets, páginas de quiz e perguntas de fallback originais foram mantidos. Foram adicionadas áreas de estudo, correções de XP, autenticação por token para o mobile e a estrutura do Tutor IA.

## Arquivos novos

### Backend
- `backend/.env.example`
- `backend/src/controllers/tutorController.js`
- `backend/src/data/conteudosEstudo.json`
- `backend/src/data/quizFallback.json` — extraído das perguntas de fallback que já estavam nas cinco páginas EJS originais.
- `backend/src/services/answerNormalizer.js`
- `backend/src/services/xpService.js`
- `backend/src/utils/authToken.js`
- `backend/views/estudo.ejs`
- `backend/views/tutor.ejs`
- `backend/test/answerNormalizer.test.js`
- `backend/test/previewIntegration.test.js`
- `backend/test/xpService.test.js`

### Mobile
- `mobile/.env.example`
- `mobile/app/estudo/[materia].tsx`
- `mobile/app/tutor-ia.tsx`
- `mobile/src/data/conteudosEstudo.json`
- `mobile/src/data/quizFallback.json`

### Documentação
- `docs/README-pitch-original.md` — cópia preservada do README anterior e do pitch original.

## Arquivos modificados

### Backend
- `backend/server.js`
- `backend/package.json`
- `backend/src/config/firebase.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/homeController.js`
- `backend/src/controllers/materiasController.js`
- `backend/src/controllers/quizController.js`
- `backend/src/middlewares/authMiddleware.js`
- `backend/src/models/materias.js`
- `backend/src/models/perguntas.js`
- `backend/src/models/user.js`
- `backend/views/home.ejs`
- `backend/views/materias.ejs`
- `backend/views/favoritos.ejs`
- `backend/views/perfil.ejs`
- `backend/views/favoritos.ejs`
- `backend/public/conquistas/script.js`
- `backend/public/perfil/index.html`
- `backend/public/perfil/script.js`
- `backend/views/portugues.ejs`
- `backend/views/matematica.ejs`
- `backend/views/historia.ejs`
- `backend/views/geografia.ejs`
- `backend/views/biologia.ejs`
- `backend/public/conquistas/script.js`
- `backend/public/perfil/index.html`
- `backend/public/perfil/script.js`
- Testes antigos que dependiam de uma conta fictícia pré-cadastrada: `test/authProtection.test.js`, `test/userAuth.test.js`, `test/userModel.test.js`.
- `.gitignore` e `backend/.gitignore`.

### Mobile
- `mobile/app/_layout.tsx`
- `mobile/app/home.tsx`
- `mobile/app/materias.tsx`
- `mobile/app/favoritos.tsx`
- `mobile/app/favoritos.tsx`
- `mobile/app/quiz.tsx`
- `mobile/app/conquistas.tsx`
- `mobile/src/api/api.ts`
- `mobile/src/context/AuthContext.tsx`
- `mobile/src/services/authService.ts`
- `mobile/src/services/materiaService.ts`
- `mobile/src/types/auth.ts`
- `mobile/src/types/quiz.ts`

## Correções e implementações

1. **Matérias e Quizzes separados:** `/materias` abre tópicos de estudo; `/quiz` lista as atividades. A página de estudo tem explicações, exemplos e marcação local de tópico estudado.
2. **Conteúdo de estudo:** foram incluídos 22 tópicos didáticos distribuídos entre Português, Matemática, História, Geografia e Biologia. O conteúdo é material introdutório de apoio escolar, não uma substituição do currículo da escola.
3. **Perguntas preservadas:** as questões fallback foram copiadas diretamente das cinco páginas EJS existentes para um módulo comum usado pelo preview e pelo mobile. Não foram inventadas questões para substituir o banco original.
4. **Normalização de respostas:** o backend aceita `respostaCorreta` e `resposta_correta`, além de gabarito por índice, letra ou texto da alternativa.
5. **XP centralizado:** a regra pura em `xpService.js` atribui 5 XP por questão correta, 0 por incorreta e deduplica por usuário/matéria/ID da questão. A finalização do mesmo conjunto de questões não duplica a contagem de quizzes.
6. **Firebase:** o Admin só inicializa quando as credenciais estão configuradas. Sem credenciais, o preview continua disponível com armazenamento local de contas de teste. Quando conectado, o XP usa transação no Realtime Database. A URL original foi mantida.
7. **Autenticação mobile:** login/cadastro retornam token assinado pelo backend; o mobile guarda token e usuário com AsyncStorage e envia Bearer token nas chamadas.
8. **Fila de sincronização:** o navegador e o mobile mantêm resultados pendentes quando a API não responde e tentam reenviar em uma finalização posterior. A deduplicação no backend protege contra reenvios.
9. **Home mobile:** foi atualizada com saudação, XP, nível, progresso e atalhos para Matérias, Quizzes, Conquistas, Favoritos, Tutor IA e Perfil.
10. **Dados locais por conta:** XP pendente, histórico de quizzes, perfil e favoritos no navegador usam chaves separadas por ID de usuário; o mobile também separa favoritos e filas por conta. Foram removidos os perfis de demonstração fixos e a lista de favoritos fictícia da tela mobile.
11. **Tutor IA:** telas WEB e MOBILE e controller backend criados. O controller usa configuração por variáveis de ambiente e retorna HTTP 503 quando a chave ainda não existe; não simula respostas.
12. **Perfil e Home WEB:** XP/nivel são exibidos a partir dos dados de sessão; a página de perfil deixou de exibir o valor fixo de 780 XP.

## Arquivos preservados

- As imagens, mascotes, ícones e assets existentes.
- As cinco páginas EJS de quizzes e seus layouts originais.
- A estrutura MVC original (`controllers`, `models`, `routes`, `views`, `public`, `config`).
- A estrutura Expo Router e os componentes mobile existentes.
- Os arquivos de dependências e lockfiles originais.
- 71 arquivos originais foram mantidos sem alteração, além dos arquivos originais modificados listados acima.

## Testes executados

**30/30 testes backend aprovados**

- `node --test`: 30 testes aprovados, 0 falhas na última execução completa.
- Testes de XP: 5 XP por questão correta, 0 por incorreta, reenvio idempotente, XP unificado entre matérias, IDs repetidos em matérias diferentes e persistência do estado serializado.
- Teste HTTP de integração no preview sem Firebase: cadastro, token, lista das cinco matérias, conteúdos de estudo, carregamento de quiz, finalização, questão errada sem XP, repetição sem duplicidade, XP entre Biologia e Matemática e leitura do perfil após atualização.
- Teste do Tutor IA sem chave: retorna mensagem de configuração pendente (503), sem derrubar o backend.
- Compilação EJS: 15 templates compilados sem erro; as cinco páginas de quiz foram renderizadas no teste HTTP com a chave de armazenamento do usuário autenticado.
- TypeScript mobile: `node node_modules/typescript/bin/tsc --noEmit` terminou sem erros.

## Limitações e validações pendentes

1. **Firebase real não foi conectado nem testado**, porque as credenciais privadas não foram fornecidas e o banco pertence à responsável indicada. O código não alterou dados, regras, URL ou estrutura remota. A responsável ainda precisa configurar as variáveis e validar a leitura/gravação no Firebase original.
2. **Tutor IA não respondeu a uma chamada real**, pois não havia chave de provedor. A interface, rota, tratamento de ausência de chave e configuração por ambiente foram testados.
3. **Expo export web:** a execução de `expo export --platform web` excedeu o limite de tempo do ambiente. A verificação estática TypeScript passou, mas o build completo do bundle Expo e teste em aparelho/emulador não foram concluídos aqui.
4. **Teste visual em dispositivos físicos:** não foi possível validar cortes e responsividade em vários modelos de celular neste ambiente.
5. **Conquistas e favoritos:** a lógica e páginas originais foram preservadas, mas a sincronização remota de todos os dados depende da validação Firebase. A marcação de tópicos estudados é local por navegador/aparelho nesta entrega.
6. **XP em preview local:** o arquivo `.local-preview-users.json` é local ao backend e ignorado pelo Git. Não deve ser usado como armazenamento compartilhado em produção; para compartilhar XP entre WEB e MOBILE, configure o Firebase original.

## Segurança e conteúdo do ZIP

- A conta de serviço privada (`firebaseServiceAccount.json`) que constava no arquivo recebido foi omitida do ZIP final. O projeto usa `.env.example` e variáveis protegidas.
- Nenhum arquivo `.env` real, senha ou chave de API foi incluído.
- `node_modules` foi excluído do ZIP para reduzir o tamanho e evitar distribuir dependências instaladas. Instale as dependências com `npm install` em cada pasta.
- Os arquivos vazios acidentais `backend/node`, `mobile/npx` e `npx` foram removidos.
