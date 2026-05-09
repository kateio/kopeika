# 02. Figma API и MCP-экосистема: полный обзор

> **Проект:** Kopeika (iOS-first PWA для учёта финансов)
> **Figma файл:** `G6uJMia6jzgTEDJbjQiCVW`
> **Дата:** 2026-05-09
> **Автор:** Kate Iogansen
> **Cross-links:** [01-remote-vs-local.md](./01-remote-vs-local.md) | [03-design-system-best-practices.md](./03-design-system-best-practices.md) | [04-recommendations-kopeika.md](./04-recommendations-kopeika.md)

---

## Содержание

1. [Figma REST API](#1-figma-rest-api)
2. [Figma Plugin API](#2-figma-plugin-api)
3. [MCP-серверы для Figma](#3-mcp-серверы-для-figma)
4. [Сравнительная таблица](#4-сравнительная-таблица)
5. [Выводы и рекомендации](#5-выводы-и-рекомендации)

---

## 1. Figma REST API

**Базовый URL:** `https://api.figma.com`
**Спецификация:** [figma/rest-api-spec](https://github.com/figma/rest-api-spec) (OpenAPI)
**Документация:** [developers.figma.com/docs/rest-api](https://developers.figma.com/docs/rest-api/)

### 1.1. Аутентификация

Figma REST API поддерживает два метода аутентификации:

- **Personal Access Token (PAT)** -- генерируется в настройках аккаунта Figma. Подходит для личной автоматизации и скриптов.
- **OAuth 2.0** -- для приложений, работающих от имени пользователей. Требует регистрации приложения. С 2025 года все OAuth-приложения требуют формального ревью перед публикацией.
- **Plan Access Tokens** -- доступны для Organization и Enterprise планов. Полезны для CI/CD и автоматизации на уровне организации.

Новая модель scopes (с 2025): вместо устаревшего `files:read` используются гранулярные scopes -- `file_content:read`, `file_metadata:read`, `file_comments:read`, `file_dev_resources:write` и др.

### 1.2. Read endpoints (чтение)

| Endpoint | Описание | Tier |
|----------|----------|------|
| `GET /v1/files/:key` | Полное JSON-дерево файла (все узлы, свойства, стили) | Tier 1 |
| `GET /v1/files/:key/nodes` | Конкретные узлы по IDs (поддержка `?ids=`) | Tier 1 |
| `GET /v1/images/:key` | Рендер узлов в PNG/SVG/JPG/PDF | Tier 1 |
| `GET /v1/files/:key/image_fills` | URL-ы изображений, использованных как заливки | Tier 2 |
| `GET /v1/files/:key/versions` | История версий файла | Tier 2 |
| `GET /v1/files/:key/comments` | Комментарии к файлу | Tier 2 |
| `GET /v1/files/:key/components` | Компоненты в файле | Tier 3 |
| `GET /v1/files/:key/component_sets` | Component Sets в файле | Tier 3 |
| `GET /v1/files/:key/styles` | Стили в файле | Tier 3 |
| `GET /v1/files/:key/variables/local` | Локальные переменные файла (Enterprise) | Tier 2 |
| `GET /v1/files/:key/variables/published` | Опубликованные переменные (Enterprise) | Tier 2 |
| `GET /v1/teams/:id/components` | Компоненты команды | Tier 3 |
| `GET /v1/teams/:id/styles` | Стили команды | Tier 3 |
| `GET /v1/teams/:id/projects` | Проекты команды | Tier 2 |
| `GET /v1/projects/:id/files` | Файлы проекта | Tier 2 |
| `GET /v1/me` | Информация о текущем пользователе | Tier 3 |
| `GET /v1/activity_logs` | Логи активности (Enterprise) | Tier 3 |

**Что можно получить через Read:**
- Полную структуру дерева узлов (frames, groups, components, instances, text, vectors и т.д.)
- Все свойства каждого узла (координаты, размеры, fills, strokes, effects, constraints, auto layout и т.д.)
- Рендер любых узлов в растровые и векторные форматы
- Метаданные компонентов и стилей
- Информацию о переменных (только Enterprise)

### 1.3. Write endpoints (запись)

**Критически важно: REST API позволяет ЗАПИСЫВАТЬ только ограниченный набор данных.**

| Endpoint | Метод | Описание | Tier |
|----------|-------|----------|------|
| `/v1/files/:key/comments` | POST | Создать комментарий | Tier 2 |
| `/v1/files/:key/comments/:id` | DELETE | Удалить комментарий | Tier 2 |
| `/v1/files/:key/comments/:id/reactions` | POST | Добавить реакцию к комментарию | Tier 2 |
| `/v1/files/:key/comments/:id/reactions` | DELETE | Удалить реакцию | Tier 2 |
| `/v1/files/:key/dev_resources` | POST | Создать dev resources (ссылки на код) | Tier 2 |
| `/v1/files/:key/dev_resources` | PUT | Обновить dev resources | Tier 2 |
| `/v1/files/:key/dev_resources/:id` | DELETE | Удалить dev resource | Tier 2 |
| `/v1/files/:key/variables` | POST | Создать/обновить/удалить переменные (Enterprise) | Tier 3 |
| `/v1/webhooks` | POST | Создать webhook | Tier 2 |
| `/v1/webhooks/:id` | PUT | Обновить webhook | Tier 2 |
| `/v1/webhooks/:id` | DELETE | Удалить webhook | Tier 2 |

### 1.4. Что НЕЛЬЗЯ через REST API

> **Это главное ограничение REST API и самый частый источник путаницы.**

REST API **НЕ МОЖЕТ**:

- Создавать, изменять или удалять **узлы** (frames, rectangles, ellipses, vectors, groups и т.д.)
- Создавать, изменять или удалять **компоненты** и **component sets**
- Менять **свойства** существующих узлов (позицию, размер, цвет, текст, constraints, auto layout)
- Создавать или изменять **страницы**
- Изменять **стили** (color styles, text styles, effect styles)
- Менять **текстовое содержимое** узлов
- Создавать или менять **прототипные связи** (interactions, flows)
- Загружать **изображения** в файл

Другими словами: **REST API -- это read-only по отношению к дизайн-контенту файла.** Записывать можно только метаданные (комментарии, dev resources, webhooks) и переменные (Enterprise).

### 1.5. Variables API

**Доступ: только Enterprise план.**

Endpoints:
- `GET /v1/files/:key/variables/local` -- чтение локальных переменных
- `GET /v1/files/:key/variables/published` -- чтение опубликованных переменных
- `POST /v1/files/:key/variables` -- bulk create/update/delete переменных и коллекций

Что можно:
- Читать все переменные и их значения (включая modes)
- Создавать новые переменные (COLOR, FLOAT, STRING, BOOLEAN)
- Обновлять значения переменных
- Удалять переменные
- Управлять variable collections и modes
- Работать с extended collections (с ноября 2025)

Ограничения:
- Требуется Full seat в Enterprise org. Guests не имеют доступа.
- После обновления переменных через API, их нужно **опубликовать**, прежде чем другие файлы смогут их использовать.
- PAT поддерживает только `file_variables:read`; для записи нужен OAuth с scope `file_variables:write` или Plan Access Token.

**Вывод для Kopeika:** На Figma Pro Variables API через REST **недоступен**. Работа с переменными -- только через Plugin API или UI.

### 1.6. Component Set / Library API

Через REST API доступно **только чтение**:

- `GET /v1/files/:key/components` -- список компонентов в файле
- `GET /v1/files/:key/component_sets` -- component sets
- `GET /v1/teams/:id/components` -- компоненты на уровне команды
- `GET /v1/teams/:id/component_sets` -- component sets на уровне команды
- `GET /v1/teams/:id/styles` -- стили команды

Каждый компонент содержит: `key`, `name`, `description`, `thumbnail_url`, `containing_frame`, `created_at`, `updated_at`.

**Создавать, изменять или удалять компоненты через REST API нельзя.**

### 1.7. Rate Limits

С **17 ноября 2025** действуют обновлённые лимиты. Алгоритм: **leaky bucket**. Превышение возвращает `429 Too Many Requests`.

#### Tier 1 (Files: GET file, GET file nodes, GET images)

| Seat | Starter | Professional | Organization | Enterprise |
|------|---------|-------------|-------------|------------|
| View/Collab | до 6/мес | до 6/мес | до 6/мес | до 6/мес |
| Dev/Full | 10/мин | 15/мин | 20/мин | расширенные |

#### Tier 2 (Comments, Dev Resources, Projects, Variables GET, Versions, Webhooks)

| Seat | Starter | Professional | Organization | Enterprise |
|------|---------|-------------|-------------|------------|
| View/Collab | 5/мин | 5/мин | 5/мин | 5/мин |
| Dev/Full | 25/мин | 50/мин | 100/мин | расширенные |

#### Tier 3 (Components, Styles, Metadata, Users, Variables POST, Activity Logs)

| Seat | Starter | Professional | Organization | Enterprise |
|------|---------|-------------|-------------|------------|
| View/Collab | 10/мин | 10/мин | 10/мин | 10/мин |
| Dev/Full | 50/мин | 100/мин | 150/мин | расширенные |

Для OAuth: лимиты трекаются **per-user, per-plan, per-app**.

Полезные заголовки в ответе: `Retry-After`, `X-Figma-Plan-Tier`, `X-Figma-Rate-Limit-Type`.

**Для Kopeika (Pro план, Full seat):** Tier 1 = 15/мин, Tier 2 = 50/мин, Tier 3 = 100/мин. Этого достаточно для большинства автоматизаций.

---

## 2. Figma Plugin API

**Документация:** [figma.com/plugin-docs](https://www.figma.com/plugin-docs/api/api-reference/)
**Примеры:** [github.com/figma/plugin-samples](https://github.com/figma/plugin-samples)

### 2.1. Что может плагин (чего не может REST API)

Plugin API предоставляет **полный read/write доступ** к активному файлу:

- **Создание узлов:** `figma.createFrame()`, `figma.createRectangle()`, `figma.createEllipse()`, `figma.createText()`, `figma.createComponent()`, `figma.createComponentSet()`, `figma.createBooleanOperation()`, `figma.createVector()`, `figma.createLine()`, `figma.createPolygon()`, `figma.createStar()`, `figma.createSlice()`, `figma.createPage()` и др.
- **Модификация свойств:** размеры, позиция, fills, strokes, effects, constraints, auto layout, corner radius, opacity, blend mode, text content, font styles.
- **Компоненты и варианты:** создание, модификация, создание instances, override свойств.
- **Переменные:** создание и управление variables и collections (без ограничения по плану, в отличие от REST API).
- **Стили:** создание и модификация paint styles, text styles, effect styles, grid styles.
- **Прототипирование:** создание interactions, flows, connections.
- **Экспорт:** рендер узлов в PNG/SVG/PDF/JPG.
- **Работа с библиотеками:** импорт компонентов и стилей из подключённых библиотек.

### 2.2. Как пишется плагин

**Структура проекта:**

```
my-plugin/
  manifest.json        # описание плагина
  src/
    code.ts            # основная логика (sandbox)
    ui.html            # UI плагина (iframe)
    ui.ts              # скрипт для UI
  dist/
    code.js            # скомпилированный код
  tsconfig.json
  package.json
```

**manifest.json (минимальный):**

```json
{
  "name": "My Plugin",
  "id": "1234567890",
  "api": "1.0.0",
  "main": "dist/code.js",
  "editorType": ["figma"],
  "ui": "src/ui.html",
  "networkAccess": {
    "allowedDomains": ["https://my-server.com"]
  }
}
```

**Типизация:**
```bash
npm install --save-dev @figma/plugin-typings
```

Код плагина выполняется в **изолированном sandbox** (не browser DOM, не Node.js). UI -- в iframe. Общение между sandbox и UI -- через `figma.ui.postMessage()` / `figma.ui.onmessage`.

### 2.3. Headless/автоматизированный запуск

> **Plugin API работает ТОЛЬКО внутри Figma UI.** Автоматизированный (headless) запуск плагинов **невозможен**.

Плагин запускается только когда:
1. Пользователь открыл файл в Figma (desktop или web).
2. Пользователь вручную запустил плагин через меню Plugins.
3. Или плагин настроен на автозапуск при открытии файла.

Нет CLI, нет API для запуска плагина извне. Это фундаментальное ограничение архитектуры.

### 2.4. Связь плагина с внешним сервером

Плагин может общаться с внешним миром:
- **HTTP/Fetch** -- из UI-части (iframe) можно делать fetch-запросы к внешнему серверу (домены должны быть указаны в `networkAccess` в manifest.json).
- **WebSocket** -- из UI-части можно открыть WebSocket-соединение с внешним сервером. Именно так работает cursor-talk-to-figma-mcp (см. раздел 3.3).
- Sandbox-часть может общаться с UI через `postMessage`, а UI уже связывается с сервером.

Паттерн:
```
Внешний сервер <--WebSocket/HTTP--> Plugin UI (iframe) <--postMessage--> Plugin Sandbox (Figma API)
```

Это позволяет строить мосты между внешними инструментами (MCP-серверы, AI-агенты) и Figma Plugin API, но требует, чтобы Figma была открыта и плагин был запущен.

---

## 3. MCP-серверы для Figma

### 3.1. Figma Dev Mode MCP (официальный)

**URL:** `https://mcp.figma.com/mcp`
**Документация:** [developers.figma.com/docs/figma-mcp-server](https://developers.figma.com/docs/figma-mcp-server/)
**Blog:** [figma.com/blog/introducing-figma-mcp-server](https://www.figma.com/blog/introducing-figma-mcp-server/)
**Help Center:** [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)

#### Описание

Официальный MCP-сервер от Figma. Доступен в двух вариантах:
- **Remote (рекомендуемый)** -- hosted Figma, не требует desktop-приложения, максимальный набор функций.
- **Desktop (альтернативный)** -- через локальное Figma Desktop приложение, ограниченный набор функций.

Сервер работает в режиме open beta -- **бесплатно**, в будущем станет usage-based платной функцией.

#### Tools (инструменты)

**Read tools:**

| Tool | Описание | Требования |
|------|----------|------------|
| `get_design_context` | Код для выбранных слоёв (React+Tailwind по умолчанию, настраиваемо) | Design/Make файлы |
| `get_variable_defs` | Переменные и стили выбранных элементов | Design файлы |
| `get_code_connect_map` | Маппинг Figma nodes -> code components | Design файлы |
| `get_screenshot` | Скриншот выделенного | Design/FigJam |
| `get_metadata` | XML-представление слоёв (ID, имена, типы, размеры) | Design файлы |
| `get_figjam` | FigJam-диаграммы в XML | FigJam файлы |
| `whoami` | Информация о пользователе, план, seat | Remote only |
| `search_design_system` | Поиск компонентов/переменных/стилей по библиотекам | Remote only |
| `get_code_connect_suggestions` | Предложения Code Connect маппингов | Design файлы |

**Write tools:**

| Tool | Описание | Требования |
|------|----------|------------|
| `generate_figma_design` | Генерация дизайн-слоёв из интерфейсов (write to canvas) | Remote only |
| `use_figma` | Универсальный инструмент: создание/редактирование объектов в файле | Remote only |
| `add_code_connect_map` | Создание маппингов между Figma и кодом | Design файлы |
| `create_design_system_rules` | Создание файла правил для design system | Без файла |
| `send_code_connect_mappings` | Подтверждение Code Connect маппингов | Design файлы |
| `generate_diagram` | Генерация FigJam-диаграмм из Mermaid/текста | Remote only |
| `create_new_file` | Создание нового файла в Drafts | Remote only |

Ключевой инструмент -- **`use_figma`** (remote only): позволяет управлять страницами, фреймами, компонентами, вариантами, переменными, стилями, текстом, изображениями, auto layout и многим другим. Это по сути обёртка над полными возможностями Figma.

#### Требования по тарифам

| План | Seat | Лимит tool calls |
|------|------|-----------------|
| Starter | View/Collab | 6 вызовов/месяц |
| Pro | Full/Dev | 200 вызовов/день |
| Organization | Full/Dev | 200 вызовов/день |
| Enterprise | Full/Dev | 600 вызовов/день |

Отдельные tools (`add_code_connect_map`, `generate_figma_design`, `whoami`) **не учитываются** в лимитах.

#### Настройка в Claude Code

**Через плагин (рекомендуемый способ):**
```bash
claude plugin install figma@claude-plugins-official
```

**Вручную:**
```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Затем: `/mcp` -> выбрать `figma` -> `Authenticate` -> разрешить доступ.

#### Настройка в Cursor

Через deep link или вручную -- MCP URL: `https://mcp.figma.com/mcp`, тип `http`.

#### Настройка в VS Code

Файл `.vscode/mcp.json` или через `MCP: Open User Configuration`:
```json
{
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

#### Ключевые преимущества

- **Единственный MCP, позволяющий ПИСАТЬ в Figma** нативно (через remote server) без необходимости держать открытый плагин.
- Read-данные оптимизированы для генерации кода (get_design_context выдаёт сразу код, а не сырой JSON).
- Интеграция с design systems и Code Connect.
- OAuth-аутентификация, не нужен PAT.

#### Ограничения

- Write tools (`use_figma`, `generate_figma_design`, `generate_diagram`, `create_new_file`, `search_design_system`) -- **только remote server**.
- Desktop server значительно ограничен по функциональности.
- Большие, тяжёлые фреймы могут вызывать проблемы с производительностью.
- Клиентское приложение должно поддерживать MCP (Cursor, Claude Code, VS Code, Windsurf, Codex).
- В будущем функция станет платной.

---

### 3.2. Framelink / Figma-Context-MCP (GLips)

**GitHub:** [github.com/GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)
**npm:** `figma-developer-mcp`

#### Описание

Community MCP-сервер, который предоставляет AI-агентам (Cursor, Claude Code и др.) доступ к данным дизайна из Figma. Основная цель -- обеспечить "one-shot implementation" дизайнов, когда агент получает достаточно контекста из Figma, чтобы сгенерировать код за одну попытку.

#### Архитектура

```
AI Agent (Cursor/Claude) -> MCP Protocol -> figma-developer-mcp -> Figma REST API (PAT)
```

Сервер работает локально, обращается к Figma REST API через Personal Access Token. Фильтрует и упрощает ответы API, убирая лишний шум и передавая агенту только релевантную информацию о layout и стилях.

#### Возможности

**Read:**
- Получение структуры файла/фреймов/групп
- Чтение layout и styling информации (упрощённой)
- Просмотр thumbnail-ов узлов
- Чтение комментариев
- Отправка и ответ на комментарии

**Write:**
- Создание комментариев (через REST API)
- Ответы на комментарии

**Не может:**
- Создавать/изменять узлы, компоненты, стили
- Модифицировать дизайн-контент
- Работать с переменными (кроме Enterprise REST API)

#### Установка

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

Или через переменные окружения: `FIGMA_API_KEY`, `PORT`.

#### Зависимости

- Node.js + npx
- Figma Personal Access Token
- TypeScript (96.6% кодовой базы)

#### Ограничения

- **Read-only** по отношению к дизайн-контенту (ограничение REST API).
- Фильтрация контекста может опускать некоторые детали дизайна.
- Для переменных нужен Enterprise план.

---

### 3.3. TalkToFigma / cursor-talk-to-figma-mcp (sonnylazuardi / Grab)

**GitHub:** [github.com/sonnylazuardi/cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
(Организация: [github.com/grab](https://github.com/grab/cursor-talk-to-figma-mcp))

#### Описание

Двусторонний MCP-сервер, позволяющий AI-агентам (Cursor, Claude Code) **читать и модифицировать** дизайн в Figma через WebSocket-мост к Figma-плагину. Единственный community MCP, обеспечивающий **полноценную запись** в Figma.

#### Архитектура

```
AI Agent (Cursor/Claude Code)
       |
       | MCP Protocol
       v
  MCP Server (TypeScript, bunx)
       |
       | WebSocket (ws://localhost:3055)
       v
  WebSocket Relay Server (socket.ts)
       |
       | WebSocket (каналы)
       v
  Figma Plugin (cursor_mcp_plugin)
       |
       | Plugin API
       v
  Figma File (активный)
```

Три компонента:
1. **MCP Server** (`src/talk_to_figma_mcp/`) -- TypeScript, работает как MCP-сервер для AI-агента.
2. **WebSocket Server** (`src/socket.ts`) -- relay-сервер на порту 3055, маршрутизирует сообщения между MCP-сервером и плагином через каналы.
3. **Figma Plugin** (`src/cursor_mcp_plugin/`) -- плагин, работающий внутри Figma, принимает команды через WebSocket и выполняет их через Plugin API.

#### MCP Tools (полный список)

**Чтение:**
- `get_document_info` -- информация о документе
- `get_selection` -- текущее выделение
- `read_my_design` -- чтение дизайна
- `get_node_info` / `get_nodes_info` -- информация об узлах
- `get_annotations` -- аннотации
- `get_reactions` -- прототипные реакции
- `scan_text_nodes` -- поиск текстовых узлов
- `scan_nodes_by_types` -- поиск узлов по типам
- `get_styles` -- стили
- `get_local_components` -- локальные компоненты
- `get_instance_overrides` -- override-ы инстансов
- `export_node_as_image` -- экспорт в изображение (base64)

**Запись:**
- `create_rectangle` -- создание прямоугольника
- `create_frame` -- создание фрейма
- `create_text` -- создание текста
- `set_text_content` / `set_multiple_text_contents` -- изменение текста
- `set_fill_color` -- изменение цвета заливки
- `set_stroke_color` -- изменение обводки
- `set_corner_radius` -- радиус скругления
- `move_node` -- перемещение узла
- `resize_node` -- изменение размера
- `delete_node` / `delete_multiple_nodes` -- удаление
- `clone_node` -- клонирование
- `set_layout_mode` -- авто-лейаут
- `set_padding` -- отступы
- `set_axis_align` -- выравнивание
- `set_layout_sizing` -- sizing в layout
- `set_item_spacing` -- gap между элементами
- `create_component_instance` -- создание инстанса компонента
- `set_instance_overrides` -- установка override-ов
- `set_annotation` / `set_multiple_annotations` -- аннотации
- `set_default_connector` / `create_connections` -- прототипные связи
- `set_focus` / `set_selections` -- управление фокусом/выделением
- `join_channel` -- подключение к каналу WebSocket

#### Установка

```json
{
  "mcpServers": {
    "TalkToFigma": {
      "command": "bunx",
      "args": ["cursor-talk-to-figma-mcp@latest"]
    }
  }
}
```

Также необходимо:
1. Запустить WebSocket сервер: `bun socket`
2. Установить Figma плагин (из marketplace или через manifest.json)
3. Открыть плагин в Figma и подключиться к каналу (`join_channel`)

#### Зависимости

- **Bun** (JavaScript runtime) -- для запуска MCP и socket-сервера
- Figma Desktop или Web (с открытым плагином)
- Активное WebSocket-соединение

#### Известные проблемы

- **Localhost/WebSocket stability** -- WebSocket на `localhost:3055` может быть нестабилен, особенно при длительных сессиях.
- **Windows WSL** -- требует настройки hostname на `0.0.0.0`.
- **Экспорт изображений** -- возвращает base64 как текст, ограниченная поддержка.
- **Обязательное подключение к каналу** -- перед выполнением любых команд нужно вызвать `join_channel`.
- **Ручной запуск плагина** -- каждый раз при работе нужно вручную запустить плагин в Figma и подключить его к каналу.
- **Один файл** -- работает только с активным файлом в Figma (ограничение Plugin API).

---

### 3.4. Figma First Draft / AI -- нативные функции (не MCP)

**Документация:** [Use First Draft with Figma AI](https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI)

Это **встроенные AI-функции Figma**, которые **не являются MCP-серверами** и не могут использоваться из внешних инструментов.

#### First Draft
- Генерация UI-макетов из текстовых промптов.
- Доступные типы: site wireframe, basic site, app wireframe, basic app.
- Создаёт стартовую точку для дизайна, но не целое приложение.
- Результат -- редактируемые Figma-слои на основе внутренней библиотеки компонентов.

#### Другие AI-инструменты Figma (2025-2026)
- **Replace content** -- замена контента в компонентах.
- **Make an image** -- генерация изображений.
- **Add interactions** -- автоматическое добавление прототипных связей.
- **Smart search** -- AI-поиск по файлам.
- **Figma Buzz** -- генерация маркетинговых материалов.

#### Ограничения
- Работают только внутри Figma UI.
- Нет API для вызова извне.
- Результаты требуют ручного ревью (accessibility, семантика, production readiness).
- Не заменяют полноценный дизайн-процесс.

---

### 3.5. Прочие community MCP-серверы

#### 3.5.1. thirdstrandstudio/mcp-figma

**GitHub:** [github.com/thirdstrandstudio/mcp-figma](https://github.com/thirdstrandstudio/mcp-figma)

- **31 инструмент** в 6 категориях.
- Работает через Figma REST API (PAT).
- **Read:** файлы, узлы, изображения, компоненты, стили, версии, аналитика библиотек.
- **Write:** комментарии, реакции, webhooks (create/update/delete). **Дизайн-контент менять не может.**
- Поддержка работы с глубиной дерева (`depth = 1` для больших файлов).
- Установка: npm install + build, или через Smithery.
- **Зависимости:** Node.js v16+, Figma PAT.

#### 3.5.2. TimHolden/figma-mcp-server

**GitHub:** [github.com/TimHolden/figma-mcp-server](https://github.com/TimHolden/figma-mcp-server)

- Tools: `get-file`, `list-files`, `create-variables`, `create-theme`.
- **Read-only** на практике (PAT ограничен read-операциями для дизайн-контента).
- LRU-кэширование (5 мин TTL, 500 записей).
- Поддержка stdio и SSE transport.
- **Зависимости:** Node.js 18+, TypeScript.

#### 3.5.3. deepsuthar496/figma-mcp-server

**Ссылка:** [mcpservers.org/servers/deepsuthar496/figma-mcp-server](https://mcpservers.org/servers/deepsuthar496/figma-mcp-server)

- Community MCP для взаимодействия с Figma API.
- Доступ к файлам, комментариям, компонентам.
- Типичная REST API обёртка.

#### 3.5.4. Figma MCP Registry (официальный реестр)

**GitHub:** [github.com/mcp/com.figma.mcp](https://github.com/mcp/com.figma.mcp/mcp)

Figma зарегистрировала официальный MCP в MCP Registry, что упрощает обнаружение и настройку сервера в совместимых клиентах.

---

## 4. Сравнительная таблица

| MCP-сервер | Тип | Read | Write | Архитектура | Зависимости | Тарифы Figma | Примечания |
|---|---|---|---|---|---|---|---|
| **Figma Dev Mode MCP** (официальный, `mcp.figma.com`) | Remote hosted / Desktop | Полный (дизайн-контекст, переменные, стили, скриншоты, Code Connect) | **Да** -- создание/редактирование узлов, компонентов, переменных, auto layout через `use_figma`, `generate_figma_design` | OAuth, hosted endpoint | Нет локальных зависимостей (remote) | Starter: 6/мес; Pro: 200/день; Org: 200/день; Ent: 600/день. Бета -- бесплатно | **Рекомендуемый.** Write только в remote. Станет платным |
| **Framelink** (`GLips/Figma-Context-MCP`) | Локальный (npx) | Да (файлы, layout, стили, комментарии) | Только комментарии | REST API через PAT | Node.js, npx, PAT | Любой план (read); Enterprise (variables) | Read-only для дизайна. Хорош для code-gen |
| **TalkToFigma** (`sonnylazuardi/cursor-talk-to-figma-mcp`) | Локальный + WebSocket + Plugin | Да (документ, выделение, компоненты, стили) | **Да** -- создание/редактирование узлов, текста, layout, цветов, компонентов | WebSocket relay + Figma Plugin | Bun, WebSocket server, Figma Plugin | Любой (Plugin API не зависит от плана) | Требует открытый Figma + плагин. Нестабильный WebSocket |
| **thirdstrandstudio/mcp-figma** | Локальный (npm) | Да (31 инструмент, файлы, компоненты, аналитика) | Только комментарии, webhooks | REST API через PAT | Node.js v16+, PAT | Любой план | Максимальное покрытие REST API |
| **TimHolden/figma-mcp-server** | Локальный (npm) | Да (файлы, проекты) | Нет (read-only) | REST API через PAT | Node.js 18+, PAT | Любой план | Кэширование, SSE transport |
| **Figma AI / First Draft** | Встроенный в Figma | -- | Да (внутри UI) | Нативный | Figma UI | Включено в платные планы | Не MCP. Работает только в Figma |

### Ключевой вопрос: кто может ПИСАТЬ в Figma?

| Способ записи | Создание узлов | Изменение свойств | Переменные | Комментарии | Требует Figma UI |
|---|---|---|---|---|---|
| REST API | Нет | Нет | Enterprise only | Да | Нет |
| Plugin API | Да | Да | Да (любой план) | Нет | **Да** |
| Figma MCP (remote) | Да (`use_figma`) | Да (`use_figma`) | Да | Да | Нет |
| TalkToFigma MCP | Да (через Plugin) | Да (через Plugin) | Через Plugin | Нет | **Да** |

---

## 5. Выводы и рекомендации

### Для проекта Kopeika (Figma Pro, macOS, Claude Code)

#### Рекомендация 1: Figma Dev Mode MCP (официальный remote) -- основной инструмент

**Почему:** Это единственный MCP-сервер, который позволяет **читать И писать** в Figma без необходимости держать открытый плагин. На Pro плане с Full seat доступно 200 tool calls/день, что достаточно для итеративной работы.

**Что делать:**
1. Настроить в Claude Code: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
2. Использовать `get_design_context` для чтения дизайна и генерации кода.
3. Использовать `use_figma` для создания и модификации дизайн-элементов из кода.
4. Использовать `generate_figma_design` для конвертации HTML/кода в дизайн-слои.

**Риск:** Сервис в бете, станет платным. Но сейчас -- лучший вариант.

#### Рекомендация 2: Framelink (GLips) -- дополнительный read-only инструмент

**Почему:** Работает через PAT (не OAuth), можно использовать параллельно. Хорошо фильтрует шум из Figma API для code-gen задач.

**Когда использовать:** Когда нужен быстрый read-доступ к конкретному фрейму без OAuth-аутентификации.

#### Рекомендация 3: TalkToFigma -- для сложной двусторонней работы (опционально)

**Почему:** Единственный community MCP с полным write через Plugin API. Не зависит от плана (Plugin API работает на любом плане).

**Когда использовать:** Когда нужна тонкая работа с дизайном (массовые изменения текста, программная генерация вариантов компонентов), и вы готовы держать открытыми Figma + плагин + WebSocket сервер.

**Минус:** Сложная архитектура, нестабильность WebSocket, ручной запуск плагина.

#### Что НЕ подходит для Kopeika

- **Variables REST API** -- требует Enterprise план, на Pro недоступен.
- **Figma AI / First Draft** -- не MCP, не интегрируется с Claude Code. Годится только для ручного прототипирования в Figma UI.
- **Community REST API обёртки** (thirdstrandstudio, TimHolden) -- проигрывают и официальному MCP, и Framelink. Могут быть полезны для CI/CD автоматизации (webhooks, аналитика), но для Kopeika это overkill.

### Итоговая стратегия

```
Claude Code
   |
   |-- Figma Dev Mode MCP (remote) -- read + write дизайна
   |      URL: https://mcp.figma.com/mcp
   |
   |-- Framelink MCP (опционально) -- быстрый read через PAT
   |      npx figma-developer-mcp
   |
   v
Figma Pro (file: G6uJMia6jzgTEDJbjQiCVW)
```

Подробные рекомендации по настройке и workflow -- см. [04-recommendations-kopeika.md](./04-recommendations-kopeika.md).

---

## Источники

### Официальная документация Figma
- [Figma REST API -- Introduction](https://developers.figma.com/docs/rest-api/)
- [Figma REST API -- Rate Limits](https://developers.figma.com/docs/rest-api/rate-limits/)
- [Figma REST API -- Variables](https://developers.figma.com/docs/rest-api/variables/)
- [Figma REST API -- Variables Endpoints](https://developers.figma.com/docs/rest-api/variables-endpoints/)
- [Figma REST API -- Dev Resources Endpoints](https://developers.figma.com/docs/rest-api/dev-resources-endpoints/)
- [Figma REST API -- Changelog](https://developers.figma.com/docs/rest-api/changelog/)
- [Figma REST API -- Authentication](https://developers.figma.com/docs/rest-api/authentication/)
- [Compare Figma APIs](https://developers.figma.com/compare-apis/)
- [Figma Plugin API -- Introduction](https://developers.figma.com/docs/plugins/)
- [Figma Plugin API -- API Reference](https://www.figma.com/plugin-docs/api/api-reference/)
- [Figma Plugin API -- Manifest](https://developers.figma.com/docs/plugins/manifest/)
- [Figma Plugin API -- TypeScript](https://www.figma.com/plugin-docs/typescript/)
- [Figma MCP Server -- Introduction](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP Server -- Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Figma MCP Server -- Remote Server Setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [Figma MCP Server -- Plans, Access, Permissions](https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/)
- [Figma MCP Server -- Blog Post](https://www.figma.com/blog/introducing-figma-mcp-server/)
- [Claude Code + Figma MCP Setup Guide](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server)
- [Use First Draft with Figma AI](https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI)

### GitHub-репозитории
- [figma/rest-api-spec](https://github.com/figma/rest-api-spec) -- OpenAPI спецификация REST API
- [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide) -- гайд по MCP-серверу
- [figma/plugin-samples](https://github.com/figma/plugin-samples) -- примеры плагинов
- [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) -- Framelink MCP
- [sonnylazuardi/cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp) -- TalkToFigma MCP
- [thirdstrandstudio/mcp-figma](https://github.com/thirdstrandstudio/mcp-figma) -- Full REST API MCP
- [TimHolden/figma-mcp-server](https://github.com/TimHolden/figma-mcp-server) -- Design system MCP
