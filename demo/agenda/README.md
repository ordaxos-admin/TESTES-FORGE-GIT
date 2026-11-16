# Agenda — teste de continuidade do Agente 2

Aplicativo de tarefas em HTML, CSS e JavaScript nativo, sem frameworks, serviços, build ou conta.

## Executar

Sirva o diretório do projeto em um servidor estático (por exemplo, `python -m http.server 8000` na raiz do repositório) e acesse `http://localhost:8000/demo/agenda/`. Módulos ES não devem ser abertos diretamente pelo protocolo `file://`.

## Testar

Com Node.js 18 ou superior: `node --test demo/agenda/store.test.mjs` na raiz do repositório. Testes cobrem criação, validação, conclusão/reabertura, exclusão, filtros, contagem, recuperação de dados e entradas inválidas.

## Comportamento e limites

- Tarefas persistem no `localStorage` deste navegador. Não há sincronização entre dispositivos.
- Em caso de dados salvos inválidos ou armazenamento indisponível, a interface avisa e evita sobrescrever conteúdo que não pôde ler.
- As tarefas são apresentadas por `textContent`, sem interpretar HTML fornecido pelo usuário.
- Nenhuma publicação nem PR foi solicitada; o trabalho permanece somente na branch `forge-git/agent-2-2b64f1cd`.

## Próxima conversa / continuidade

SSOT: este diretório e a branch `forge-git/agent-2-2b64f1cd`. Antes de editar, leia estes arquivos e o último commit remoto. Preserve os testes anteriores `demo/gpt-direto.txt` e `demo/continuidade.txt`, mantenha `main` intocada e não abra PR. Evolua com testes proporcionais, conferindo commit e conteúdo remoto após escrever. Não presuma trabalho em segundo plano.

## Acessibilidade e experiência mobile

- Atalho de teclado “Pular para tarefas”; botões com rótulos descritivos; estado de filtros e conclusão exposto por `aria-pressed`.
- Mensagens de alterações em região `role="status"` e foco restaurado após reconstrução da lista.
- Controles de toque com pelo menos 44 × 44 CSS px, adaptação para telas estreitas, foco visível e redução de movimento.
- Verificação manual recomendada: 320 px de largura, zoom 200%, navegação somente por Tab/Shift+Tab e leitor de tela. Nenhuma auditoria automatizada em navegador foi executada neste commit.

## Registro de evolução

2026-11-16: adicionada navegação acessível; preservação de foco e avisos; melhoria de toque/mobile; testes de validação e persistência ampliados. Commits independentes diretamente nesta branch, sem PR. Na próxima conversa, conferir o head remoto antes de editar e priorizar testes reais de navegador se houver ambiente disponível.
