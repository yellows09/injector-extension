/**
 * storage.js — слой данных
 *
 * Этот файл знает ТОЛЬКО о chrome.storage.
 * Он не знает ничего про DOM, кнопки, цвета и т.д.
 *
 * Думай об этом как о "модели" в MVC.
 */

const KEYS = {
  ACTIVE: 'fake_ops_active',
  DATES:  'fake_ops_dates',
};

const Storage = {

  /**
   * Получить состояние переключателя (вкл/выкл).
   * По умолчанию — true (включён).
   */
  async getActive() {
    return new Promise(resolve => {
      chrome.storage.local.get([KEYS.ACTIVE], result => {
        resolve(result[KEYS.ACTIVE] ?? true);
      });
    });
  },

  /**
   * Сохранить состояние переключателя.
   * @param {boolean} value
   */
  async setActive(value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [KEYS.ACTIVE]: value }, resolve);
    });
  },

  /**
   * Получить объект с переопределёнными датами.
   * Формат: { 'lastOperationId': '2026-04-12T21:15:00Z', ... }
   */
  async getDates() {
    return new Promise(resolve => {
      chrome.storage.local.get([KEYS.DATES], result => {
        resolve(result[KEYS.DATES] ?? {});
      });
    });
  },

  /**
   * Сохранить новую дату для одной операции.
   * @param {string} operationId  — lastOperationId фейкового айтема
   * @param {string} isoDate      — дата в формате '2026-04-12T21:15:00Z'
   */
  async setDate(operationId, isoDate) {
    const dates = await this.getDates();
    dates[operationId] = isoDate;
    return new Promise(resolve => {
      chrome.storage.local.set({ [KEYS.DATES]: dates }, resolve);
    });
  },

  async getOverrides() {
    return new Promise(resolve => {
      chrome.storage.local.get(['fake_ops_overrides'], result => {
        resolve(result['fake_ops_overrides'] ?? {});
      });
    });
  },

  async setOverride(operationId, field, value) {
    const overrides = await this.getOverrides();
    if (!overrides[operationId]) overrides[operationId] = {};
    overrides[operationId][field] = value;
    return new Promise(resolve => {
      chrome.storage.local.set({ 'fake_ops_overrides': overrides }, resolve);
    });
  },

};