# UX-аудит kopeika v1

Сравнение текущего UI (Этап 1, PR #3, ветка `feat/stage1-scaffold-7e8f2d9`) с выводами
research конкурентов (`docs/research/`).

**Дата:** 2026-04-30
**Источники:** 11 приложений — CoinKeeper, Дзен-мони, Monefy, Money Lover, Tinkoff,
YNAB, Wallet, Toshl, Spendee, Mint, Finly.

---

## TL;DR

1. **Нет CRUD транзакций** — нельзя отредактировать или удалить введённую операцию.
   Это есть у *всех* 11 конкурентов. Критичный gap.
2. **Нет хронологического списка транзакций** — пользователь видит операции только
   через drill-down по категории. Все конкуренты показывают общий список с группировкой
   по дням.
3. **Фильтр только по месяцу** — у Monefy, YNAB и Tinkoff есть день/неделя/год/произвольный
   период. При одном месяце невозможно оценить динамику.
4. **Emoji-иконки не показываются** — типы и мок-данные уже содержат emoji (`🍕`, `🚌`, `💅`),
   но UI рендерит только цветные точки. Простейшее улучшение узнаваемости категорий.
5. **InputBar конфликтует с bottom navigation** — если добавлять tab bar (а это нужно
   для Settings/транзакций), фиксированный инпут внизу не поместится. Нужно решение.

---

## Что есть в текущем UI

### Экраны

| Экран | Что делает | Ключевые элементы |
|-------|-----------|-------------------|
| **StartScreen** | Онбординг — выбор категорий | Логотип, tagline, toggle-чипсы категорий, inline-добавление своей категории, CTA «Поехали» |
| **MainScreen** | Основной дэшборд | MonthPicker, SegmentedControl (траты/доходы), DonutChart (3 стиля), CategoryList с %, InputBar (NL-ввод), кнопка 📎 (stub) |
| **CategoryModal** | Bottom sheet детализации | Заголовок с CatDot, итого, flat-список транзакций (note + date + amount) |
| **UIKitPage** | Каталог компонентов (/uikit) | Все компоненты во всех состояниях, палитра, типографика |

### Реализованные фичи

- Ввод транзакции через NL-текст (`"еда 500"` → naive parsing)
- Donut chart с динамической oklch-палитрой (3 стиля: ring/pie/thin)
- Переключатель трат/доходов (SegmentedControl)
- Выбор месяца (MonthPicker dropdown)
- Drill-down по категории (CategoryModal bottom sheet)
- Кнопка 📎 с toast-заглушкой о прикреплении выписки
- PWA-манифест, apple-touch-icon, iOS meta-теги, service worker
- TypeScript типы с multi-currency (`Money`, `CurrencyCode: 'RUB' | 'USD'`)
- 47 мок-транзакций (RUB + USD) в `src/data/mocks.ts`
- 12 категорий с emoji в данных
- Утилиты `formatMoney`, `groupByCategory`, `groupByDay` (определены, но не подключены к экранам)
- React Router (3 роута), Vite, TailwindCSS, Vitest (14 тестов)

### Чего нет (и не было в наброске)

- Редактирование/удаление транзакций
- Хронологический список всех транзакций
- Полноценный Settings экран
- Bottom navigation (tab bar)
- Поиск и фильтрация
- Группировка транзакций по дням
- Персистентность данных (localStorage убрали из прототипа, IndexedDB ещё нет)
- Тёмная тема (токены определены, переключатель не реализован)
- Голосовой ввод (заявлен в tagline, нет кнопки)
- Реальный импорт файлов

---

## Gap-лист

### Категория A: критические gap'ы

Без этих фич приложение не выдерживает сравнения даже с Monefy (самый минимальный конкурент).

| # | Gap | Что предлагаем | Источник (конкурент) | Сложность | Влияет на |
|---|-----|----------------|----------------------|-----------|-----------|
| A1 | **Нет редактирования и удаления транзакций** — введённую операцию невозможно исправить или убрать | Экран TransactionDetail с формой редактирования (сумма, категория, дата, комментарий). Swipe-to-delete в списке транзакций — стандарт iOS | Все 11 конкурентов имеют CRUD. Monefy — swipe, YNAB — structured form, Wallet — list edit (см. `docs/research/apps/monefy.md`, `ynab.md`, `wallet.md`) | M | Новый экран TransactionDetail, swipe gesture handling, data model (update/delete) |
| A2 | **Нет хронологического списка транзакций** — операции видны только через модалку категории. Нет способа увидеть «что я тратил вчера» | Добавить TransactionList view с группировкой по дням (заголовок «12 апреля, Пн» + дневной итог). Utility `groupByDay` уже реализована в `src/lib/grouping.ts` | YNAB — register view (см. `ynab.md`), Wallet — transaction list (`wallet.md`), Toshl — expense list (`toshl.md`), Spendee — daily groups (`spendee.md`). Паттерн присутствует у 10/11 конкурентов | M | MainScreen layout, новый компонент TransactionList, фильтрация |
| A3 | **Фильтр только по месяцу** — невозможно посмотреть траты за неделю, год или произвольный период | Расширить MonthPicker до PeriodPicker: месяц (default) + год + произвольный range. Day/week можно отложить | Monefy — day/week/month/year/custom (`monefy.md`), YNAB — month/quarter/year/custom (`ynab.md`), Tinkoff — day/week/2weeks/month/custom (`tinkoff.md`) | M | Замена MonthPicker → PeriodPicker, пересчёт данных |
| A4 | **Нет обратной связи при добавлении транзакции** — при отправке «еда 500» только 400ms подсветка рамки. Пользователь не знает: в какую категорию попало? с какой суммой? | Toast с деталями: «Записано: 500 ₽ → Еда». Donut chart анимированно обновляется. Кнопка «Отменить» в toast (undo) | CoinKeeper — монетка летит в категорию (`coinkeeper.md`), Finly — AI подтверждает: «Записала: кофе 500₽ → Кафе» (`finly.md`), Monefy — анимация chart (`monefy.md`) | S | InputBar, Toast, MainScreen state |
| A5 | **Нет экрана настроек** — TweaksPanel из прототипа был инструментом дизайнера, не пользователя. Негде управлять категориями, валютой, backup | Settings экран: CRUD категорий (drag-to-reorder, edit name/icon/color, delete), выбор основной валюты, кнопка export/import backup. Доступ через аватар «К» или bottom nav | Все 11 конкурентов имеют Settings/Profile. YNAB — Budget Settings (`ynab.md`), Wallet — account management (`wallet.md`) | M | Новый экран Settings, navigation |

### Категория B: важные UX-паттерны

Улучшат повседневный опыт и приблизят к уровню Monefy/Spendee.

| # | Gap | Что предлагаем | Источник (конкурент) | Сложность | Влияет на |
|---|-----|----------------|----------------------|-----------|-----------|
| B1 | **Нет bottom navigation** — между экранами только кнопки «Поехали» / «← старт». При добавлении Settings и TransactionList навигация станет невозможной | Tab bar с 3 табами: Главная (donut + categories), Операции (хронологический список), Настройки. При появлении Trends (v2) — четвёртый таб | Money Lover — bottom nav с 4 табами (`money-lover.md`), Spendee — bottom nav (`spendee.md`), Monefy — bottom tab (`monefy.md`) | M | Layout, routing, safe-area-inset-bottom |
| B2 | **Нет swipe actions на iOS** — стандартный жест для контекстных действий не реализован | В списке транзакций: swipe left → кнопки «Изменить» (серый) + «Удалить» (красный). iOS-нативный паттерн, знаком каждому пользователю iPhone | Spendee — swipe-to-delete (`spendee.md`), Wallet — swipe actions (`wallet.md`). Стандарт iOS: Mail, Notes, Messages | S | TransactionList, CategoryModal |
| B3 | **Emoji-иконки не показываются в UI** — тип `Category` содержит `icon: string` (emoji), мок-данные содержат `🍕🚌💅📱🎉💊🏠🔥💰💻`, но UI рендерит только цветные точки (`CatDot`) | Показывать emoji внутри CatDot (центрировать внутри цветного круга/квадрата). **У пользователя в наброске emoji нет** — но emoji повышают узнаваемость и ускоряют сканирование списка. Альтернатива: emoji рядом с названием категории | CoinKeeper — иконки категорий (`coinkeeper.md`), YNAB — emoji в названиях (`ynab.md`), Money Lover — icon packs (`money-lover.md`), Monefy — цветные иконки в chart (`monefy.md`) | S | CatDot component, CategoryList, DonutChart |
| B4 | **Нет поиска по транзакциям** — при 100+ операций/месяц найти конкретную запись невозможно | Search bar в TransactionList view. Фильтрация по тексту (comment), категории, диапазону сумм. Начать с простого текстового поиска | YNAB — search по payee/category/memo (`ynab.md`), Wallet — фильтры по категории/тегу (`wallet.md`), Дзен-мони — search + filters (`zenmoney.md`) | S | TransactionList, новый SearchBar |
| B5 | **Группировка транзакций по дням** — в CategoryModal транзакции показаны flat-списком без дат-заголовков | Группировать по дням с заголовком «12 апреля» и дневным итогом. `groupByDay` уже реализована в `src/lib/grouping.ts`, осталось подключить | Money Lover — daily groups с итогами (`money-lover.md`), YNAB — register с датами (`ynab.md`), Spendee — daily groups (`spendee.md`) | S | TransactionList, CategoryModal |
| B6 | **Иконка микрофона отсутствует** — tagline «пиши, говори или прикрепляй» обещает голос, но в InputBar нет кнопки микрофона | Добавить иконку 🎤 в InputBar (рядом с 📎). На Этапе 1: тап → toast «Голосовой ввод появится в следующем обновлении». В v2: подключить Whisper API через backend | CoinKeeper — long press для голоса (`coinkeeper.md`), Finly — voice AI primary (`finly.md`) | S | InputBar, Icon set |
| B7 | **Нет quick-add через тап на категорию** — единственный способ ввода — NL-текст. Для «2-3 тапа» нужен shortcut | При тапе на категорию в donut/списке → quick-add popup с numpad для суммы + кнопка «Записать». Два пути: NL-текст для «знающих» + category→amount для быстрого ввода. **У пользователя в наброске NL — primary**, это осознанный выбор и конкурентное преимущество. Quick-add — дополнение, не замена | Monefy — 2 тапа, 3 секунды: category + numpad = done (`monefy.md`), CoinKeeper — drag-and-drop монеткой (`coinkeeper.md`), Toshl — 4 тапа (`toshl.md`) | M | CategoryList interaction, новый QuickAddPopup |
| B8 | **Нет мультивалютности в UI** — типы `Money` и `CurrencyCode` определены, мок-данные содержат USD-транзакции, но UI показывает только числа без валюты | Показывать символ валюты (₽ / $) рядом с суммой. В donut chart — конвертировать в базовую валюту. В форме ввода — селектор валюты. plan.md включает мультивалютность в v1 (этап 12) | Toshl — ~200 валют + 30 крипто с live-курсами (`toshl.md`), Wallet — multi-currency (`wallet.md`), YNAB — single-currency per budget (`ynab.md`) | M | formatMoney (уже поддерживает), MainScreen, InputBar |

### Категория C: желательное (можно отложить)

| # | Gap | Что предлагаем | Источник | Сложность | Когда |
|---|-----|----------------|----------|-----------|-------|
| C1 | Теги/лейблы (cross-category) | Одна транзакция = 1 категория + N тегов. Гибче подкатегорий | Toshl, Spendee, Wallet (`toshl.md`, `spendee.md`, `wallet.md`) | M | plan.md: v2, этап 20 |
| C2 | Тренды и сравнение периодов | Bar chart «этот месяц vs прошлый» с % разницей | Toshl — bar charts, Mint — Trends as killer feature (`toshl.md`, `mint.md`) | M | plan.md: v2, этап 18 |
| C3 | Повторяющиеся транзакции | Автоматические recurring: аренда, подписки, зарплата | 8/11 конкурентов. YNAB, Zen-moni, Money Lover | M | plan.md: v2, этап 19 |
| C4 | Тёмная тема | Токены `dark` уже определены в TailwindCSS. Осталось: media query или toggle | Spendee, Monefy (premium), Apple HIG рекомендует | S | plan.md: не в v1, но токены готовы |
| C5 | Бюджеты/лимиты на категорию | Прогресс-бар на категории, цвет меняется green→yellow→red по % расхода | YNAB — targets/goals (`ynab.md`), CoinKeeper — «светофор» (`coinkeeper.md`), Wallet — predictive alerts (`wallet.md`) | L | plan.md: v2, этап 17 |
| C6 | FinHealth / финансовое здоровье | Индекс на основе income/expense ratio, наличия «подушки», регулярности трекинга | Tinkoff — FinHealth AI (`tinkoff.md`) | L | v3+, требует данных за 3+ месяцев |
| C7 | Receipt scanning (OCR) | Камера → AI извлекает сумму, категорию, описание | Spendee — AI Receipt Scanner (`spendee.md`), Finly — фото чеков (`finly.md`) | XL | plan.md: v3 |

### Категория D: что лучше убрать или переосмыслить

| # | Что сейчас | Проблема | Что предлагаем | Источник |
|---|-----------|----------|----------------|----------|
| D1 | **Tabs «Траты / Доходы»** — SegmentedControl переключает весь view | У среднего пользователя 1-3 дохода/месяц vs 30-50 расходов. Отдельный таб «Доходы» почти всегда выглядит пустым. | При появлении TransactionList (A2) — единый список с цветовой меткой: расходы обычным цветом, доходы зелёным. Фильтр трат/доходов — опциональный (chip filter), не основная навигация. **В donut chart оставить** переключатель — там визуально имеет смысл. | YNAB — единый register, income зелёным (`ynab.md`). Wallet — unified list с цветовыми суммами (`wallet.md`) |
| D2 | **Аватар «К» без функции** — декоративный элемент в шапке MainScreen | Занимает место, не кликабелен, не несёт информации | Сделать кнопкой перехода в Settings. Тап → Settings экран. Интуитивный паттерн, знаком по Telegram, Gmail, Instagram. | Money Lover — тап по аватару → настройки (`money-lover.md`), Дзен-мони — профиль (`zenmoney.md`) |
| D3 | **InputBar фиксирован внизу** — всегда видна, занимает ~60px | При добавлении bottom navigation (B1) — конфликт: tab bar + InputBar оба внизу. Текст «расскажи что потратил» видно на экране где пользователь просто смотрит статистику | Два варианта: **(a)** FAB «+» в bottom-right → тап открывает InputBar overlay (как Toshl/YNAB). **(b)** InputBar внутри scroll-области MainScreen (не fixed), появляется при скролле вверх. Рекомендую **(a)**: разгружает основной экран, FAB — стандарт Material/iOS | Toshl — FAB «+» (`toshl.md`), YNAB — «Add Transaction» button (`ynab.md`), Monefy — «+» / «−» buttons (`monefy.md`) |
| D4 | **Наивный парсинг NL-ввода** — `String.includes()` для категории + regex для суммы | «кофе 350» → ищет категорию, начинающуюся на «кофе». Нет категории «кофе» → fallback на первую. Пользователь не знает почему 350₽ попали в «еда». | Этап 8 в plan.md улучшит парсер. Но уже сейчас нужен feedback: (1) показать парсинг-превью *до* отправки: «350 ₽ → Еда?» (editable). (2) При неопределённости — дать выбрать категорию вручную из popup | Finly — AI подтверждает распознавание (`finly.md`), Money Lover — AI показывает результат парсинга (`money-lover.md`) |

---

## Группировка предложений по экранам

### StartScreen (онбординг)

Текущий экран — хороший. Минимальные изменения:
- **B3**: Показывать emoji внутри CatDot на toggle-чипсах категорий
- Добавить анимацию появления чипсов (staggered fadeIn) для polish

### MainScreen (основной дэшборд)

Самые большие изменения:
- **A2**: Добавить TransactionList view (альтернативный к donut, переключение SegmentedControl или tab)
- **A3**: Заменить MonthPicker → PeriodPicker (месяц + год + custom range)
- **A4**: Toast с подтверждением при добавлении транзакции + undo
- **B3**: Emoji в CatDot категорий
- **B5**: Группировка транзакций по дням
- **B7**: Quick-add через тап на категорию
- **B8**: Символ валюты в суммах
- **D1**: В TransactionList — единый список с цветовой меткой (без tabs)
- **D2**: Аватар «К» → кнопка перехода в Settings
- **D3**: InputBar → FAB «+» → overlay
- **D4**: Парсинг-превью перед подтверждением

### CategoryModal (bottom sheet)

- **A1**: Swipe-to-edit/delete на транзакциях
- **B5**: Группировка по дням с итогами
- **B2**: Swipe actions

### Новые экраны

| Экран | Что содержит | Откуда gap |
|-------|-------------|-----------|
| **TransactionDetail** | Форма редактирования: сумма, валюта, категория (picker), дата, комментарий. Кнопки «Сохранить» и «Удалить» | A1 |
| **Settings** | CRUD категорий (drag-to-reorder, edit, delete), основная валюта, backup export/import, версия | A5 |
| **Операции** (TransactionList) | Хронологический список с группировкой по дням, поиск, фильтры | A2, B4, B5 |

### Bottom navigation

Рекомендуемая структура tab bar:

| Таб | Иконка | Экран | Появляется |
|-----|--------|-------|-----------|
| Главная | 📊 chart | MainScreen (donut + categories) | Этап 1.5 |
| Операции | 📋 list | TransactionList | Этап 1.5 |
| Настройки | ⚙️ gear | Settings | Этап 1.5 |
| Тренды | 📈 trend | Trends (пустой state: «Скоро») | v2 |

---

## Рекомендация по приоритетам

### Этап 1.5 (до подключения БД и backend)

Фронт-only изменения, не требующие IndexedDB или сервера.
Ориентировочно 5-8 дней.

| # | Gap | Сложность | Обоснование |
|---|-----|-----------|-------------|
| A1 | CRUD транзакций (edit/delete) | M | Без этого нельзя исправить ошибку ввода — deal-breaker |
| A2 | TransactionList с группировкой по дням | M | Основной view для повседневного использования |
| A4 | Feedback при добавлении (toast + undo) | S | Критично для доверия: «я ввёл, и оно записалось правильно?» |
| A5 | Settings экран (базовый: CRUD категорий) | M | Нет способа управлять категориями после онбординга |
| B1 | Bottom navigation (3 таба) | M | Инфраструктура для новых экранов |
| B3 | Emoji-иконки в CatDot | S | Уже в данных, нужно только вывести |
| D2 | Аватар → кнопка Settings | S | Одна строка кода, большой UX-эффект |
| D3 | InputBar → FAB + overlay | M | Разрешает конфликт с bottom nav |

### Этап 2 (вместе с IndexedDB + backend)

| # | Gap | Обоснование |
|---|-----|-------------|
| A3 | PeriodPicker (год + custom range) | Имеет смысл когда есть данные за несколько месяцев |
| B2 | Swipe actions | Нужен TransactionList (из 1.5) + жесты |
| B4 | Поиск по транзакциям | Нужен при 100+ записях (после импорта CSV) |
| B6 | Иконка микрофона (stub → Whisper) | Backend для Whisper API |
| B7 | Quick-add через категорию | Альтернативный метод ввода, после стабилизации основного |
| B8 | Мультивалютность в UI | Этап 12 по plan.md |
| D4 | Парсинг-превью | Связано с улучшением NL-парсера (этап 8) |
| C4 | Тёмная тема | Токены готовы, media query + toggle |

### Этап 3+

| # | Gap | Обоснование |
|---|-----|-------------|
| C1 | Теги/лейблы | Требует изменения data model |
| C2 | Тренды и сравнение периодов | Нужны данные за 3+ месяцев |
| C3 | Повторяющиеся транзакции | Этап 19 по plan.md |
| C5 | Бюджеты/лимиты | Этап 17 по plan.md |
| C6 | FinHealth | Требует аналитики на больших данных |
| C7 | Receipt scanning | Этап 24 по plan.md |

---

## Что нужно от пользователя

Отметь что берём в работу. Gap'ы сгруппированы по приоритету.

### Этап 1.5 (фронт-only, до БД)

- [ ] A1. CRUD транзакций (редактирование + удаление + swipe)
- [ ] A2. Хронологический TransactionList с группировкой по дням
- [ ] A4. Feedback при добавлении транзакции (toast + undo)
- [ ] A5. Settings экран (CRUD категорий, валюта, backup)
- [ ] B1. Bottom navigation (3 таба: Главная, Операции, Настройки)
- [ ] B3. Emoji-иконки категорий в CatDot
- [ ] D2. Аватар «К» → кнопка перехода в Settings
- [ ] D3. InputBar → FAB «+» → input overlay

### Этап 2 (с IndexedDB + backend)

- [ ] A3. PeriodPicker (месяц + год + произвольный период)
- [ ] B2. Swipe actions (edit/delete) на транзакциях
- [ ] B4. Поиск по транзакциям
- [ ] B6. Иконка микрофона (stub сейчас, Whisper в v2)
- [ ] B7. Quick-add через тап на категорию (numpad popup)
- [ ] B8. Мультивалютность в UI (символы валют, конвертация)
- [ ] D4. Парсинг-превью NL-ввода перед подтверждением
- [ ] C4. Тёмная тема

### Этап 3+ (отложенное)

- [ ] C1. Теги/лейблы
- [ ] C2. Тренды и сравнение периодов
- [ ] C3. Повторяющиеся транзакции
- [ ] C5. Бюджеты/лимиты на категорию
- [ ] C6. FinHealth / индекс финансового здоровья
- [ ] C7. Receipt scanning (OCR)
