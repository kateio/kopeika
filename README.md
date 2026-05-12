# Копейка

**iOS-first PWA для учёта личных финансов** с текстовым вводом транзакций, автокатегоризацией и импортом банковских выписок.

## Стек

- **React 18** + **TypeScript 5** (strict mode)
- **Vite 5** — сборка и dev-сервер
- **TailwindCSS 3** — стилизация
- **React Router 6** — роутинг
- **Vitest** + Testing Library — тесты
- **vite-plugin-pwa** — PWA (service worker, manifest)

## Разработка

```bash
# Установка зависимостей
npm install

# Dev-сервер
npm run dev

# Проверка типов
npm run typecheck

# Линтинг
npm run lint

# Тесты
npm test

# Production-сборка
npm run build
```

## Запуск на iPhone

1. Запусти dev-сервер с доступом по сети:
   ```bash
   npm run dev -- --host
   ```
2. Найди IP компьютера в локальной сети (например, `192.168.1.100`)
3. Открой на iPhone в Safari: `http://192.168.1.100:5173`
4. Для установки как PWA: Safari → Поделиться → На экран «Домой»

## Структура проекта

```
src/
├── components/    # Переиспользуемые UI-компоненты
├── screens/       # Экраны приложения
├── uikit/         # Страница UI Kit (/uikit)
├── data/          # Mock-данные
├── types/         # TypeScript-типы
├── lib/           # Утилиты
└── App.tsx        # Роутер
```

## Документация

- [План проекта](docs/plan.md)
- [Анализ конкурентов](docs/research/README.md)
- [Анализ дизайна](docs/design/README.md)

## Статус

**Этап 1** — каркас приложения. Mock-данные, без backend и БД.
