import type { Category, CategoryToggle, Transaction } from '@/types';

export const categories: Category[] = [
  // Расходы
  { id: 'cat_food',          name: 'Еда',              icon: '🍕', color: '#D4F26A', type: 'expense' },
  { id: 'cat_transport',     name: 'Транспорт',        icon: '🚕', color: '#FFB4D1', type: 'expense' },
  { id: 'cat_selfcare',      name: 'Уход за собой',    icon: '💅', color: '#9EE5C5', type: 'expense' },
  { id: 'cat_subscriptions', name: 'Подписки',         icon: '📱', color: '#C7B8FF', type: 'expense' },
  { id: 'cat_unexpected',    name: 'Непредвиденные',   icon: '🎁', color: '#FF8E72', type: 'expense' },
  { id: 'cat_home',          name: 'Дом',              icon: '🏠', color: '#FFD66B', type: 'expense' },
  { id: 'cat_entertainment', name: 'Развлечения',      icon: '🎮', color: '#A0D8FF', type: 'expense' },
  { id: 'cat_health',        name: 'Здоровье',         icon: '💊', color: '#FFCBA0', type: 'expense' },
  { id: 'cat_clothes',       name: 'Одежда',           icon: '👗', color: '#D4F26A', type: 'expense' },
  { id: 'cat_cafe',          name: 'Кафе',             icon: '☕', color: '#FFB4D1', type: 'expense' },
  // Доходы
  { id: 'cat_salary',        name: 'Зарплата',         icon: '💰', color: '#9EE5C5', type: 'income' },
  { id: 'cat_freelance',     name: 'Фриланс',         icon: '💻', color: '#D4F26A', type: 'income' },
];

export const categoryToggles: CategoryToggle[] = categories.map((c) => ({
  ...c,
  enabled: true,
}));

export const transactions: Transaction[] = [
  // ============================
  // Апрель 2026 — расходы (27 шт.)
  // ============================
  { id: 'tx_001', amount: 2340,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-01', comment: 'Пятёрочка',                  type: 'expense' },
  { id: 'tx_002', amount: 450,   currency: 'RUB', categoryId: 'cat_transport',     date: '2026-04-02', comment: 'Яндекс.Такси',               type: 'expense' },
  { id: 'tx_003', amount: 1290,  currency: 'RUB', categoryId: 'cat_subscriptions', date: '2026-04-02', comment: 'YouTube Premium',             type: 'expense' },
  { id: 'tx_004', amount: 780,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-04-03', comment: 'Кофемания',                   type: 'expense' },
  { id: 'tx_005', amount: 1560,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-04', comment: 'Вкусвилл',                    type: 'expense' },
  { id: 'tx_006', amount: 350,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-04-05', comment: 'Кофе на вынос',               type: 'expense' },
  { id: 'tx_007', amount: 3200,  currency: 'RUB', categoryId: 'cat_selfcare',      date: '2026-04-06', comment: 'Маникюр',                     type: 'expense' },
  { id: 'tx_008', amount: 200,   currency: 'RUB', categoryId: 'cat_transport',     date: '2026-04-07', comment: 'Метро',                       type: 'expense' },
  { id: 'tx_009', amount: 890,   currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-08', comment: 'Перекрёсток',                  type: 'expense' },
  { id: 'tx_010', amount: 4500,  currency: 'RUB', categoryId: 'cat_health',        date: '2026-04-09', comment: 'Стоматолог',                  type: 'expense' },
  { id: 'tx_011', amount: 15,    currency: 'USD', categoryId: 'cat_subscriptions', date: '2026-04-10', comment: 'Spotify',                     type: 'expense' },
  { id: 'tx_012', amount: 1200,  currency: 'RUB', categoryId: 'cat_transport',     date: '2026-04-10', comment: 'Яндекс.Такси аэропорт',       type: 'expense' },
  { id: 'tx_013', amount: 6700,  currency: 'RUB', categoryId: 'cat_clothes',       date: '2026-04-11', comment: 'Uniqlo футболки',              type: 'expense' },
  { id: 'tx_014', amount: 500,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-04-12', comment: 'Бургер Кинг',                  type: 'expense' },
  { id: 'tx_015', amount: 2800,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-13', comment: 'Ашан закупка',                 type: 'expense' },
  { id: 'tx_016', amount: 1500,  currency: 'RUB', categoryId: 'cat_entertainment', date: '2026-04-14', comment: 'Кино IMAX',                   type: 'expense' },
  { id: 'tx_017', amount: 35,    currency: 'USD', categoryId: 'cat_entertainment', date: '2026-04-15', comment: 'Steam игра',                  type: 'expense' },
  { id: 'tx_018', amount: 9500,  currency: 'RUB', categoryId: 'cat_home',          date: '2026-04-16', comment: 'Коммунальные',                 type: 'expense' },
  { id: 'tx_019', amount: 670,   currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-17', comment: 'Яндекс.Лавка',                type: 'expense' },
  { id: 'tx_020', amount: 199,   currency: 'RUB', categoryId: 'cat_subscriptions', date: '2026-04-18', comment: 'iCloud 50 ГБ',                type: 'expense' },
  { id: 'tx_021', amount: 1500,  currency: 'RUB', categoryId: 'cat_transport',     date: '2026-04-19', comment: 'Каршеринг Ситидрайв',         type: 'expense' },
  { id: 'tx_022', amount: 3500,  currency: 'RUB', categoryId: 'cat_unexpected',    date: '2026-04-20', comment: 'Ремонт телефона',              type: 'expense' },
  { id: 'tx_023', amount: 420,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-04-21', comment: 'Шоколадница',                  type: 'expense' },
  { id: 'tx_024', amount: 50,    currency: 'USD', categoryId: 'cat_clothes',       date: '2026-04-22', comment: 'ASOS заказ',                   type: 'expense' },
  { id: 'tx_025', amount: 1800,  currency: 'RUB', categoryId: 'cat_selfcare',      date: '2026-04-23', comment: 'Стрижка',                      type: 'expense' },
  { id: 'tx_026', amount: 2100,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-04-25', comment: 'Магнит',                       type: 'expense' },
  { id: 'tx_027', amount: 750,   currency: 'RUB', categoryId: 'cat_home',          date: '2026-04-27', comment: 'Лампочки и мелочи',            type: 'expense' },

  // Апрель 2026 — доходы (4 шт.)
  { id: 'tx_028', amount: 165000, currency: 'RUB', categoryId: 'cat_salary',   date: '2026-04-10', comment: 'Зарплата апрель',   type: 'income' },
  { id: 'tx_029', amount: 45000,  currency: 'RUB', categoryId: 'cat_freelance', date: '2026-04-15', comment: 'Проект лендинг',   type: 'income' },
  { id: 'tx_030', amount: 30000,  currency: 'RUB', categoryId: 'cat_freelance', date: '2026-04-22', comment: 'Верстка макетов',  type: 'income' },
  { id: 'tx_031', amount: 165000, currency: 'RUB', categoryId: 'cat_salary',   date: '2026-04-25', comment: 'Аванс май',         type: 'income' },

  // ============================
  // Март 2026 — расходы (13 шт.)
  // ============================
  { id: 'tx_032', amount: 2700,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-03-02', comment: 'Пятёрочка',               type: 'expense' },
  { id: 'tx_033', amount: 600,   currency: 'RUB', categoryId: 'cat_transport',     date: '2026-03-03', comment: 'Яндекс.Такси',            type: 'expense' },
  { id: 'tx_034', amount: 1290,  currency: 'RUB', categoryId: 'cat_subscriptions', date: '2026-03-05', comment: 'YouTube Premium',          type: 'expense' },
  { id: 'tx_035', amount: 550,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-03-06', comment: 'Старбакс',                type: 'expense' },
  { id: 'tx_036', amount: 1800,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-03-08', comment: 'Вкусвилл',                type: 'expense' },
  { id: 'tx_037', amount: 9500,  currency: 'RUB', categoryId: 'cat_home',          date: '2026-03-10', comment: 'Коммунальные',             type: 'expense' },
  { id: 'tx_038', amount: 2500,  currency: 'RUB', categoryId: 'cat_selfcare',      date: '2026-03-12', comment: 'Косметолог',               type: 'expense' },
  { id: 'tx_039', amount: 25,    currency: 'USD', categoryId: 'cat_entertainment', date: '2026-03-14', comment: 'Netflix',                  type: 'expense' },
  { id: 'tx_040', amount: 3200,  currency: 'RUB', categoryId: 'cat_food',          date: '2026-03-16', comment: 'Ашан закупка',             type: 'expense' },
  { id: 'tx_041', amount: 800,   currency: 'RUB', categoryId: 'cat_transport',     date: '2026-03-18', comment: 'Каршеринг',                type: 'expense' },
  { id: 'tx_042', amount: 5800,  currency: 'RUB', categoryId: 'cat_unexpected',    date: '2026-03-20', comment: 'Штраф ГИБДД',             type: 'expense' },
  { id: 'tx_043', amount: 3500,  currency: 'RUB', categoryId: 'cat_health',        date: '2026-03-22', comment: 'Анализы в лаборатории',    type: 'expense' },
  { id: 'tx_044', amount: 450,   currency: 'RUB', categoryId: 'cat_cafe',          date: '2026-03-25', comment: 'Кофе на вынос',            type: 'expense' },

  // Март 2026 — доходы (3 шт.)
  { id: 'tx_045', amount: 165000, currency: 'RUB', categoryId: 'cat_salary',   date: '2026-03-10', comment: 'Зарплата март',    type: 'income' },
  { id: 'tx_046', amount: 35000,  currency: 'RUB', categoryId: 'cat_freelance', date: '2026-03-17', comment: 'Фриланс лого',    type: 'income' },
  { id: 'tx_047', amount: 165000, currency: 'RUB', categoryId: 'cat_salary',   date: '2026-03-25', comment: 'Аванс апрель',     type: 'income' },
];
