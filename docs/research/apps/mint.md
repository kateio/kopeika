# Mint (Intuit)

## Краткое описание

**Mint** — одно из старейших и самых массовых приложений для учёта личных финансов. Создано **Аароном Патцером** в **2007 году**, приобретено **Intuit** за $170 млн в 2009 году. На пике обслуживало **более 17 миллионов пользователей**. К моменту закрытия оставалось **3.6 миллиона** активных пользователей.

**Закрыто 23 марта 2024 года.** Пользователи перенаправлены в Credit Karma (также принадлежит Intuit), что вызвало массовое разочарование — Credit Karma не имеет полноценных функций бюджетирования.

- **Платформы:** iOS, Android, Web (mint.intuit.com)
- **Модель монетизации:** Бесплатно (freemium)
  - Основной функционал — полностью бесплатно
  - Ad-free мобильная версия: $0.99/мес
  - Premium (только iOS): $4.99/мес
  - Монетизация через рекламу финансовых продуктов и партнёрские рекомендации
- **Рейтинг:** ~4.0/5 (исторический)
- **Разработчик:** Intuit Inc., Mountain View, California, USA

## Скриншоты

Приложение закрыто, прямые скриншоты больше недоступны в сторах. Исторические изображения интерфейса можно найти в обзорах:
- [CRM.org — Intuit Mint Review](https://crm.org/news/intuit-mint-review)
- [Cash and Coffee Club — Mint Review](https://cashandcoffeeclub.com/mint-by-intuit-budget-app/)
- [Intuit — All New Mint iOS App](https://investors.intuit.com/news-events/press-releases/detail/196/all-new-mint-ios-app-launched-to-empower-financial-freedom)

## Реализация целевых фич

### Импорт файлов

**Импорт CSV не поддерживался** нативно — это была одна из самых частых жалоб пользователей. Mint полагался исключительно на автоматическую банковскую синхронизацию (20,000+ финансовых институтов).

- **Экспорт** был доступен в CSV и JSON
- Для импорта существовали **сторонние Python-скрипты** на GitHub
- При закрытии Mint экспортированные CSV содержали дублирующие записи и потерю подкатегорий

**Источник:** [Quora — Why doesn't Mint allow CSV import?](https://www.quora.com/Why-doesnt-mint-com-allow-csv-import)

### Текстовый ввод

**Natural-language ввод не поддерживался.** Mint был ориентирован на автоматическую синхронизацию банковских транзакций, а не на ручной ввод. Пользователи могли добавлять транзакции вручную через стандартную форму, но это не было основным сценарием использования.

### Голосовой ввод

**Информация не найдена.** В документации и обзорах Mint нет упоминаний голосового ввода или интеграции с Siri/Google Assistant для добавления транзакций.

### Автокатегоризация

Mint использовал **автоматическую категоризацию на основе vendor name (имени торговца)**:

- Система запоминала категорию **по названию продавца**, а не по типу покупки
- Ограничение: если в Target покупались продукты, а потом одежда — вторая покупка категоризировалась как "продукты"
- Пользователи могли создавать **правила (Rules)**: "always categorize [vendor] as [category]" — это применялось ко всем прошлым и будущим транзакциям
- Автокатегоризация была *"accurate for the most part"*, но требовала регулярных ручных корректировок
- Система **не использовала ML** — правила были простыми, на основе string matching по vendor name

**Источник:** [MetaFilter](https://ask.metafilter.com/240947/mintcom-I-wish-I-could-avoid-automatic-categories), [Kosher on a Budget](https://kosheronabudget.com/mint-com-tutorial-part-2-how-to-categorize-expenses/)

### Кастомные категории

- **Основные (дефолтные) категории нельзя было удалить** или переименовать
- Можно было создавать **кастомные подкатегории** без ограничений
- Для скрытия ненужных дефолтных категорий существовал **browser extension** — [Mint.com Customize Default Categories](https://github.com/schrauger/mint.com-customize-default-categories)
- Цветовая кодировка категорий для визуализации

**Источник:** [Annielytics — 8 Ways to Customize Mint](https://www.annielytics.com/blog/personal/8-ways-customize-mint-make-budgeting-easier/)

### Графики и отчёты

- **Trends** — фирменная фича: bar graphs и pie charts для анализа расходов, доходов, чистого дохода, активов, долгов и net worth
- Фильтры по **настраиваемым периодам** (daily, weekly, monthly, yearly)
- **MintSights** (iOS) — персонализированные тренды на основе паттернов расходов
- Цветовые категории для визуального различения
- **Net worth tracking** — отслеживание чистого капитала во времени
- Уведомления о приближении к лимитам бюджета

**Источник:** [CRM.org — Mint Review](https://crm.org/news/intuit-mint-review), [AccountsJunction](https://www.accountsjunction.com/software/intuit-mint)

### PWA или нативное?

- **Нативные приложения** для iOS и Android
- **Web-версия** (mint.intuit.com) — полноценное веб-приложение с доступом ко всем функциям
- Адаптивный дизайн для desktop/laptop
- **PWA не было** — классическое веб-приложение

## Плюсы и минусы по отзывам

### Плюсы

- *"Mint is completely free to use"* с полным набором функций — [CRM.org](https://crm.org/news/intuit-mint-review)
- *"Integrates all personal finance accounts in one place"* — единый дашборд для всех аккаунтов — [CRM.org](https://crm.org/news/intuit-mint-review)
- *"Beautifully display your spending patterns over time with its Trends reports"* — визуализация трендов — обзоры
- Net worth tracking и мониторинг инвестиций — бесплатно
- Поддержка 20,000+ финансовых институтов
- Простота использования — *"the default free budgeting app for over a decade"* — [ExpenseSumo](https://www.expensesumo.com/blog/best-mint-alternatives)
- Bill reminders и отслеживание подписок
- *"It helped people take control of their finances, set financial goals, and feel less anxious about money"* — [OrbitMoney](https://orbitmoney.io/blog/what-happened-to-mint)

### Минусы

- *"Account linking breaks, categorization needs constant fixing"* — [FinancialAha](https://www.financialaha.com/articles/mint-alternatives-after-shutdown/)
- *"The whole service can just disappear"* — потеря годов данных при закрытии — [FinancialAha](https://www.financialaha.com/articles/mint-alternatives-after-shutdown/)
- Таргетированная реклама финансовых продуктов в бесплатной версии — [CRM.org](https://crm.org/news/intuit-mint-review)
- Невозможность импорта CSV — только банковская синхронизация
- Нельзя удалить дефолтные категории
- Нет поддержки множества валют (multi-currency) — [CRM.org](https://crm.org/news/intuit-mint-review)
- Нет совместных аккаунтов (joint accounts)
- Автокатегоризация на основе vendor name — не различает типы покупок в одном магазине
- *"Weak monetization model (advertisements and referrals)"* — привело к закрытию — [LogRocket](https://blog.logrocket.com/product-management/why-is-the-mint-app-shutting-down/)
- Credit Karma как замена — *"not a budgeting tool"* — разочарование пользователей

## Уроки закрытия Mint

### Почему закрылся?

1. **Нежизнеспособная бизнес-модель**: бесплатное приложение с дорогими data aggregators теряет деньги на каждом пользователе
2. **Стратегическая консолидация**: после покупки Credit Karma ($8.1B в 2020) Intuit объединил ресурсы
3. **Технический долг**: годы разработки создали legacy-код, требующий дорогой модернизации
4. **Misalignment**: Mint не вписывался в приоритеты Intuit (TurboTax, QuickBooks — чёткая монетизация)

### Вывод

*"A free personal finance app is not a viable business"* — даже с 17M пользователей невозможно окупить затраты на data aggregation без чёткой модели монетизации.

## Что взять себе

1. **Data ownership и экспорт** — главный урок Mint: пользователи потеряли годы данных. Для kopeika критически важно обеспечить полный экспорт данных в открытых форматах (CSV, JSON) и прозрачную политику владения данными. PWA с local-first архитектурой решает эту проблему — данные на устройстве пользователя.
2. **Freemium, а не free** — Mint доказал, что полностью бесплатная модель нежизнеспособна. Для kopeika стоит продумать устойчивую freemium-модель с чётким value proposition для платной версии, но без рекламы финансовых продуктов.
3. **Trends как killer feature** — визуализация трендов расходов была самой ценной фичей Mint. Для kopeika стоит реализовать мощные Trends с фильтрами по периодам, категориям и тегам — это то, что удерживает пользователей месяцами.
