/**
 * bridge.js — мост между мирами (world: ISOLATED — по умолчанию)
 *
 * Этот файл живёт в ISOLATED world:
 *   ✅ chrome.storage доступен
 *   ❌ window.fetch недоступен
 *
 * Задача: читать chrome.storage и отправлять конфиг в MAIN world
 * через CustomEvent на window.
 */

/**
 * Читает конфиг из chrome.storage и отправляет событие в content.js
 */
function sendConfigToMain() {
  chrome.storage.local.get(['fake_ops_active', 'fake_ops_dates', 'fake_ops_overrides'], (result) => {
    const config = {
      active:    result.fake_ops_active    ?? true,
      dates:     result.fake_ops_dates     ?? {},
      overrides: result.fake_ops_overrides ?? {},
    };

    // dispatchEvent — это как emit() в EventEmitter
    // content.js слушает это событие через addEventListener
    window.dispatchEvent(new CustomEvent('fake-ops-config', {
      detail: config,
    }));
  });
}

// 1. Отправляем конфиг сразу при загрузке страницы
sendConfigToMain();

// 2. Отправляем конфиг каждый раз когда пользователь
//    что-то меняет в попапе (popup.js вызывает chrome.storage.set)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    sendConfigToMain();
  }
});