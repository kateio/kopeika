# Money Lover

## Краткое описание

**Money Lover** — трекер расходов и приложение для бюджетирования от вьетнамской компании **Finsify JSC** (ранее Finsify Technology Co., Ltd). Приложение существует с 2013 года, имеет более 10 млн скачиваний и было признано Google "Top Developer" и "Editor's Choice" (с 2016 года). Награда "Best Android App 2017".

**Платформы:** iOS (15.0+), iPadOS, Android, macOS (Apple M1+), watchOS, Windows (Microsoft Store), **Web-версия** (web.moneylover.me).

**Модель монетизации:** Freemium.
- Бесплатная версия: базовый функционал с рекламой, ограничение на 2 кошелька и 1 устройство.
- Premium (разовая покупка): $19.99 — безлимитные кошельки, бюджеты, синхронизация, экспорт, без рекламы.
- Linked Wallet (подключение банков): $2.49–$2.99/мес.
- Дополнительные покупки: пакеты иконок $1.99–$9.99.
- В России ранее указывались цены ~149 руб./мес, ~899 руб./год.

**Рейтинги:** 4.6/5 в App Store (2.2K оценок), 3.6/5 в Google Play (5M+ скачиваний).

## Скриншоты

Прямые ссылки на скриншоты из App Store / Google Play недоступны (Google Play и App Store не предоставляют прямые URL изображений для внешних ссылок). Скриншоты можно посмотреть по ссылкам:

- [Money Lover в App Store](https://apps.apple.com/us/app/money-lover-money-manager/id486312413)
- [Money Lover в Google Play](https://play.google.com/store/apps/details?id=com.bookmark.money&hl=en)
- [Скриншоты интерфейса на Templateshake](https://templateshake.com/product/money-lover-expense-manager/)

## Реализация целевых фич

### Импорт файлов

Money Lover **не поддерживает импорт** банковских выписок и CSV/OFX/QIF файлов в полноценном смысле. Основной способ добавления транзакций — ручной ввод или подключение банковского счета (Linked Wallet, платная функция).

**Экспорт:** Premium-подписчики могут экспортировать данные в CSV, Excel и Google Sheets. Доступен выбор периода, кошелька и категорий для экспорта.

Существует стороннее приложение [Money Lover Export Tool](https://play.google.com/store/apps/details?id=com.zoostudio.moneylover.mlexcelexporter) для экспорта в CSV/Excel.

### Текстовый ввод

Да, поддерживается **AI-ввод в формате natural language**. Функция называется "MoneyLover Assistant" и позволяет вводить транзакции в разговорном стиле:

- Пример: "Family Wallet: breakfast $5, bus ticket $2"
- Приложение автоматически распознает сумму, категорию и заметки
- Поддерживается ввод нескольких транзакций одним сообщением
- AI автоматически распределяет транзакции по категориям (завтрак → Breakfast, билет на автобус → Transportation)

Обычный ввод транзакции включает: выбор кошелька, сумма, категория, заметки, контакт, локация, событие, фото.

### Голосовой ввод

Нативного голосового ввода в Money Lover **нет**. Существуют сторонние альтернативы (например, Vocash), которые позиционируют себя как "voice money tracker" в противовес Money Lover. Однако AI-ассистент MoneyLover позволяет текстовый ввод в свободной форме, что частично компенсирует отсутствие голосового ввода.

### Автокатегоризация

- AI-ассистент автоматически распознает категории из текстового описания транзакции
- Для повторяющихся расходов приложение предлагает автоматическое определение категории
- Поддержка сканирования чеков (квитанций) с автоматическим распределением покупок по категориям
- Автоматическая категоризация SMS-уведомлений от банков (Premium)

Качество: по отзывам, базовая категоризация работает корректно для типовых трат, но иногда требует ручной корректировки.

### Кастомные категории

Да, полная поддержка:
- 16+ предустановленных категорий расходов и доходов
- Возможность создавать неограниченное количество собственных категорий
- **Глобальные категории** (с версии 8.0): создаёшь категорию один раз — она автоматически назначается во все кошельки
- Можно гибко включать/выключать категории в разных кошельках
- Кастомизируемые иконки (часть бесплатных, дополнительные пакеты иконок — платные, ~$1.99–$3.50)
- Подкатегории: информация о нативных подкатегориях не найдена, но глобальные категории позволяют организовать иерархию

### Графики и отчёты

- **Круговые диаграммы** (pie charts) расходов по категориям
- **Столбчатые диаграммы** (bar charts) трендов
- Анализ трендов расходов по категориям за несколько месяцев
- Фильтры по периодам: день, неделя, месяц, год, произвольный период
- Фильтры по кошелькам и категориям

**Минусы отчётов:** по отзывам, раздел отчётов — слабое место приложения. Нет годового обзора, нет обзора "за всё время". Интерфейс отчётов "не самый удобный" (по отзыву с Medium).

Экспорт отчётов: в CSV/Excel/Google Sheets (Premium).

### PWA или нативное?

- **Нативные приложения:** iOS, Android
- **Web-версия:** [web.moneylover.me](https://web.moneylover.me/) — работает в браузере, доступна Premium-пользователям
- **Desktop:** доступно через WebCatalog Desktop (обёртка), Microsoft Store (Windows)
- Не является полноценным PWA в техническом смысле, но веб-версия позволяет использовать приложение без установки
- Синхронизация между устройствами через облако

## Плюсы и минусы по отзывам

### Плюсы

- "Easy to use and convenient" — Google Play
- "The UI is very simple, and the feature for loans is convenient compared to other managers" — [Reddit](https://redditfavorites.com/android_apps/money-lover-budget-planner-expense-tracker)
- "Money Lover is completely independent of all financial institutions, so anyone in any country can use it" — Reddit
- "Pretty graphs displaying expense categories" — [Ringgit Oh Ringgit](https://ringgitohringgit.com/commentary/money-lover-review/)
- "Not bombarded with ads" — Google Play
- "Helped me track remaining money and reach savings goals" — App Store (отзыв 13-летнего пользователя)
- Поддержка 29 языков, мультивалютность с актуальными курсами

### Минусы

- "Reporting — the most important part of an expense tracker — does not deliver well" — [Medium](https://medium.com/@yosefsid/product-review-money-lover-great-expense-tracker-1dd00da18a41)
- "You cannot import data from previous apps, making transitioning to Money Lover very time-consuming" — Reddit
- "You can't set one budget to all wallets" — Reddit (если 9 кошельков — нужно 9 бюджетов на каждую категорию)
- "When buying premium, you should get all features, but unfortunately you still have to pay extra for icons" — Reddit
- "Recurring transactions reported as buggy" — [Ringgit Oh Ringgit](https://ringgitohringgit.com/commentary/money-lover-review/)
- Проблемы с синхронизацией и краши после длительного использования — Google Play
- "Apps have ads — the app feels cheap" (о бесплатной версии) — App Store

## Что взять себе

1. **AI-ввод транзакций в свободной форме** — функция MoneyLover Assistant, позволяющая вводить "breakfast $5, bus ticket $2" и получать автоматическую разбивку по категориям, — отличный UX-паттерн для kopeika. Это значительно ускоряет ввод и снижает порог входа.

2. **Глобальные категории с гибким управлением** — система, где категория создаётся один раз и автоматически распространяется на все кошельки с возможностью включения/выключения, — элегантное решение для мультикошелькового сценария.

3. **Виджет для быстрого ввода** — возможность логировать транзакцию прямо с домашнего экрана без открытия приложения. Для PWA можно реализовать аналог через Web Share Target API или notification actions.
