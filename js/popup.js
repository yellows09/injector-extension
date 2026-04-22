/**
 * popup.js — слой UI
 *
 * Этот файл знает ТОЛЬКО про DOM: кнопки, инпуты, цвета.
 * Он не знает КАК данные хранятся — для этого есть Storage.
 *
 * Думай об этом как о "контроллере + вьюхе" в MVC.
 */

// Список всех фейковых операций для отображения в попапе.
// Только поля нужные для UI: id, имя, сумма, дата по умолчанию.
const FAKE_OPS = [
  { id: '87ebbb28-9677-4c45-8920-b904b0869218', name: 'Мд ариф Х',                  cents: 50000,   sign: 'NEGATIVE', defaultDate: '2026-04-12T21:24:25Z', defaultPhone: '+79001000001' },
  { id: 'f703218b-2007-4509-b054-20f685800c3a', name: 'Олег Николаевич Х',          cents: 50000,   sign: 'NEGATIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79001000002' },
  { id: 'f703218b-2007-4509-b054-20f685800c4f', name: 'Виктор Васильевич С',        cents: 300000,  sign: 'NEGATIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79001000003' },
  { id: 'f703218b-2007-4509-b054-20f685800c3d', name: 'Маргарита Германовна К.',    cents: 1000000, sign: 'NEGATIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79001000004' },
  { id: 'b703218b-2007-4509-b054-20f685800c3a', name: 'Елизовета Павловна К.',      cents: 1000000, sign: 'NEGATIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79001000005' },
  { id: 'b00554ed-01ac-4207-8dbd-61f25aa62493', name: 'Даниил Алексеевич П',        cents: 340000,  sign: 'NEGATIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79001000006' },
  { id: 'b00554ed-01ac-4207-8dbd-61f25aa62494', name: 'Харлампий Константинович Э', cents: 1500000, sign: 'NEGATIVE', defaultDate: '2026-04-12T21:17:00Z', defaultPhone: '+79604737988' },
  { id: 'f703218b-2007-4509-b054-20f685800c3d', name: 'Сергей Ефремов С',           cents: 2770900, sign: 'POSITIVE', defaultDate: '2026-04-12T21:15:00Z', defaultPhone: '+79295360023' },
];

// ─── Утилиты ────────────────────────────────────────────────────────────────

/** '2026-04-12T21:15:00Z'  →  '2026-04-12T21:15'  (для input datetime-local) */
function localToIso(local) {
  // local = '2026-04-12T13:00'
  const [datePart, timePart] = local.split('T');        // ['2026-04-12', '13:00']
  const [year, month, day]   = datePart.split('-').map(Number);
  const [hours, minutes]     = timePart.split(':').map(Number);

  // Вычитаем 3 часа вручную
  let utcHours = hours - 3;
  let utcDay   = day;
  let utcMonth = month;
  let utcYear  = year;

  // Если ушли в минус (например 01:00 - 3 = -2:00 → предыдущий день 22:00)
  if (utcHours < 0) {
    utcHours += 24;
    utcDay   -= 1;
    // Упрощённо: не учитываем смену месяца — для демо этого достаточно
  }

  const pad = n => String(n).padStart(2, '0');
  return `${utcYear}-${pad(utcMonth)}-${pad(utcDay)}T${pad(utcHours)}:${pad(minutes)}:00Z`;
}

/** '2026-04-12T10:00:00Z'  →  '2026-04-12T13:00'  (плюс 3 часа, без Date) */
function isoToLocal(iso) {
  // iso = '2026-04-12T10:00:00Z'
  const [datePart, timePart] = iso.replace('Z', '').split('T');
  const [year, month, day]   = datePart.split('-').map(Number);
  const [hours, minutes]     = timePart.split(':').map(Number);

  let mskHours = hours + 3;
  let mskDay   = day;
  let mskMonth = month;
  let mskYear  = year;

  if (mskHours >= 24) {
    mskHours -= 24;
    mskDay   += 1;
  }

  const pad = n => String(n).padStart(2, '0');
  return `${mskYear}-${pad(mskMonth)}-${pad(mskDay)}T${pad(mskHours)}:${pad(minutes)}`;
}

/** 50000 (копейки) → '500 ₽' */
function centsToLabel(cents) {
  return (cents / 100).toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

// ─── Рендеринг ───────────────────────────────────────────────────────────────

/**
 * Рисует переключатель вкл/выкл.
 * @param {boolean} isActive
 */
function renderToggle(isActive) {
  const track = document.getElementById('toggle-track');
  const thumb  = document.getElementById('toggle-thumb');
  const badge  = document.getElementById('status-badge');

  if (isActive) {
    track.style.background = '#22c55e';
    thumb.style.left = '22px';
    badge.textContent = '● активен';
    badge.className = 'badge badge--on';
  } else {
    track.style.background = 'var(--border)';
    thumb.style.left = '3px';
    badge.textContent = '● отключён';
    badge.className = 'badge badge--off';
  }
}

/**
 * Рисует список операций.
 * @param {Object} savedDates     — даты из Storage
 * @param {Object} savedOverrides — суммы и телефоны из Storage
 */
function renderList(savedDates, savedOverrides) {
  const list = document.getElementById('ops-list');

  list.innerHTML = FAKE_OPS.map(op => {
    const currentDate  = savedDates[op.id]              || op.defaultDate;
    const currentCents = savedOverrides[op.id]?.cents   ?? op.cents;
    const currentPhone = savedOverrides[op.id]?.phone   ?? op.defaultPhone;
    const currentName  = savedOverrides[op.id]?.name    ?? op.name;
    const amtClass = op.sign === 'POSITIVE' ? 'amount amount--pos' : 'amount amount--neg';
    const prefix   = op.sign === 'POSITIVE' ? '+' : '−';

    return `
      <div class="row">
        <div class="row__name">${op.name}</div>
        <div class="row__bottom">
          <span class="${amtClass}">${prefix}${centsToLabel(currentCents)}</span>
          <input
            type="datetime-local"
            class="date-input"
            value="${isoToLocal(currentDate)}"
            data-id="${op.id}"
          >
          <div class="saved-dot" id="dot-${op.id}"></div>
        </div>
        <div class="row__bottom row__bottom--fields">
          <input
            type="text"
            class="field-input"
            placeholder="Имя"
            value="${currentName}"
            data-id="${op.id}"
            data-field="name"
          >
          <input
            type="number"
            class="field-input"
            placeholder="Сумма (₽)"
            value="${currentCents / 100}"
            data-id="${op.id}"
            data-field="cents"
          >
          <input
            type="tel"
            class="field-input"
            placeholder="Телефон"
            value="${currentPhone}"
            data-id="${op.id}"
            data-field="phone"
          >
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.date-input').forEach(input => {
    input.addEventListener('change', onDateChange);
  });

  list.querySelectorAll('.field-input').forEach(input => {
    input.addEventListener('change', onFieldChange);
  });
}

// ─── Обработчики событий ──────────────────────────────────────────────────────

/** Клик по переключателю */
async function onToggleClick() {
  const isActive = await Storage.getActive();
  const next = !isActive;
  await Storage.setActive(next);
  renderToggle(next);
}

/** Изменение даты в инпуте */
async function onDateChange(event) {
  const input = event.target;
  const operationId = input.dataset.id;
  const newIso = localToIso(input.value);

  await Storage.setDate(operationId, newIso);

  const dot = document.getElementById('dot-' + operationId);
  dot.style.opacity = '1';
  setTimeout(() => { dot.style.opacity = '0'; }, 1400);
}

/** Изменение суммы или телефона */
async function onFieldChange(event) {
  const input = event.target;
  const operationId = input.dataset.id;
  const field = input.dataset.field;

  let value = input.value.trim();
  if (field === 'cents') value = Math.round(parseFloat(value) * 100);

  await Storage.setOverride(operationId, field, value);

  const dot = document.getElementById('dot-' + operationId);
  dot.style.opacity = '1';
  setTimeout(() => { dot.style.opacity = '0'; }, 1400);
}

// ─── Инициализация ────────────────────────────────────────────────────────────

async function init() {
  const [isActive, savedDates, savedOverrides] = await Promise.all([
    Storage.getActive(),
    Storage.getDates(),
    Storage.getOverrides(),
  ]);

  renderToggle(isActive);
  renderList(savedDates, savedOverrides);

  document.getElementById('toggle-wrap').addEventListener('click', onToggleClick);
}

document.addEventListener('DOMContentLoaded', init);