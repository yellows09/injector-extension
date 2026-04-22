/**
 * content.js — перехватчик fetch (world: MAIN)
 *
 * Этот файл живёт в MAIN world:
 *   ✅ window.fetch доступен
 *   ❌ chrome.storage недоступен
 *
 * Конфиг получаем от bridge.js через событие 'fake-ops-config'.
 */

(function () {

  const TARGET_LIST          = '/apps/pfm/api/operations/groupOperationsV3';
  const TARGET_DETAIL        = '/apps/pfm/api/operations/operationById';
  const TARGET_ABILITY_CHECK = '/apps/sbp/api/c2c/sbpAbilityCheck';
  const TARGET_BALANCE       = 'api/v4/userBalance';
  // ─── Конфиг ───────────────────────────────────────────────────────────────

  let config = {
    active:    true,
    dates:     {},
    overrides: {},
  };

  window.addEventListener('fake-ops-config', (event) => {
    config = event.detail;
  });

  // ─── Фейковые данные ──────────────────────────────────────────────────────

  const BASE = {
    accountCustomName: null,
    accountProductType: 'FULL_MAX_NONRESIDENT',
    accountToken: ENV.accountToken,
    cardMerchant: null,
    cashbackDelayDays: null,
    cashbackStatus: 'UNKNOWN_CASHBACK_STATUS',
    categoryGroupName: 'Переводы',
    clientAccountsTransferMeta: null,
    comment: null,
    coopMemberInfo: null,
    groupOperationType: 'SBP_OUTGOING',
    isMkkMarked: false,
    isOutsideGrace: null,
    isSuitableForMkk: false,
    merchantCategoryCode: '',
    merchantCategoryType: 'MERCHANT_CATEGORY_TYPE_TRANSFER',
    meta: { __typename: ENV.metaTypename },
    ozonOrderNumber: null,
    parentOperationId: null,
    points: null,
    scheduleId: null,
    scheduleType: null,
    starsPoints: null,
    status: 'GROUP_OPERATION_CONFIRMED',
    subtitle: 'Перевод',
    templateId: null,
    merchant: { logoUrlDark: 'https://cdn1.ozone.ru/s3/ob-loader/static/bank_logos/h/ozon-bank-square.png', logoUrlLight: 'https://cdn1.ozone.ru/s3/ob-loader/static/bank_logos/h/ozon-bank-square.png', name: 'Т-Банк' },
    counterpartyName: 'Озон Банк',
  };

  const ALL_FAKE_ITEMS = [
    // 1. Мд ариф Х — −500 ₽
    { ...BASE, phone: '+79001000001', groupID: 'FAKE_SERGEY_0000000000008', lastOperationId: '87ebbb28-9677-4c45-8920-b904b0869218', lastOperationTime: '2026-04-12T21:24:25Z', time: '2026-04-12T21:24:25Z', purpose: 'Мд ариф Х', accountAmount: { amountAbs: { cents: 50000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 50000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 2. Олег Николаевич Х — −500 ₽
    { ...BASE, phone: '+79001000002', groupID: 'FAKE_SERGEY_0000000000007', lastOperationId: 'f703218b-2007-4509-b054-20f685800c3a', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Олег Николаевич Х', accountAmount: { amountAbs: { cents: 50000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 50000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 3. Виктор Васильевич С — −3000 ₽
    { ...BASE, phone: '+79001000003', groupID: 'FAKE_SERGEY_0000000000006', lastOperationId: 'f703218b-2007-4509-b054-20f685800c4f', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Виктор Васильевич С', accountAmount: { amountAbs: { cents: 300000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 300000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 4. Маргарита Германовна К. — −10 000 ₽
    { ...BASE, phone: '+79001000004', groupID: 'FAKE_SERGEY_0000000000005', lastOperationId: 'f703218b-2007-4509-b054-20f685800c3d', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Маргарита Германовна К.', accountAmount: { amountAbs: { cents: 1000000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 1000000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 5. Елизовета Павловна К. — −10 000 ₽
    { ...BASE, phone: '+79001000005', groupID: 'FAKE_SERGEY_0000000000004', lastOperationId: 'b703218b-2007-4509-b054-20f685800c3a', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Елизовета Павловна К.', accountAmount: { amountAbs: { cents: 1000000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 1000000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 6. Даниил Алексеевич П — −3400 ₽
    { ...BASE, phone: '+79001000006', groupID: 'FAKE_SERGEY_0000000000002', lastOperationId: 'b00554ed-01ac-4207-8dbd-61f25aa62493', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Даниил Алексеевич П', accountAmount: { amountAbs: { cents: 340000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 340000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 7. Харлампий Константинович Э — −15 000 ₽
    { ...BASE, phone: '+79001000007', groupID: 'FAKE_SERGEY_0000000000001', lastOperationId: 'b00554ed-01ac-4207-8dbd-61f25aa62494', lastOperationTime: '2026-04-12T21:17:00Z', time: '2026-04-12T21:17:00Z', purpose: 'Харлампий Константинович Э', accountAmount: { amountAbs: { cents: 1500000, currencyName: 'RUR' }, sign: 'NEGATIVE' }, originalAmount: { amountAbs: { cents: 1500000, currencyName: 'RUR' }, sign: 'POSITIVE' } },
    // 8. Сергей Ефремов С — +27 709 ₽
    { ...BASE, phone: '+79001000008', groupID: 'FAKE_SERGEY_0000000000003', lastOperationId: 'f703218b-2007-4509-b054-20f685800c3d', lastOperationTime: '2026-04-12T21:15:00Z', time: '2026-04-12T21:15:00Z', purpose: 'Сергей Ефремов С', accountAmount: { amountAbs: { cents: 2770900, currencyName: 'RUR' }, sign: 'POSITIVE' }, originalAmount: { amountAbs: { cents: 1840000, currencyName: 'RUR' }, sign: 'POSITIVE' }, counterpartyName: 'Ак Барс Банк', merchant: { logoUrlDark: 'https://cdn1.ozone.ru/s3/ob-loader/static/bank_logos/square/100000000006.png', logoUrlLight: 'https://cdn1.ozone.ru/s3/ob-loader/static/bank_logos/square/100000000006.png', name: 'Т-Банк' } },
  ];

  const FAKE_BY_ID = {};
  ALL_FAKE_ITEMS.forEach(item => { FAKE_BY_ID[item.lastOperationId] = item; });

  // ─── Утилиты ──────────────────────────────────────────────────────────────

  function applyOverrides(item) {
    const dateOverride = config.dates[item.lastOperationId];
    const fieldOverride = config.overrides[item.lastOperationId];

    let result = item;

    if (dateOverride) {
      result = { ...result, time: dateOverride, lastOperationTime: dateOverride };
    }

    if (fieldOverride) {
      if (fieldOverride.cents !== undefined) {
        const cents = fieldOverride.cents;
        result = {
          ...result,
          accountAmount:  { ...result.accountAmount,  amountAbs: { ...result.accountAmount.amountAbs,  cents } },
          originalAmount: { ...result.originalAmount, amountAbs: { ...result.originalAmount.amountAbs, cents } },
        };
      }
      if (fieldOverride.phone !== undefined) {
        result = { ...result, phone: fieldOverride.phone };
      }
      if (fieldOverride.name !== undefined) {
        result = { ...result, purpose: fieldOverride.name, counterpartyName: fieldOverride.name };
      }
    }

    return result;
  }

  function applyDate(item) {
    return applyOverrides(item);
  }

  // ─── Построение детального ответа ─────────────────────────────────────────

  function buildDetailedItem(fakeItem) {
    return {
      accountAmount: fakeItem.accountAmount,
      accountCustomName: null,
      accountNumber: ENV.accountNumber,
      accountProductTypeV3: fakeItem.accountProductType,
      accountToken: fakeItem.accountToken,
      cardMerchant: null,
      cashbackDelayDays: null,
      cashbackParts: null,
      cashbackStatus: fakeItem.cashbackStatus,
      categoryGroupName: fakeItem.categoryGroupName,
      clientAccountsTransferMeta: null,
      coopMemberInfo: null,
      counterpartyAccount: null,
      counterpartyName: fakeItem.counterpartyName,
      direction: fakeItem.accountAmount.sign === 'NEGATIVE' ? 'OUTGOING' : 'INCOMING',
      flags: { canAutopay: false, canRepeat: true, canTemplate: true },
      groupID: fakeItem.groupID,
      groupOperationType: fakeItem.groupOperationType,
      isMkkMarked: false,
      isOutsideGrace: null,
      isPDFReceiptAvailable: false,
      isSuitableForMkk: false,
      isTransactionDocumentAvailable: false,
      lastOperationId: fakeItem.lastOperationId,
      merchant: fakeItem.merchant,
      merchantCategoryCode: fakeItem.merchantCategoryCode,
      merchantCategoryType: fakeItem.merchantCategoryType,
      meta: { __typename: ENV.metaTypename, sbpMetaLevinsonInfo: null },
      originalAmount: fakeItem.originalAmount,
      ozonOrderNumber: null,
      parentOperationId: null,
      points: null,
      purpose: fakeItem.purpose,
      receipt: {
        __typename: 'SbpReceiptV3',
        amount: { cents: fakeItem.accountAmount.amountAbs.cents, currencyCode: '810' },
        bankName: fakeItem.counterpartyName,
        pam: fakeItem.purpose,
        phone: fakeItem.phone,
        remittanceInformation: '',
        sbpId: fakeItem.groupID,
        sbpStatus: 'UNKNOWN_STATUS',
        sourceType: 'SBP_OUTGOING_CONFIRM',
        time: fakeItem.time,
      },
      scheduleId: null,
      scheduleType: null,
      starsPoints: null,
      starsPointsDetailed: null,
      status: fakeItem.status,
      templateId: null,
      time: fakeItem.time,
    };
  }

  function buildDetailResponse(fakeItem) {
    return new Response(JSON.stringify({
      data: {
        me: {
          client: {
            groupOperationsV3: { items: [buildDetailedItem(fakeItem)] },
            loyaltyV2: { currentLoyaltyProgramV2: { loyaltyProgramType: 'LOYALTY_PROGRAM_KIND_V2_CASHBACK' } },
          },
        },
      },
    }), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // === FULLSCREEN ===
  function goFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
  document.addEventListener('touchstart', goFullscreen, { once: true });

  // ─── Перехват fetch ────────────────────────────────────────────────────────

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url ?? '');

    if (!config.active) {
      return originalFetch.apply(this, args);
    }

    // 1. Перехват списка операций
    if (url.includes(TARGET_LIST)) {
      const response = await originalFetch.apply(this, args);
      const clone = response.clone();

      try {
        const json  = await clone.json();
        const items = json?.data?.me?.client?.groupOperationsV3?.items;

        if (Array.isArray(items)) {
          const fakes = ALL_FAKE_ITEMS.map(applyDate);
          items.splice(0, 0, ...fakes);
        }

        return new Response(JSON.stringify(json), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (e) {
        return response;
      }
    }

    // 2. Перехват детальной страницы
    if (url.includes(TARGET_DETAIL)) {
      let reqBody = {};
      try { reqBody = JSON.parse(args[1]?.body); } catch (e) {}

      const fakeItem = FAKE_BY_ID[reqBody.id];

      if (fakeItem) {
        return buildDetailResponse(applyDate(fakeItem));
      }

      return originalFetch.apply(this, args);
    }

    // 3. Перехват проверки возможности перевода
    if (url.includes(TARGET_ABILITY_CHECK)) {
      return new Response(JSON.stringify({
        data: {
          sbpC2CAbilityCheckV2: {
            abilityCheckData: null,
            declines: [],
            result: 'NOT_PERMITTED_BY_FINCERT'
          },
        },
      }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Перехват баланса
    if (url.includes(TARGET_BALANCE)) {
      return new Response(JSON.stringify({
        data: {
          ozonUser: {
            balance: {
              cents: 2217661
            }
          }
        }
      }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch.apply(this, args);
  };


})();