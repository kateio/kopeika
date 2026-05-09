# 04. Рекомендации для kopeika — конкретный план

> **Проект:** kopeika (iOS-first PWA для учёта финансов)
> **Figma файл:** `G6uJMia6jzgTEDJbjQiCVW`
> **Тариф Figma:** Pro
> **Оборудование:** macOS (локально) + Linux VM в Германии (удалённо)
> **Дата:** 2026-05-09

**Смежные документы:**
- [01-remote-vs-local.md](./01-remote-vs-local.md) — почему удалённо не работает
- [02-figma-api-mcp-ecosystem.md](./02-figma-api-mcp-ecosystem.md) — обзор API и MCP
- [03-design-system-best-practices.md](./03-design-system-best-practices.md) — как делать дизайн-систему

---

## Содержание

1. [Текущее состояние Figma-файла](#1-текущее-состояние-figma-файла)
2. [Целевое состояние](#2-целевое-состояние)
3. [План перехода: три этапа](#3-план-перехода-три-этапа)
4. [Что настроить на Mac прямо сейчас](#4-что-настроить-на-mac-прямо-сейчас)
5. [Workflows: Figma ↔ код](#5-workflows-figma--код)
6. [Ограничения Figma Pro](#6-ограничения-figma-pro)
7. [Чеклист готовности](#7-чеклист-готовности)

---

## 1. Текущее состояние Figma-файла

### Что есть

| Элемент | Описание |
|---------|----------|
| **Page 1** | Один фрейм 2118×5881 — плоский импорт `Копейка.html` через `html-to-design` |
| **Page 2 «референсы»** | Пользовательские изображения и iPhone mockups |
| **Компоненты (Components)** | Нет — все элементы являются фреймами |
| **Variables** | Нет — все цвета hardcoded |
| **Auto-layout** | Нет — позиционирование абсолютное |
| **Стили (Styles)** | Нет — типографика задана inline |

### Что это значит

Текущий файл — **визуальный референс**, а не рабочий дизайн. Он полезен как отправная точка (все 10 экранов видны, цветовая палитра определена, компоненты визуально существуют), но не позволяет:

- Менять кнопку в одном месте и видеть изменение на всех экранах
- Переключать светлую/тёмную тему
- Экспортировать дизайн-токены в код
- Программно обновлять элементы через AI

Подробнее о разнице между плоским дизайном и дизайн-системой: [03-design-system-best-practices.md, раздел 1](./03-design-system-best-practices.md#1-основы-component-vs-frame-vs-group).

---

## 2. Целевое состояние

### Архитектура Figma-файла

```
Файл: Копейка (G6uJMia6jzgTEDJbjQiCVW)
│
├── Page: _Components          ← master-компоненты
│   ├── Atoms/
│   │   ├── Icon (Component Set: 15+ вариантов категорий)
│   │   ├── Badge
│   │   └── Divider
│   ├── Molecules/
│   │   ├── Button (Component Set: Style × Size)
│   │   ├── InputField (Component Set: State)
│   │   └── CategoryChip
│   └── Organisms/
│       ├── TransactionRow (Component Set: Type)
│       ├── CategoryCard (Component Set: Size)
│       ├── DonutChart
│       └── Header
│
├── Page: Screens              ← экраны собраны из instances
│   ├── 01-Start
│   ├── 02-Main-Expenses
│   ├── 03-Main-Income
│   ├── ...
│   └── 10-March-Expenses
│
├── Page: Референсы            ← текущая Page 2
│
└── Variables
    ├── Collection: Primitives  (green-500, red-500, gray-100...)
    ├── Collection: Semantic    (primary, expense, income... + Mode Dark)
    └── Collection: Spacing     (xs=4, sm=8, md=16, lg=24, xl=32)
```

### Что это даёт

| Возможность | Без дизайн-системы | С дизайн-системой |
|-------------|:---:|:---:|
| Изменить Button → обновится на 10 экранах | Ручная правка × 10 | Автоматически |
| Переключить тёмную тему | Невозможно | Variables Mode переключает все цвета |
| AI меняет master компонент | N операций, хрупко | 1 операция |
| Экспорт токенов в Tailwind | Руками | Programmatic (Variables → CSS) |
| Добавить новый экран | Копировать и расставлять | Drag-and-drop instances |

---

## 3. План перехода: три этапа

### Этап A: Manual cleanup (пользователь руками в Figma)

**Трудоёмкость:** 3–5 часов
**Кто делает:** Kate в Figma вручную

Этот этап делается руками, потому что:
- Требует визуальных решений (какие элементы являются вариантами одного компонента)
- Figma UI для создания компонентов — drag-and-drop, быстрее любой автоматизации
- Однократная работа, не требует повторения

**Последовательность:**

#### A1. Создать страницу `_Components`
Отдельная страница в Figma для master-компонентов. Знак `_` в начале — convention, чтобы страница была первой в списке.

#### A2. Создать Variables
1. **Collection «Primitives»** — вытащить все уникальные цвета из текущего фрейма:
   - Зелёный основной (primary) — из кнопок
   - Красный (expense) — из расходов
   - Серые (100, 200, 300...) — из фона и текста
   - Белый, чёрный
2. **Collection «Semantic»** — алиасы:
   - `primary` → Primitives/green-500
   - `expense` → Primitives/red-500
   - `income` → Primitives/green-500
   - `background` → Primitives/white
   - `text-primary` → Primitives/gray-900
   - Добавить Mode «Dark» (пока можно с placeholder-значениями)
3. **Collection «Spacing»** — xs(4), sm(8), md(16), lg(24), xl(32)

> На Figma Pro доступно до 4 коллекций и 10 modes на коллекцию — этого достаточно.

#### A3. Создать атомарные компоненты
Из плоского фрейма выделить и превратить в Components:
- **Icon** — Component Set с вариантами для категорий (🍕 Еда, 🚌 Транспорт, 💅 Красота и т.д.)
- **Badge**, **Divider**

#### A4. Создать молекулы
- **Button** — Component Set:
  - `Style`: Primary / Secondary / Ghost
  - `Size`: Large / Medium
  - Boolean: `Show Icon`
  - Привязать цвета к Variables, spacing к auto-layout
- **InputField** — Component Set с состояниями
- **CategoryChip** — выбранная/невыбранная категория

#### A5. Создать организмы
- **TransactionRow** — строка транзакции с instance swap иконки
- **CategoryCard** — карточка с прогрессом
- **Header** — шапка экрана
- **DonutChart** — можно оставить как frame (диаграмма сложна для компонентизации)

#### A6. Пересобрать экраны из instances
На странице `Screens` собрать 10 экранов из instance компонентов. Старый плоский фрейм сохранить на отдельной странице как референс.

#### A7. Верификация
- [ ] Изменить цвет `primary` в Variables → проверить что обновился везде
- [ ] Изменить master Button → проверить что instances обновились
- [ ] Переключить Mode Dark → проверить что цвета переключаются

Подробный чеклист: [03-design-system-best-practices.md, раздел 8](./03-design-system-best-practices.md#8-чеклист-перехода-от-плоского-дизайна-к-дизайн-системе).

---

### Этап B: Настройка AI-автоматизации для итеративных изменений

**Трудоёмкость:** 30 минут на настройку
**Кто делает:** Kate на Mac

После завершения этапа A у нас есть полноценная дизайн-система. Теперь настраиваем AI для программного обновления.

#### B1. Установить Figma MCP в Claude Code (основной инструмент)

```bash
# На macOS в терминале:
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

При первом вызове Claude Code попросит авторизоваться в Figma через OAuth в браузере.

**Что это даёт:**
- `get_design_context` — читать структуру файла, компоненты, стили, переменные
- `generate_figma_design` — конвертировать HTML/код в Figma-дизайн
- `use_figma` — создавать и модифицировать элементы в Figma

**Лимиты на Pro:** 200 tool calls/день (бета — сейчас бесплатно).

Подробнее: [02-figma-api-mcp-ecosystem.md, раздел 3.1](./02-figma-api-mcp-ecosystem.md#31-figma-dev-mode-mcp-официальный).

#### B2. Установить Framelink MCP (дополнительный read-only)

```bash
# Получить PAT: Figma → Settings → Personal Access Tokens → Generate
# Затем в Claude Code:
claude mcp add figma-read -- npx -y figma-developer-mcp --figma-api-key=<FIGMA_PAT>
```

**Что это даёт:** быстрое чтение конкретных фреймов/нод без OAuth.

#### B3. Workflow: из кода → в Figma

Сценарий: вы изменили компонент в коде (React + Tailwind) и хотите обновить Figma.

```
1. Claude Code читает ваш React-компонент (Button.tsx)
2. Claude генерирует HTML с аналогичной вёрсткой
3. Через generate_figma_design конвертирует HTML → Figma frame
4. Новый фрейм появляется на отдельной странице «_Import»
5. Вы руками: сравниваете с master компонентом, переносите изменения
```

> **Важно:** `html-to-design` создаёт **новый плоский фрейм**, а не обновляет существующий компонент.
> Это работает как «визуальный diff» — вы видите, как должен выглядеть результат, и переносите изменения в master component руками.

#### B4. Workflow: из Figma → в код

Сценарий: вы изменили дизайн в Figma и хотите обновить код.

```
1. Claude Code через get_design_context читает обновлённый Figma-файл
2. Видит изменения в компоненте (новый цвет, размер, свойства)
3. Генерирует обновлённый React-компонент
4. Вы ревьюите diff и принимаете изменения
```

Этот workflow работает как на macOS (локально), так и на VM (через PAT + Framelink).

---

### Этап C: Продвинутая автоматизация (опционально)

**Когда:** когда дизайн-система стабилизирована и есть желание автоматизировать глубже.

#### C1. TalkToFigma MCP — полный read/write через Plugin API

Единственный способ **программно изменить master component** (не создать новый фрейм):

```bash
# 1. Установить плагин TalkToFigma в Figma:
#    https://www.figma.com/community/plugin/1485687494525374295

# 2. Запустить WebSocket сервер:
bunx cursor-talk-to-figma-mcp

# 3. Добавить MCP в Claude Code:
claude mcp add talk-to-figma -- bunx cursor-talk-to-figma-mcp
```

**Что можно делать:**
- `set_fill_color` — изменить цвет заливки master компонента
- `set_corner_radius` — изменить скругление
- `set_text_content` — изменить текст
- `create_component` — создать новый компонент
- `create_component_set` — создать Component Set из компонентов

**Ограничения:**
- Требует открытый Figma на Mac + запущенный плагин
- WebSocket-соединение через `ws://localhost:3055`
- Работает ТОЛЬКО локально (на VM — нестабильно, см. [01-remote-vs-local.md](./01-remote-vs-local.md))

#### C2. Code Connect (Figma → код, для синхронизации)

Code Connect привязывает Figma-компоненты к React-компонентам. Когда разработчик в Figma Dev Mode смотрит на компонент — видит реальный код из репозитория.

```bash
npm install --save-dev @figma/code-connect
npx figma connect create
```

> Code Connect однонаправленный (Figma → код) и требует Organization или Enterprise план.
> Для kopeika на Pro — **не доступен**. Но стоит знать о нём на будущее.

---

## 4. Что настроить на Mac прямо сейчас

Минимальный набор для начала работы:

### Шаг 1: Claude Code + Figma MCP (5 минут)

```bash
# Убедиться что Claude Code установлен и обновлён
claude --version

# Добавить официальный Figma MCP
claude mcp add --transport http figma https://mcp.figma.com/mcp

# Проверить что MCP работает — в сессии Claude Code попросить:
# "Покажи структуру Figma-файла G6uJMia6jzgTEDJbjQiCVW"
```

### Шаг 2: Figma PAT для read-only (2 минуты)

```bash
# 1. Figma → Settings → Personal Access Tokens → Generate new token
#    Scopes: file_content:read
# 2. Сохранить в безопасное место (1Password, etc.)
# 3. Добавить Framelink MCP:
claude mcp add figma-read -- npx -y figma-developer-mcp --figma-api-key=<TOKEN>
```

### Шаг 3: Проверить (2 минуты)

В Claude Code:
```
> Прочитай структуру Figma-файла G6uJMia6jzgTEDJbjQiCVW и покажи список страниц и фреймов первого уровня.
```

Должен вернуть: Page 1 с основным фреймом и Page 2 с референсами.

### Что НЕ нужно настраивать сейчас

- ~~TalkToFigma~~ — подождать до Этапа C, когда дизайн-система готова
- ~~Cloudflare tunnel~~ — не нужен, работаем локально
- ~~Playwright~~ — не нужен, Figma canvas не автоматизируется
- ~~Code Connect~~ — требует Organization план

---

## 5. Workflows: Figma ↔ код

### 5.1. Ежедневный workflow разработки

```
┌──────────────────────────────────────────────────┐
│                    macOS                          │
│                                                  │
│  ┌─────────┐    Figma MCP     ┌──────────────┐  │
│  │ Claude  │ ◄──────────────► │ Figma Pro    │  │
│  │  Code   │   read + write   │ (браузер)    │  │
│  │ (local) │                  │              │  │
│  └────┬────┘                  └──────────────┘  │
│       │                                          │
│       │ git push                                 │
│       ▼                                          │
│  ┌─────────┐                                     │
│  │ GitHub  │                                     │
│  └────┬────┘                                     │
│       │                                          │
└───────┼──────────────────────────────────────────┘
        │ git pull
        ▼
┌──────────────────────────────────────────────────┐
│                  Linux VM                        │
│                                                  │
│  ┌─────────┐   Framelink MCP  ┌──────────────┐  │
│  │ Claude  │ ◄────────────── │ Figma REST   │  │
│  │  Code   │   read-only     │ API (PAT)    │  │
│  │ (remote)│                  └──────────────┘  │
│  └─────────┘                                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5.2. Сценарий: «Дизайнер меняет кнопку, разработчик обновляет код»

1. Kate в Figma меняет master Button (цвет, padding, border-radius)
2. На VM: Claude Code через Framelink MCP читает обновлённый Button
3. Claude Code генерирует diff для `Button.tsx` / `button.css`
4. Kate ревьюит PR и мержит

### 5.3. Сценарий: «Разработчик создал новый компонент, нужен Figma-макет»

1. На VM: Claude Code пишет `TransactionRow.tsx` с Tailwind-стилями
2. Kate переключается на Mac: Claude Code (локальный) читает `TransactionRow.tsx`
3. Claude генерирует HTML → `generate_figma_design` → новый фрейм в Figma
4. Kate в Figma: правит фрейм, превращает в Component, добавляет variants

### 5.4. Сценарий: «Массовое обновление цветов через AI» (Этап C)

1. Kate запускает TalkToFigma плагин в Figma
2. Claude Code (локальный) подключается к WebSocket
3. Kate: «Обнови primary цвет на #2D9C6F во всех компонентах»
4. Claude Code:
   - `get_local_components` → список компонентов
   - Для каждого: `set_fill_color(nodeId, { r: 0.176, g: 0.612, b: 0.435 })`
5. Все instances на экранах обновляются автоматически (через механизм Component → Instance)

---

## 6. Ограничения Figma Pro

Что доступно и что нет на текущем тарифе:

| Функция | Free/Starter | Pro | Organization | Enterprise |
|---------|:---:|:---:|:---:|:---:|
| Components & Variants | Да | Да | Да | Да |
| Variables (collections) | 1 | 4 | 10 | Без лимита |
| Variables (modes) | 1 | 10 | 40 | Без лимита |
| Auto-layout | Да | Да | Да | Да |
| Team Library | Нет | Да | Да | Да |
| Variables REST API (read/write) | Нет | Нет | Нет | Да |
| Plugin API (в Figma UI) | Да | Да | Да | Да |
| Figma MCP (tool calls/день) | 6 | 200 | 200 | 600 |
| Code Connect | Нет | Нет | Да | Да |
| Dev Mode | Ограниченный | Да (Full seat) | Да | Да |
| Branching & Merging | Нет | Нет | Да | Да |

### Что это значит для kopeika

**Доступно:**
- Components, Variants, Auto-layout — всё для дизайн-системы
- До 4 коллекций Variables с 10 modes — хватает для Light/Dark + spacing + primitives + semantic
- Team Library — можно публиковать компоненты
- Plugin API — TalkToFigma будет работать
- Figma MCP — 200 calls/день, достаточно для итеративной работы

**Не доступно:**
- Variables REST API (Enterprise only) — нельзя программно читать/писать переменные через REST
- Code Connect (Organization+) — нельзя привязать React-компоненты к Figma
- Branching (Organization+) — нельзя делать ветки в Figma (но для одного дизайнера не критично)

**Вывод:** Figma Pro достаточен для всех задач kopeika. Единственное серьёзное ограничение — Variables REST API (Enterprise only), но Variables можно менять через Plugin API (TalkToFigma).

---

## 7. Чеклист готовности

### Этап A: дизайн-система (до начала кодирования UI)

- [ ] Создать страницу `_Components` в Figma
- [ ] Создать Variables: Primitives (цвета), Semantic (aliases + Dark mode), Spacing
- [ ] Создать master-компоненты: Icon, Button, InputField, TransactionRow, CategoryCard, Header
- [ ] Добавить variants: Button (Style × Size), TransactionRow (Expense/Income)
- [ ] Применить auto-layout ко всем компонентам
- [ ] Привязать все цвета к Variables
- [ ] Собрать 10 экранов из instances на странице `Screens`
- [ ] Проверить: изменение master Button → обновляются все экраны
- [ ] Проверить: переключение Dark mode → все цвета переключаются

### Этап B: AI-автоматизация (после Этапа A)

- [ ] Установить Figma MCP в Claude Code на Mac
- [ ] Получить Figma PAT и установить Framelink MCP
- [ ] Проверить: Claude Code читает структуру Figma-файла
- [ ] Проверить: Claude Code генерирует дизайн через `generate_figma_design`
- [ ] Настроить Framelink MCP на VM для read-only доступа

### Этап C: продвинутая автоматизация (опционально)

- [ ] Установить TalkToFigma плагин в Figma
- [ ] Настроить `cursor-talk-to-figma-mcp` в Claude Code
- [ ] Проверить: Claude Code может прочитать и изменить master компонент через Plugin API

---

## Источники

- [Figma MCP Server — документация](https://developers.figma.com/docs/figma-mcp-server/)
- [Claude Code + Figma MCP — Setup Guide](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server)
- [Figma MCP — Plans, Access, Permissions](https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/)
- [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)
- [Framelink MCP (GitHub)](https://github.com/GLips/Figma-Context-MCP)
- [TalkToFigma MCP (GitHub)](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
- [Figma Variables — Overview](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)
- [Figma Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
