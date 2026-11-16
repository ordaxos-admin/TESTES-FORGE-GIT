import { STORAGE_KEY, addTask, toggleTask, removeTask, filterTasks, parseTasks, countTasks, keyboardTaskIndex } from './store.mjs';

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const list = document.querySelector('#task-list');
const empty = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyDetail = document.querySelector('#empty-detail');
const summary = document.querySelector('#summary');
const actionStatus = document.querySelector('#action-status');
const warning = document.querySelector('#storage-warning');
const filters = [...document.querySelectorAll('[data-filter]')];

let tasks = [];
let currentFilter = 'all';
let canPersist = true;

try {
  tasks = parseTasks(localStorage.getItem(STORAGE_KEY));
} catch (error) {
  // Nunca sobrescrever dados existentes caso a leitura ou o formato falhe.
  canPersist = false;
  warning.hidden = false;
  warning.textContent = 'Não foi possível ler os dados salvos. As alterações desta sessão não serão gravadas para preservar os dados existentes.';
}

function persist() {
  if (!canPersist) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    canPersist = false;
    warning.hidden = false;
    warning.textContent = 'Armazenamento indisponível. As alterações funcionarão nesta aba, mas não serão salvas.';
  }
}

function render() {
  const totals = countTasks(tasks);
  summary.textContent = `${totals.active} pendente${totals.active === 1 ? '' : 's'} · ${totals.done} concluída${totals.done === 1 ? '' : 's'}`;
  const visible = filterTasks(tasks, currentFilter);
  list.replaceChildren();

  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' completed' : '');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle';
    toggle.dataset.action = 'toggle';
    toggle.dataset.id = task.id;
    toggle.setAttribute('aria-label', task.done ? `Reabrir tarefa: ${task.title}` : `Concluir tarefa: ${task.title}`);
    toggle.setAttribute('aria-pressed', String(task.done));
    toggle.textContent = task.done ? '✓' : '';
    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.title;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.dataset.action = 'delete';
    del.dataset.id = task.id;
    del.setAttribute('aria-label', `Excluir tarefa: ${task.title}`);
    del.textContent = 'Excluir';
    item.append(toggle, label, del);
    list.append(item);
  });

  empty.hidden = visible.length !== 0;
  if (currentFilter === 'active') {
    emptyTitle.textContent = 'Nenhuma tarefa pendente';
    emptyDetail.textContent = 'Tudo feito por enquanto.';
  } else if (currentFilter === 'done') {
    emptyTitle.textContent = 'Nenhuma tarefa concluída';
    emptyDetail.textContent = 'Conclua uma tarefa para encontrá-la aqui.';
  } else {
    emptyTitle.textContent = 'Tudo em ordem';
    emptyDetail.textContent = 'Adicione sua primeira tarefa para começar.';
  }

  filters.forEach(button => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    const updated = addTask(tasks, titleInput.value, crypto.randomUUID());
    tasks = updated;
    titleInput.setCustomValidity('');
    titleInput.value = '';
    currentFilter = 'all';
    persist();
    render();
    actionStatus.textContent = 'Tarefa adicionada.';
    titleInput.focus();
  } catch (error) {
    titleInput.setCustomValidity(error.message);
    titleInput.reportValidity();
  }
});
titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));

list.addEventListener('click', event => {
  const button = event.target instanceof Element ? event.target.closest('button[data-action]') : null;
  if (!button || !list.contains(button)) return;
  const { action, id } = button.dataset;
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const previousIndex = filterTasks(tasks, currentFilter).findIndex(item => item.id === id);
  if (action === 'toggle') tasks = toggleTask(tasks, id);
  else if (action === 'delete') tasks = removeTask(tasks, id);
  else return;
  persist();
  render();
  actionStatus.textContent = action === 'delete'
    ? `Tarefa excluída: ${task.title}.`
    : `Tarefa ${task.done ? 'reaberta' : 'concluída'}: ${task.title}.`;
  // A lista é reconstruída: devolver foco à ação equivalente ou vizinha.
  const visible = filterTasks(tasks, currentFilter);
  const sameTask = visible.find(item => item.id === id);
  const nextTask = sameTask || visible[Math.min(previousIndex, visible.length - 1)];
  const focusAction = sameTask ? action : 'toggle';
  const target = nextTask && [...list.querySelectorAll('button[data-action]')]
    .find(item => item.dataset.id === nextTask.id && item.dataset.action === focusAction);
  const fallback = filters.find(item => item.dataset.filter === currentFilter);
  (target || fallback)?.focus();
});

// Setas e Home/End percorrem tarefas da mesma ação, sem retirar os botões do Tab.
list.addEventListener('keydown', event => {
  const button = event.target instanceof Element ? event.target.closest('button[data-action]') : null;
  if (!button || !list.contains(button) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const peers = [...list.querySelectorAll('button[data-action]')]
    .filter(peer => peer.dataset.action === button.dataset.action);
  const targetIndex = keyboardTaskIndex(peers.indexOf(button), peers.length, event.key);
  if (targetIndex === null) return;
  event.preventDefault();
  peers[targetIndex].focus();
});

filters.forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  render();
  actionStatus.textContent = `Filtro: ${button.textContent.trim()}. ${filterTasks(tasks, currentFilter).length} tarefa(s) exibida(s).`;
}));

window.addEventListener('storage', event => {
  if (event.storageArea !== localStorage || (event.key !== STORAGE_KEY && event.key !== null)) return;
  try {
    // clear() em outra aba emite key=null; reler a chave evita estado antigo.
    tasks = parseTasks(localStorage.getItem(STORAGE_KEY));
    canPersist = true;
    warning.hidden = true;
    render();
  } catch {
    canPersist = false;
    warning.hidden = false;
    warning.textContent = 'Dados alterados em outra aba não puderam ser lidos. Os dados existentes foram preservados.';
  }
});

render();
