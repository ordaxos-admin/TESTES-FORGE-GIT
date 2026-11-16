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
