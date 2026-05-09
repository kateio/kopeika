# Figma-автоматизация: обзор и рекомендации для kopeika

> **Дата:** 2026-05-09
> **Проект:** [kopeika](../../README.md) — iOS-first PWA для учёта финансов
> **Figma файл:** `G6uJMia6jzgTEDJbjQiCVW`

---

## Зачем этот ресёрч

При работе над проектом kopeika мы попытались автоматизировать создание и обновление дизайна в Figma с помощью AI-инструментов (Claude Code, MCP-серверы). Столкнулись с тем, что:

- **Локально на macOS** — всё работает через официальный Figma MCP (`html-to-design`)
- **На удалённой VM** — write-операции в Figma оказались непропорционально сложными
- **Figma REST API** — read-only для узлов дизайна, write-endpoints для создания/изменения отсутствуют
- **Текущий Figma-файл** — плоский HTML-импорт, не дизайн-система

Этот ресёрч фиксирует что мы попробовали, что сработало, и даёт конкретный план дальнейших действий.

---

## Документы

| # | Файл | Описание |
|---|------|----------|
| 1 | [01-remote-vs-local.md](./01-remote-vs-local.md) | **Remote vs Local** — почему write-автоматизация Figma не работает с удалённой VM. Анализ 7 гипотез, сравнение туннельных решений (Cloudflare/ngrok/Tailscale), best practices |
| 2 | [02-figma-api-mcp-ecosystem.md](./02-figma-api-mcp-ecosystem.md) | **Figma API и MCP-экосистема** — полный обзор REST API (read/write endpoints), Plugin API, 6 MCP-серверов с таблицей сравнения. Что может читать, что может писать |
| 3 | [03-design-system-best-practices.md](./03-design-system-best-practices.md) | **Дизайн-система в Figma** — Components vs Frames, Component Sets с вариантами, Variables, Auto-layout, программное обновление компонентов. Чеклист перехода от плоского дизайна |
| 4 | [04-recommendations-kopeika.md](./04-recommendations-kopeika.md) | **План для kopeika** — текущее состояние, целевая архитектура, 3 этапа перехода (manual → AI → advanced), конкретные команды для настройки, workflows Figma ↔ код |

---

## Ключевые findings

### 1. Write в Figma = только через Plugin API или официальный MCP

Figma REST API **не может** создавать или изменять узлы, компоненты, фреймы. Это архитектурное решение Figma. Для write-операций есть два пути:
- **Figma MCP** (официальный, remote) — `use_figma`, `generate_figma_design`
- **Plugin API** — через WebSocket-плагин (TalkToFigma MCP)

### 2. Удалённая VM — только для read, не для write

Write-операции через Figma MCP требуют локальный браузер с активной Figma-сессией. Попытки воспроизвести это на VM (Cloudflare tunnel, Playwright, headless Chromium) дали нестабильный результат. Оптимальный подход: **macOS для write, VM для read**.

### 3. Текущий Figma-файл нужно превратить в дизайн-систему

Плоский HTML-импорт не позволяет переиспользовать компоненты. Нужно:
- Создать Components с Variants (Button, TransactionRow, CategoryCard...)
- Создать Variables для цветовых токенов
- Пересобрать экраны из instances

### 4. Figma Pro достаточен для всех задач kopeika

4 коллекции Variables, 10 modes, 200 MCP calls/день, Plugin API — хватает. Единственное серьёзное ограничение — Variables REST API (Enterprise only), но Variables можно менять через Plugin API.

---

## С чего начать

1. **Прочитать** [04-recommendations-kopeika.md](./04-recommendations-kopeika.md) — там конкретный план
2. **Этап A** — руками в Figma создать дизайн-систему (~3-5 часов)
3. **Этап B** — настроить Claude Code + Figma MCP на Mac (~30 минут)
4. **Этап C** — (опционально) подключить TalkToFigma для продвинутой автоматизации
