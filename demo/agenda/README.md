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

## Continuidade verificada em 2026-11-16

Base confirmada no GitHub: `41dad9407acb`. A branch foi atualizada, sem modificar `main` e sem abrir PR, com commits separados:

- `00fbc810`: destino do atalho de teclado focável e lista associada ao resumo.
- `a3d41b88`: anúncio acessível da filtragem e proteção de eventos delegados.
- `c1bf908e`: ajustes em larguras pequenas, zoom e cores forçadas.
- `96789250`: mais quatro cenários de teste; suíte total de 17 casos.

Os arquivos remotos foram relidos após os commits. A execução efetiva dos testes Node.js e a revisão com leitor de tela/navegador permanecem pendentes de validação no ambiente apropriado; não confundir presença dos testes com aprovação. Na próxima conversa, partir do HEAD remoto vigente, não repetir estas alterações e priorizar verificação de navegador e fluxo com múltiplas abas.

## Continuidade — reforço de teclado e validação

A partir de `36a738dc` foram publicados, sem PR:

- `c6377adb`: foco estável após remoção de tarefas e limpeza explícita de validação depois da criação.
- `f660c79e`: proteção na recuperação contra IDs compostos só por espaços e registros-array.
- `b39ef11d`: testes de limites da descrição e proteção contra alteração de estado em erro.
- `efa1074f`: ajuste das entradas persistidas dos testes para JSON real, sem depender de propriedades não serializadas.

Foram mantidos os arquivos e testes anteriores. Os testes de Node e as interações de teclado em navegador real precisam ser executados antes de declarar cobertura aprovada. Não repetir estas correções em próximas conversas; conferir HEAD da branch antes de continuar.

## Navegação de tarefas e sincronização entre abas

- Botões Concluir/Reabrir e Excluir aceitam ↑/↓, Home e End para ir ao mesmo tipo de ação em outra tarefa visível; Tab e Shift+Tab mantêm o comportamento nativo. A ajuda está associada à lista para tecnologias assistivas.
- Eventos `storage` são processados apenas quando pertencem ao `localStorage` e atingem a chave da agenda; `localStorage.clear()` em outra aba também atualiza a lista. Leituras inválidas permanecem protegidas contra sobrescrita.
- A lógica de limites da navegação tem teste em Node. A interação real com teclado, leitores de tela e múltiplas abas ainda requer teste manual em navegador; não confundir com validação física concluída.
