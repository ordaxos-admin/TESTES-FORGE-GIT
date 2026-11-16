import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, MAX_TITLE_LENGTH, normalizeTitle, addTask, toggleTask, removeTask, filterTasks, parseTasks, countTasks } from './store.mjs';

test('chave de armazenamento versionada', () => assert.equal(STORAGE_KEY, 'forge-agenda-tasks-v1'));
test('adiciona descrição normalizada sem mutar lista original', () => {
  const original = [];
  const result = addTask(original, '  Comprar   pão  ', 't1');
  assert.deepEqual(result, [{ id: 't1', title: 'Comprar pão', done: false }]);
  assert.deepEqual(original, []);
});
test('rejeita título vazio, longo ou não textual', () => {
  for (const title of ['', '  ', 'x'.repeat(MAX_TITLE_LENGTH + 1), null]) {
    assert.throws(() => normalizeTitle(title));
  }
  assert.equal(normalizeTitle('x'.repeat(MAX_TITLE_LENGTH)).length, MAX_TITLE_LENGTH);
});
test('identificadores devem ser únicos', () => {
  const tasks = addTask([], 'Primeira', 'id-1');
  assert.throws(() => addTask(tasks, 'Outra', 'id-1'));
});
test('concluir e reabrir tarefa preserva demais', () => {
  const original = addTask(addTask([], 'Uma', '1'), 'Duas', '2');
  const changed = toggleTask(original, '1');
  assert.equal(changed.find(t => t.id === '1').done, true);
  assert.equal(changed.find(t => t.id === '2').done, false);
  assert.equal(original.find(t => t.id === '1').done, false);
  assert.equal(toggleTask(changed, '1').find(t => t.id === '1').done, false);
});
test('excluir não remove outras tarefas', () => {
  const tasks = addTask(addTask([], 'A', '1'), 'B', '2');
  assert.deepEqual(removeTask(tasks, '1').map(t => t.id), ['2']);
});
test('filtros e contadores são consistentes', () => {
  const tasks = toggleTask(addTask(addTask([], 'A', '1'), 'B', '2'), '1');
  assert.equal(filterTasks(tasks, 'all').length, 2);
  assert.deepEqual(filterTasks(tasks, 'active').map(t => t.id), ['2']);
  assert.deepEqual(filterTasks(tasks, 'done').map(t => t.id), ['1']);
  assert.deepEqual(countTasks(tasks), { total: 2, done: 1, active: 1 });
});
test('leitura e persistência JSON mantêm os dados', () => {
  const tasks = addTask([], 'Ler', 'a');
  assert.deepEqual(parseTasks(JSON.stringify(tasks)), tasks);
  assert.deepEqual(parseTasks(null), []);
});
test('dados inválidos não são aceitos silenciosamente', () => {
  for (const value of ['{}', '[{}]', '[{"id":"x","title":"Oi","done":"sim"}]', '[{"id":"x","title":"a","done":false},{"id":"x","title":"b","done":false}]', 'não é json']) {
    assert.throws(() => parseTasks(value));
  }
});

test('entrada com HTML é tratada como texto e preservada no armazenamento', () => {
  const title = '<img src=x onerror=alert(1)>';
  const tasks = addTask([], title, 'html');
  assert.equal(tasks[0].title, title);
  assert.deepEqual(parseTasks(JSON.stringify(tasks)), tasks);
});
test('títulos somente com espaços Unicode não criam tarefas', () => {
  assert.throws(() => addTask([], '\u2003\n\t', 'empty'));
});
test('alternância e exclusão de ID desconhecido não alteram tarefas', () => {
  const tasks = addTask([], 'Revisar', '1');
  assert.deepEqual(toggleTask(tasks, 'desconhecido'), tasks);
  assert.deepEqual(removeTask(tasks, 'desconhecido'), tasks);
});
test('persistência rejeita IDs repetidos, título maior que limite e formato inválido', () => {
  const invalid = [
    [{ id: 'a', title: 'x'.repeat(MAX_TITLE_LENGTH + 1), done: false }],
    [{ id: 'a', title: 'ok', done: false }, { id: 'a', title: 'outro', done: true }],
    [{ id: 'a', title: 123, done: false }],
    [{ id: 'a', title: 'ok', done: null }],
  ];
  for (const value of invalid) assert.throws(() => parseTasks(JSON.stringify(value)));
});

test('normaliza quebras de linha, tabulações e espaços sem alterar Unicode válido', () => {
  assert.equal(normalizeTitle('  Café\n\tcom   pão  '), 'Café com pão');
  assert.equal(normalizeTitle('🗓️ Lembrete'), '🗓️ Lembrete');
});
test('filtragem desconhecida preserva as tarefas e a ordem original', () => {
  const tasks = addTask(addTask([], 'A', 'a'), 'B', 'b');
  assert.strictEqual(filterTasks(tasks, 'unrecognized'), tasks);
  assert.deepEqual(filterTasks(tasks, 'all').map(task => task.id), ['b', 'a']);
});
test('restauração não altera o array original nem aceita título vazio após normalização', () => {
  const input = [{ id: 'one', title: '  Fazer   algo ', done: true }];
  assert.deepEqual(parseTasks(JSON.stringify(input)), [{ id: 'one', title: 'Fazer algo', done: true }]);
  assert.equal(input[0].title, '  Fazer   algo ');
  assert.throws(() => parseTasks(JSON.stringify([{ id: 'a', title: '\u2003', done: false }])));
});
test('filtros e ações não mutam registros e suportam lista vazia', () => {
  assert.deepEqual(countTasks([]), { total: 0, done: 0, active: 0 });
  assert.deepEqual(filterTasks([], 'done'), []);
  const tasks = addTask([], 'Exemplo', 'id');
  assert.notStrictEqual(toggleTask(tasks, 'id'), tasks);
  assert.equal(tasks[0].done, false);
  assert.deepEqual(removeTask(tasks, 'id'), []);
  assert.equal(tasks.length, 1);
});

test('recusa IDs vazios e registros do tipo array na recuperação', () => {
  const records = [
    [{ id: '  ', title: 'Teste', done: false }],
    [Object.assign([], { id: 'ok', title: 'Teste', done: false })],
  ];
  for (const value of records) assert.throws(() => parseTasks(JSON.stringify(value)));
});
test('adicionar tarefa inválida preserva o estado anterior', () => {
  const tasks = addTask([], 'Existente', 'original');
  assert.throws(() => addTask(tasks, '   ', 'nova'));
  assert.throws(() => addTask(tasks, 'Outra', 'original'));
  assert.deepEqual(tasks, [{ id: 'original', title: 'Existente', done: false }]);
});
test('título no limite de comprimento e espaços Unicode', () => {
  assert.equal(addTask([], 'x'.repeat(MAX_TITLE_LENGTH), 'limite')[0].title.length, MAX_TITLE_LENGTH);
  assert.equal(normalizeTitle('  tarefa\u2003importante  '), 'tarefa importante');
});
