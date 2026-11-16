import { STORAGE_KEY, addTask, toggleTask, removeTask, filterTasks, parseTasks, countTasks } from './store.mjs';

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const list = document.querySelector('#task-list');
const empty = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyDetail = document.querySelector('#empty-detail');
const summary = document.querySelector('#summary');
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
    tasks = addTask(tasks, titleInput.value, crypto.randomUUID());
    titleInput.value = '';
    currentFilter = 'all';
    persist();
    render();
    titleInput.focus();
  } catch (error) {
    titleInput.setCustomValidity(error.message);
    titleInput.reportValidity();
  }
});
titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));

list.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || !list.contains(button)) return;
  if (button.dataset.action === 'toggle') tasks = toggleTask(tasks, button.dataset.id);
  if (button.dataset.action === 'delete') tasks = removeTask(tasks, button.dataset.id);
  persist();
  render();
});

filters.forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  render();
}));

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  try {
    tasks = parseTasks(event.newValue);
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
