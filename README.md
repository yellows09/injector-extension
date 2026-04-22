# Ozon Operations Injector

Chrome extension (Manifest V3) для изучения техник модификации API-ответов на лету без изменения серверной части.

## Что демонстрирует

- **Monkey-patching `window.fetch`** в `world: MAIN` — перехват и модификация ответов до того, как страница их получит
- **Мост между мирами** (`MAIN` ↔ `ISOLATED`) через `CustomEvent` — единственный способ передать данные между двумя изолированными контекстами
- **Service Worker** (`background.js`) — перехват навигации через `chrome.tabs.onUpdated`
- **`chrome.storage`** как персистентное хранилище настроек расширения
- **Popup UI** с живым редактированием параметров — изменения применяются без перезагрузки страницы

## Архитектура

```
popup.js → chrome.storage → bridge.js (ISOLATED)
                                  ↓ CustomEvent
                            content.js (MAIN) → window.fetch override
```

```
background.js (Service Worker) → chrome.tabs.onUpdated → перехват навигации
```

## Структура файлов

| Файл | Мир | Назначение |
|---|---|---|
| `content.js` | MAIN | Перехват fetch, подстановка данных |
| `bridge.js` | ISOLATED | Чтение storage, передача конфига в MAIN |
| `background.js` | Service Worker | Перехват навигации по вкладкам |
| `js/popup.js` | — | UI попапа |
| `js/storage.js` | — | Слой работы с chrome.storage |
| `config.js` | — | Локальные настройки (не в репо) |

## Установка

1. Скопируй `config.example.js` → `config.js` и заполни своими значениями
2. Открой `chrome://extensions/`
3. Включи **Developer mode**
4. **Load unpacked** → выбери папку проекта

## Стек

Chrome Extensions API · Manifest V3 · Vanilla JS · `world: MAIN` content scripts
