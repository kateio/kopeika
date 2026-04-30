# Wallet by BudgetBakers

## Краткое описание

**Wallet** — популярное приложение для управления личными финансами от чешской компании **BudgetBakers** (Прага). Одно из самых скачиваемых финансовых приложений в Европе — более 10 миллионов загрузок в Google Play.

- **Платформы:** iOS (17.0+), Android, Web (web.budgetbakers.com)
- **Модель монетизации:** Freemium
  - Бесплатная версия с ограничениями (до 3 банковских аккаунтов, реклама)
  - Premium Monthly: $5.99/мес
  - Premium 3 месяца: $14.99
  - Premium Annual: $21.99/год
  - Premium 3 года: $49.99
  - Lifetime Premium: $19.99 (акционная цена)
- **Рейтинги:** 4.6/5 в App Store (5.8K отзывов), 4.5/5 в Google Play (374K отзывов)
- **Разработчик:** BudgetBakers s.r.o., Прага, Чехия

## Скриншоты

![Главный экран Wallet](https://img.utdstc.com/screen/e34/d97/e34d97dcdeca65ba244c0ff800ba421ada23a9f5162b19e1d788865a0c0b51d0)
![Обзор транзакций](https://img.utdstc.com/screen/ddd/dd9/ddddd9e0239769a503e34260765e4a32c03156090f234eebee8af75da9f76802)
![Графики и отчёты](https://img.utdstc.com/screen/bb7/f65/bb7f65535824011b252490c55fdb83bd112d9e50a19fa41a2b248592dff4263c)
![Бюджеты](https://img.utdstc.com/screen/70f/06b/70f06b84c45f07a9606fe6af26ec8ebf797af95942a9563ddae45163bebf082a)
![Настройки категорий](https://img.utdstc.com/screen/c37/591/c37591e70d2fd3fdb5c2a7d56a99add20d32cf787bad9368aa6ed949aa65616d)

## Реализация целевых фич

### Импорт файлов

Wallet поддерживает импорт в формате **CSV** и **OFX** (Open Financial Exchange 2.2). Основные особенности:
- Поддержка десятичных точек и запятых (150.50 или 150,50), но **не поддерживает разделители тысяч**
- Суммы только в формате left-to-right (-100.00, а не 100.00-)
- Рекомендуемый максимум — 1000 строк на файл
- Автоматическая категоризация импортированных записей
- Возможность создавать правила автокатегоризации с ключевыми словами (например, "restaurants → категория Рестораны")
- Существуют сторонние утилиты на GitHub для упрощения импорта CSV

**Источник:** [Wallet Help Center — Import](https://support.budgetbakers.com/hc/en-us/articles/7077275632274-Import-your-transactions-or-files)

### Текстовый ввод

**Natural-language ввод не поддерживается.** Ввод транзакции осуществляется через стандартную форму: выбор счёта, ввод суммы, выбор категории, дата, заметка. Пользователи могут "easily add cash transactions and custom expenses manually" через интерфейс формы.

### Голосовой ввод

**Не поддерживается.** В документации и на официальном сайте нет упоминаний голосового ввода транзакций.

### Автокатегоризация

Wallet использует **машинное обучение** для автоматической категоризации:
- AI обучается на привычках пользователя и автоматически категоризирует новые транзакции
- Поддерживается более 50 категорий расходов
- Работает как для банковской синхронизации, так и для импортированных файлов
- Пользователь может корректировать категории — система учится на исправлениях
- Можно создавать правила автокатегоризации на основе ключевых слов

Цитата пользователя: *"The great thing about it is I don't have to remember every single thing. I can just check the app in the evening and make sure the categories are correct."*

**Источник:** [BudgetBakers — Expense Tracking](https://budgetbakers.com/en/products/wallet/features/expense-tracking/)

### Кастомные категории

- **Основные категории нельзя создавать** — только переименовывать существующие (ограничение структуры данных)
- **Подкатегории** можно создавать свободно
- Дополнительно доступны **Labels (метки)** — неограниченное количество, с фильтрацией в отчётах и графиках
- Иконки для категорий предустановленные

**Источник:** [Wallet Help Center — Categories](https://support.budgetbakers.com/hc/en-us/articles/7077082048146-All-about-Categories-and-Subcategories)

### Графики и отчёты

- Детальные графики и диаграммы на дашборде (настраиваемые виджеты)
- Фильтры по периодам, категориям, счетам, меткам
- Анализ денежного потока (cash flow)
- Трекинг бюджетов с визуализацией прогресса
- Экспорт данных в CSV
- Прогнозные оповещения (predictive alerts)

**Источник:** [BudgetBakers — Filters](https://support.budgetbakers.com/hc/en-us/articles/7076754432146-Working-with-Filters)

### PWA или нативное?

- **Нативные приложения** для iOS и Android
- **Web-версия** доступна на web.budgetbakers.com (полноценное веб-приложение, не PWA)
- Синхронизация между устройствами через облако

## Плюсы и минусы по отзывам

### Плюсы

- *"Helped me a lot with saving money. It's easy to use and user-friendly."* — Yasin Geddi, App Store
- *"Superb for student expense, business and travelling or anything actually"* — Jakob Baumgartner, App Store
- *"Truly the best, I track week by week, month by month...can budget REALISTICALLY"* — kelliejaide, App Store
- Простой и понятный UI, много категорий, быстрая работа — Google Play
- Поддержка множества валют — обзоры
- Синхронизация с 15,000+ банков — [BudgetBakers](https://budgetbakers.com/en/)
- Рейтинг 4.5-4.6 звёзд на обеих платформах

### Минусы

- *"Bank connection failed error...unable to access my banking info making this app of zero use"* — Jleigh58, App Store
- *"Cross-platform sync issues...data between iOS device and web app"* — ajjamfadi, App Store (проблема не решалась год)
- Критический баг: сотни транзакций повреждены и необратимо изменены одновременно в нескольких счетах — [TechRadar](https://www.techradar.com/reviews/wallet-finance-management)
- Реклама в бесплатной версии после обновления — Google Play
- В бесплатной версии ограничение в 3 банковских аккаунта — [Trustpilot](https://www.trustpilot.com/review/budgetbakers.com)
- Невозможно создавать свои основные категории, только переименовывать — Help Center

## Что взять себе

1. **Система Labels (меток)** в дополнение к категориям — позволяет гибкую фильтрацию и отчётность без усложнения структуры категорий. Для kopeika можно реализовать теги как first-class entity.
2. **Правила автокатегоризации на основе ключевых слов** — простой и понятный механизм, который пользователь может сам настраивать, не разбираясь в ML. Хорошее дополнение к AI-категоризации.
3. **Настраиваемый дашборд с виджетами** — пользователь сам выбирает, какие графики и данные видеть на главном экране. Повышает вовлечённость и удовлетворённость.
