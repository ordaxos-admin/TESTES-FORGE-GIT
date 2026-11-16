// Lógica independente do DOM, testável com Node.js sem dependências.
export const STORAGE_KEY = 'forge-agenda-tasks-v1';
export const MAX_TITLE_LENGTH = 160;

export function normalizeTitle(value) {
  if (typeof value !== 'string') throw new TypeError('A descrição deve ser texto.');
  const title = value.trim().replace(/\s+/g, ' ');
  // Controles de direção e caracteres de controle não são descrições válidas.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/u.test(title)) {
    throw new RangeError('A descrição contém caracteres de controle inválidos.');
  }
  // Preserva ZWJ em emoji legítimo, mas não aceita títulos só com caracteres invisíveis.
  if (!title.replace(/[\u200B-\u200D\u2060\uFEFF]/gu, '').trim() || title.length > MAX_TITLE_LENGTH) {
    throw new RangeError('A tarefa precisa ter entre 1 e 160 caracteres visíveis.');
  }
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

// Navegação por teclado mantém os limites da lista (sem salto inesperado).
export function keyboardTaskIndex(index, total, key) {
  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 0 || index >= total) return null;
  if (key === 'ArrowDown') return Math.min(index + 1, total - 1);
  if (key === 'ArrowUp') return Math.max(index - 1, 0);
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}
