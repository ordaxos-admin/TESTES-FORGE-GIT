// Lógica independente do DOM, testável com Node.js sem dependências.
export const STORAGE_KEY = 'forge-agenda-tasks-v1';
export const MAX_TITLE_LENGTH = 160;

export function normalizeTitle(value) {
  if (typeof value !== 'string') throw new TypeError('A descrição deve ser texto.');
  const title = value.trim().replace(/\s+/g, ' ');
  if (!title || title.length > MAX_TITLE_LENGTH) throw new RangeError('A tarefa precisa ter entre 1 e 160 caracteres.');
  return title;
}

export function addTask(tasks, title, id) {
  const normalized = normalizeTitle(title);
  if (typeof id !== 'string' || !id.trim() || tasks.some(task => task.id === id)) throw new Error('Identificador inválido ou repetido.');
  return [{ id, title: normalized, done: false }, ...tasks];
}

export function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
}

export function removeTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}

export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter(task => !task.done);
  if (filter === 'done') return tasks.filter(task => task.done);
  return tasks;
}

export function parseTasks(raw) {
  if (raw == null) return [];
  const decoded = JSON.parse(raw);
  if (!Array.isArray(decoded)) throw new Error('Formato de tarefas inválido.');
  const ids = new Set();
  return decoded.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id) || typeof item.done !== 'boolean') {
      throw new Error('Dados de tarefa inválidos.');
    }
    const title = normalizeTitle(item.title);
    ids.add(item.id);
    return { id: item.id, title, done: item.done };
  });
}

export function countTasks(tasks) {
  const done = tasks.filter(task => task.done).length;
  return { total: tasks.length, done, active: tasks.length - done };
}
