# 01. Figma-автоматизация: удалённая VM vs локальный macOS

> **Проект:** kopeika (iOS-first PWA для учёта финансов)
> **Автор:** Kate Iogansen
> **Дата:** 2026-05-09
> **Статус:** research-документ

---

## Содержание

1. [Введение](#1-введение)
2. [Анализ гипотез](#2-анализ-каждой-гипотезы)
3. [Сравнение альтернативных стеков](#3-сравнение-альтернативных-стеков)
4. [Best practice на сегодня](#4-best-practice-на-сегодня)
5. [Выводы](#5-выводы)

**Связанные документы:**
- [02-figma-api-mcp-ecosystem.md](./02-figma-api-mcp-ecosystem.md) — экосистема Figma API и MCP-серверов
- [03-design-system-best-practices.md](./03-design-system-best-practices.md) — best practices для дизайн-систем
- [04-recommendations-kopeika.md](./04-recommendations-kopeika.md) — конкретные рекомендации для проекта kopeika

---

## 1. Введение

### Главный вопрос

Почему механизм работы с Figma, который идеально функционирует на локальном macOS (Claude Code + официальный Figma MCP), **невозможно** (или крайне сложно) воспроизвести на удалённой Linux VM?

### Контекст

Рабочая среда: macOS (локально) + Linux VM в Германии (удалённо). На локальной машине Claude Code использует официальный Figma MCP-сервер (`html-to-design`) — конвейер работает бесшовно:

1. Claude Code вызывает `generate_figma_design` с параметрами `outputMode: existingFile, fileKey: ...`
2. MCP генерирует HTML с инжектированным `capture.js` (`https://mcp.figma.com/mcp/html-to-design/capture.js`)
3. Команда `open` открывает HTML в локальном Chrome
4. `capture.js` сериализует DOM страницы и отправляет данные на серверы Figma
5. Результат появляется как редактируемый фрейм в целевом Figma-файле

Этот конвейер работает потому, что **браузер находится на одной машине с Claude Code** и **залогинен в Figma**. На удалённой VM каждое из этих условий ломается.

### Что пробовали

| # | Подход | Результат |
|---|--------|-----------|
| 1 | **Figma REST API через PAT** (`framelink-figma-mcp`) | Read-only работает. POST для создания узлов — 404 (эндпоинтов нет в REST API) |
| 2 | **cursor-talk-to-figma-mcp + WebSocket-bridge** | Плагин требует `ws://localhost:3055`. Патчинг manifest + Cloudflare tunnel дал wss://, но соединение рвалось каждые ~60 сек |
| 3 | **Playwright + cookies на VM** | Headless логин работает, но headed нужен для плагинов → Xvfb/noVNC. Figma — canvas, UI не доступен через `page.click()` |
| 4 | **Локальный Claude Code на macOS** | Работает идеально через официальный MCP (`html-to-design`) |

---

## 2. Анализ каждой гипотезы

### Гипотеза 1: Браузер не залогинен в Figma на VM

**Статус:** Подтверждена, но решаема.

**Наш опыт:** Мы успешно использовали Cookie-Editor для экспорта cookies из Chrome на macOS → JSON → Playwright `storageState` на VM. Headless Chromium на VM принимал cookies и успешно авторизовывался в Figma. Проблема не в логине как таковом — это решаемо.

**Решение:**

```bash
# 1. На macOS: Cookie-Editor → Export as JSON → figma-cookies.json
# 2. Конвертация в Playwright storageState формат:
node -e "
const cookies = require('./figma-cookies.json');
const state = {
  cookies: cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path || '/',
    expires: c.expirationDate || -1,
    httpOnly: c.httpOnly || false,
    secure: c.secure || false,
    sameSite: c.sameSite || 'Lax'
  })),
  origins: []
};
require('fs').writeFileSync('storage-state.json', JSON.stringify(state, null, 2));
"

# 3. Playwright на VM:
# const browser = await chromium.launch();
# const context = await browser.newContext({ storageState: 'storage-state.json' });
```

**Ограничение:** Cookies имеют срок жизни. Figma может инвалидировать сессию при смене IP/User-Agent. Нужен периодический ре-экспорт или использование Figma OAuth с refresh-токеном.

---

### Гипотеза 2: `open URL` (macOS) недоступна на Linux

**Статус:** Подтверждена. Требует замены.

**Наш опыт:** Официальный Figma MCP (`html-to-design`) в конвейере `generate_figma_design` вызывает `open <path-to-html>` — это macOS-специфичная команда, которая открывает файл в дефолтном браузере. На Linux VM такой команды нет.

**Решение:**

```bash
# Linux-эквивалент macOS `open`:
xdg-open "file:///tmp/figma-capture.html"   # для headed-окружения с X11

# Для headless VM:
# Вариант A: Playwright программно открывает HTML
npx playwright open "file:///tmp/figma-capture.html"

# Вариант B: Запустить HTTP-сервер и открыть через Playwright
python3 -m http.server 8080 --directory /tmp &
# → затем Playwright navigates to http://localhost:8080/figma-capture.html
```

**Ключевой нюанс:** Даже заменив `open` на `xdg-open` или Playwright, проблема глубже: `capture.js` работает в контексте браузера, который должен быть **визуальным** (не headless) и **залогинен в Figma**. На headless VM без X-сервера `capture.js` может не инициализироваться корректно, поскольку полагается на DOM-рендеринг и визуальную сериализацию.

---

### Гипотеза 3: Mixed content — HTTPS Figma блокирует ws://

**Статус:** Подтверждена полностью.

**Наш опыт:** Figma работает через `https://www.figma.com`. Плагин `cursor-talk-to-figma-mcp` пытался подключиться к `ws://localhost:3055`. При патчинге на удалённый адрес VM (через Cloudflare quick tunnel) браузер блокировал mixed content: HTTPS-страница не может инициировать `ws://` (нешифрованный WebSocket) соединение.

Cloudflare tunnel предоставил `wss://` endpoint, что решило mixed content. Но породило новые проблемы (см. Гипотеза 4).

**Решение:**

```
# Cloudflare named tunnel с wss:// — решает mixed content:
cloudflared tunnel --url ws://localhost:3055

# Результат: https://<subdomain>.trycloudflare.com → wss:// автоматически
# Figma HTTPS-страница подключается к wss:// без ошибок mixed content
```

**Альтернатива:** Использовать `ngrok` с TLS-терминацией:

```bash
ngrok http 3055 --scheme=https
# → wss://<id>.ngrok-free.app
```

**Источники:**
- [Cloudflare WebSocket docs](https://developers.cloudflare.com/network/websockets/)
- [MDN Mixed Content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)

---

### Гипотеза 4: Cloudflare quick tunnel нестабилен для WebSocket

**Статус:** Подтверждена полностью.

**Наш опыт:** Cloudflare quick tunnel (`cloudflared tunnel --url`) рвал WebSocket-соединение каждые ~60 секунд. Quick tunnel предназначен для быстрого тестирования и не гарантирует стабильности. Серверный heartbeat (ping каждые 25 сек) помогал частично, но плагин всё равно терял соединение.

Причины:
- Quick tunnel — эфемерный URL, нет привязки к аккаунту Cloudflare
- Idle timeout на Free/Pro планах: **100 секунд** ([Cloudflare docs](https://developers.cloudflare.com/fundamentals/reference/connection-limits/))
- Quick tunnel не поддерживает настройку `noTLSVerify`, `originServerName` и других параметров стабильности

**Решение: Named tunnel с аккаунтом Cloudflare:**

```bash
# 1. Авторизация:
cloudflared tunnel login

# 2. Создание именованного туннеля:
cloudflared tunnel create figma-ws

# 3. Конфигурация ~/.cloudflared/config.yml:
tunnel: <TUNNEL_UUID>
credentials-file: /root/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: figma-ws.yourdomain.com
    service: ws://localhost:3055
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
      tcpKeepAlive: 30s
  - service: http_status:404

# 4. DNS-запись:
cloudflared tunnel route dns figma-ws figma-ws.yourdomain.com

# 5. Запуск:
cloudflared tunnel run figma-ws
```

**Heartbeat на стороне сервера (обязательно):**

```javascript
// WebSocket server — ping каждые 25 секунд
const HEARTBEAT_INTERVAL = 25000;

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  const interval = setInterval(() => {
    if (!ws.isAlive) { ws.terminate(); return; }
    ws.isAlive = false;
    ws.ping();
  }, HEARTBEAT_INTERVAL);

  ws.on('close', () => clearInterval(interval));
});
```

**Источники:**
- [Cloudflare Quick Tunnels docs](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
- [Cloudflare Connection limits](https://developers.cloudflare.com/fundamentals/reference/connection-limits/)
- [Cloudflare Community: WebSocket timeout](https://community.cloudflare.com/t/websocket-timeout-over-cloudflare-tunnel/524610)

---

### Гипотеза 5: Latency — VM в Германии, Figma серверы ещё где-то

**Статус:** Частично подтверждена, но не критична.

**Наш опыт:** VM расположена в Германии (Hetzner). Figma серверы — AWS US (преимущественно `us-east-1`, `us-west-2`). Это даёт ~100-150ms RTT. Для REST API запросов это незначительно. Для WebSocket-соединений в реальном времени — ощутимо, но не фатально.

`capture.js` отправляет сериализованный DOM на Figma серверы одним POST-запросом — латентность влияет только на время доставки, не на стабильность.

**Реальная проблема** — не абсолютная задержка, а **jitter и packet loss** на длинном пути, которые усугубляют нестабильность WebSocket через Cloudflare.

**Решение:**

```bash
# Проверка латентности до Figma:
curl -o /dev/null -s -w "time_connect: %{time_connect}s\ntime_total: %{time_total}s\n" \
  https://www.figma.com

# Для WebSocket: jitter можно компенсировать увеличением буфера и reconnect-логикой
# Для capture.js: латентность не критична (одноразовый POST)
```

**Вывод:** Латентность — не блокер. Основные проблемы кроются в аутентификации и туннелировании, а не в физическом расстоянии.

---

### Гипотеза 6: Plugin localhost-only — manifest жёстко привязан

**Статус:** Подтверждена полностью.

**Наш опыт:** Плагин `cursor-talk-to-figma-mcp` имеет в manifest:

```json
{
  "networkAccess": {
    "allowedDomains": ["localhost"],
    "reasoning": "WebSocket connection to local MCP server"
  }
}
```

И хардкод `wsUrl = "ws://localhost:3055"` в коде плагина. Для работы с удалённой VM пришлось:

1. Форкнуть плагин
2. Изменить `allowedDomains` на `["*"]`
3. Заменить `wsUrl` на Cloudflare tunnel URL
4. Опубликовать кастомную версию плагина (или запускать как development plugin)

**Решение:**

```json
// manifest.json — патченная версия:
{
  "networkAccess": {
    "allowedDomains": ["*"],
    "reasoning": "WebSocket connection to remote MCP server via tunnel"
  }
}
```

```typescript
// code.ts — параметризация wsUrl:
const DEFAULT_WS_URL = "ws://localhost:3055";
const wsUrl = figma.root.getPluginData("wsUrl") || DEFAULT_WS_URL;

// Позволяет задать URL через UI плагина без пересборки
```

**Важно:** Публикация кастомного плагина в Figma Community требует review. Для личного использования достаточно Development plugin (загружается из локальной директории через Figma Desktop → Plugins → Development → Import plugin from manifest).

**Источники:**
- [Figma Plugin Network Access](https://developers.figma.com/docs/plugins/api/properties/figma-network-access/)
- [cursor-talk-to-figma-mcp на GitHub](https://github.com/grab/cursor-talk-to-figma-mcp)

---

### Гипотеза 7: Headless detection — Figma SPA может скрывать canvas

**Статус:** Частично подтверждена.

**Наш опыт:** Playwright в headless-режиме успешно загружал Figma и проходил авторизацию через cookies. Однако:

- Figma — **полностью canvas-based SPA**. Весь UI отрисовывается на `<canvas>`, а не через DOM-элементы. Это значит, что `page.click('button.add-frame')` невозможен — кнопок в DOM нет.
- В headless-режиме (без GPU) canvas-рендеринг может быть неполным или отключён
- Figma может детектить headless-окружение через:
  - `navigator.webdriver` === `true` (Playwright по умолчанию)
  - Отсутствие WebGL/GPU
  - Canvas fingerprint аномалии
  - CDP (Chrome DevTools Protocol) артефакты

**Решение для headed-окружения на VM:**

```bash
# 1. Установка Xvfb + x11vnc:
sudo apt-get install -y xvfb x11vnc

# 2. Запуск виртуального дисплея:
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99

# 3. VNC-доступ:
x11vnc -display :99 -nopw -forever &

# 4. Playwright в headed-режиме:
# const browser = await chromium.launch({ headless: false });
```

**Stealth-патчи для Playwright:**

```bash
npm install playwright-extra playwright-extra-plugin-stealth
```

```typescript
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
chromium.use(stealth());

const browser = await chromium.launch({
  headless: false,
  args: ['--disable-blink-features=AutomationControlled']
});
```

**Ограничения:** Даже с stealth и headed-режимом, взаимодействие с canvas-UI Figma требует координатного клика (pixel-based), что крайне хрупко. Это делает подход Playwright + Figma UI непрактичным для автоматизации.

**Источники:**
- [Playwright Stealth — bypass bot detection (2026)](https://alterlab.io/blog/playwright-bot-detection-what-actually-works-in-2026)
- [Castle.io — Detect Headless Chrome bots](https://blog.castle.io/how-to-detect-headless-chrome-bots-instrumented-with-playwright/)

---

## 3. Сравнение альтернативных стеков

### 3.1. Таблица сравнения туннелей

| Критерий | Cloudflare Quick Tunnel | Cloudflare Named Tunnel | ngrok (с auth) | Tailscale Funnel | SSH Reverse Tunnel |
|----------|------------------------|------------------------|----------------|-----------------|-------------------|
| **Стоимость** | Бесплатно | Бесплатно (нужен домен) | Free tier / $8/мес Pro | Бесплатно (Personal) | Бесплатно |
| **Настройка** | 1 команда | 10 мин | 2 мин | 5 мин | 1 команда |
| **WebSocket** | Нестабильно | Стабильно с heartbeat | Стабильно | Не гарантировано | Стабильно |
| **TLS/wss://** | Автоматический | Автоматический | Автоматический | Автоматический | Нужен отдельно |
| **Idle timeout** | ~60-100 сек | 100 сек (Free), 600 сек (Biz) | 60 сек (Free) | Неизвестно | Настраиваемый |
| **Постоянный URL** | Нет (эфемерный) | Да | Да (платный) | Да | Нет |
| **Скорость** | 3.47 MB/s | 3.47 MB/s | 1.10 MB/s | Зависит от маршрута | Зависит от SSH |
| **Фильтрация доступа** | Нет | Cloudflare Access | ngrok auth | Tailscale ACL | SSH ключи |
| **Устойчивость** | Низкая | Высокая | Средняя | Высокая | Средняя |

**Источники:**
- [LocalCan: Speed Test Results 2025](https://www.localcan.com/blog/ngrok-vs-cloudflare-tunnel-vs-localcan-speed-test-2025)
- [ngrok vs Cloudflare Tunnel vs Tailscale 2025-26](https://instatunnel.my/blog/comparing-the-big-three-a-comprehensive-analysis-of-ngrok-cloudflare-tunnel-and-tailscale-for-modern-development-teams)

### 3.2. VNC vs Chrome DevTools Protocol (CDP) через туннель

| Критерий | VNC (Xvfb + x11vnc + noVNC) | Chrome CDP через туннель |
|----------|------------------------------|--------------------------|
| **Что видим** | Полный рабочий стол VM | Только вкладки браузера |
| **Взаимодействие** | Мышь + клавиатура через VNC | Программное через Playwright/CDP |
| **Нагрузка на сеть** | Высокая (видеопоток) | Низкая (JSON-команды) |
| **Задержка** | Ощутимая (кадры) | Минимальная |
| **Настройка** | Xvfb + x11vnc + websockify + noVNC | Chrome `--remote-debugging-port` |
| **Figma canvas** | Можно кликать визуально | Нельзя — canvas не DOM |
| **Плагины Figma** | Можно запускать через UI | Нельзя запускать через CDP |

### 3.3. Анализ каждого стека

#### Cloudflare Named Tunnel

**Плюсы:** Бесплатный, быстрый, автоматический TLS, поддержка WebSocket, интеграция с Cloudflare Access для аутентификации.

**Минусы:** Нужен собственный домен, idle timeout 100 сек на Free — heartbeat обязателен. Конфигурация сложнее quick tunnel.

**Оценка для нашего кейса:** Лучший вариант для WebSocket-bridge плагина. Стабильнее quick tunnel, бесплатный, heartbeat решает idle timeout.

#### ngrok

**Плюсы:** Простейшая настройка (`ngrok http 3055`), встроенная аутентификация, инспектор трафика.

**Минусы:** Free tier — URL меняется при рестарте, скорость ~3x ниже Cloudflare, лимит 1 туннель на Free.

**Оценка:** Хорош для быстрого тестирования, но для постоянной работы Cloudflare Named Tunnel выигрывает.

#### Tailscale

**Плюсы:** Mesh VPN — VM и macOS в одной виртуальной сети. Не нужен внешний endpoint — `ws://vm-hostname:3055` работает напрямую. Шифрование end-to-end через WireGuard.

**Минусы:** Требует установки Tailscale на обеих машинах. Funnel (для внешнего доступа) не гарантирует WebSocket. Для нашего кейса (Figma плагин в браузере) — плагин работает в контексте `figma.com`, не может обращаться к Tailscale IP.

**Оценка:** Идеален для SSH и прямого доступа между машинами, но **не решает задачу Figma-плагина** — плагин запускается в sandbox браузера на `figma.com` и не имеет доступа к Tailscale-сети.

**Источники:**
- [Tailscale Funnel docs](https://tailscale.com/docs/features/tailscale-funnel)
- [Tailscale Funnel: Securely Expose Local Services](https://tailscale.com/blog/introducing-tailscale-funnel)

#### SSH Reverse Tunnel

**Плюсы:** Нулевые зависимости — SSH уже есть. Полный контроль над шифрованием. Настраиваемый idle timeout.

**Минусы:** Нет TLS-терминации (wss:// требует дополнительный Nginx). URL не человекочитаемый. Туннель падает при разрыве SSH.

**Решение:**

```bash
# На VM (Германия) → macOS (локально):
# Пробрасываем порт 3055 VM на macOS
ssh -R 3055:localhost:3055 user@macos-ip

# Или наоборот — macOS → VM, если MCP-сервер на VM:
ssh -L 3055:localhost:3055 user@vm-ip

# Для стабильности — autossh:
autossh -M 0 -f -N -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" \
  -R 3055:localhost:3055 user@macos-ip
```

**Оценка:** Хорош как fallback, но не решает задачу Figma-плагина (плагину нужен публичный wss:// URL).

---

## 4. Best practice на сегодня

### 4.1. Архитектурное решение: что реально работает

На основании всех экспериментов, **единственный надёжный вариант для Figma-автоматизации** на сегодня:

```
┌─────────────────────────────────────────────────────┐
│                    macOS (локально)                  │
│                                                     │
│  Claude Code ──► Figma MCP (html-to-design)         │
│       │                    │                        │
│       │              capture.js                     │
│       │                    │                        │
│       │              Chrome (залогинен)              │
│       │                    │                        │
│       ▼                    ▼                        │
│  Код (в репо) ──────► Figma (облако)                │
└─────────────────────────────────────────────────────┘
```

**Для удалённой VM — гибридный подход:**

```
┌──────────────────────┐         ┌──────────────────────┐
│   Linux VM (Германия)│         │   macOS (локально)   │
│                      │         │                      │
│  Claude Code         │  SSH    │  Chrome              │
│  (кодогенерация,     │◄───────►│  (залогинен в Figma) │
│   REST API read,     │         │                      │
│   файлы проекта)     │         │  Figma MCP           │
│                      │         │  (html-to-design)    │
└──────────────────────┘         └──────────────────────┘
```

### 4.2. Конкретные рекомендации

#### Рекомендация 1: Используй локальный macOS для Figma-операций

Официальный Figma MCP работает надёжно только локально. Не пытайся воспроизвести полный конвейер `generate_figma_design` на удалённой VM — это нецелесообразно.

#### Рекомендация 2: Используй удалённую VM для всего остального

REST API через PAT (Personal Access Token) работает идеально с любой машины:

```bash
# Чтение файла:
curl -H "X-Figma-Token: $FIGMA_PAT" \
  "https://api.figma.com/v1/files/<FILE_KEY>"

# Чтение конкретного node:
curl -H "X-Figma-Token: $FIGMA_PAT" \
  "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_ID>"

# Экспорт изображений:
curl -H "X-Figma-Token: $FIGMA_PAT" \
  "https://api.figma.com/v1/images/<FILE_KEY>?ids=<NODE_ID>&format=png&scale=2"
```

Используй `framelink-figma-mcp` или аналогичный MCP-сервер на VM для **чтения** дизайна и генерации кода на основе Figma-макетов.

#### Рекомендация 3: Если нужен write-доступ к Figma с VM — WebSocket-bridge с Named Tunnel

```bash
# Минимальный стек:
# 1. На VM: WebSocket MCP-сервер
npx cursor-talk-to-figma-mcp  # порт 3055

# 2. На VM: Cloudflare Named Tunnel
cloudflared tunnel run figma-ws  # → wss://figma-ws.yourdomain.com

# 3. На macOS (в Figma): кастомный плагин с wsUrl = wss://figma-ws.yourdomain.com
# 4. Heartbeat обязателен (см. раздел 2, Гипотеза 4)
```

#### Рекомендация 4: Для kopeika — оптимальный workflow

1. **Дизайн в Figma** — вручную на macOS или через локальный Claude Code + MCP
2. **Чтение дизайна на VM** — REST API через PAT (`framelink-figma-mcp`)
3. **Кодогенерация на VM** — Claude Code читает Figma через MCP, генерирует React + Tailwind компоненты
4. **Обратная связь** — скриншоты/экспорт из Figma для сравнения с реализацией

Подробнее о workflow для kopeika — в [04-recommendations-kopeika.md](./04-recommendations-kopeika.md).

### 4.3. Чек-лист безопасности

- [ ] **Figma PAT** — хранить в `.env`, не коммитить (добавить в `.gitignore`)
- [ ] **Cookies** — `storage-state.json` содержит полный доступ к аккаунту. Хранить зашифрованно, не коммитить
- [ ] **Cloudflare tunnel** — использовать Cloudflare Access для ограничения доступа к WebSocket endpoint
- [ ] **SSH ключи** — Ed25519, passphrase, `ssh-agent`
- [ ] **Кастомный плагин** — `allowedDomains: ["*"]` открывает плагин для любых доменов. Ограничить конкретным tunnel-доменом

---

## 5. Выводы

### Что реально работает

| Задача | Работает | Где | Как |
|--------|----------|-----|-----|
| **Чтение Figma-файлов** | Да | Любая машина | REST API + PAT |
| **Экспорт изображений** | Да | Любая машина | REST API + PAT |
| **Создание/модификация дизайна** | Да | Только macOS (локально) | Figma MCP `html-to-design` |
| **Создание через WebSocket-плагин** | Условно | VM с Named Tunnel + heartbeat | cursor-talk-to-figma-mcp (нестабильно) |
| **Playwright UI-автоматизация Figma** | Нет | — | Canvas-based UI не автоматизируется |

### Что не работает (и не стоит пытаться)

1. **Figma REST API для создания узлов** — таких эндпоинтов нет и не предвидится. Figma осознанно разделяет Plugin API (write, только в браузере) и REST API (read-only, любой клиент). См. [Compare the Figma APIs](https://developers.figma.com/compare-apis/).

2. **Playwright + Figma canvas** — canvas-based UI не имеет DOM-элементов для взаимодействия. Координатные клики (pixel-based) — хрупкие и ненадёжные.

3. **Cloudflare Quick Tunnel для WebSocket** — нестабилен, URL эфемерный, idle timeout ~60 сек. Не годится для production.

### Минимальный стек для kopeika

```
Для Figma write-операций:
  macOS + Chrome + Claude Code + Figma MCP (html-to-design)

Для Figma read-операций с VM:
  Linux VM + framelink-figma-mcp + Figma PAT

Для гибридного workflow (если write нужен с VM):
  Linux VM + cursor-talk-to-figma-mcp + Cloudflare Named Tunnel
  + macOS + Figma + кастомный плагин + heartbeat
```

### Итоговая рекомендация

**Не усложняй.** Для проекта kopeika (один разработчик, одна машина macOS) оптимальный подход:

1. Дизайн — локально через Claude Code + Figma MCP
2. Кодогенерация по дизайну — на VM через REST API (read-only)
3. Не пытаться воспроизвести полный write-конвейер на удалённой VM — трудозатраты несоизмеримы с выгодой

Удалённая автоматизация Figma write-операций — это инженерно решаемая, но **непропорционально сложная** задача для текущего масштаба проекта. Figma архитектурно привязывает write-операции к браузерному контексту (Plugin API), и обойти это ограничение без потери стабильности пока невозможно.

---

**Источники:**
- [Figma REST API Documentation](https://developers.figma.com/docs/rest-api/)
- [Figma Plugin API Reference](https://developers.figma.com/docs/plugins/api/api-reference/)
- [Compare the Figma APIs](https://developers.figma.com/compare-apis/)
- [Figma MCP Server — Code to Canvas](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/)
- [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [cursor-talk-to-figma-mcp (GitHub)](https://github.com/grab/cursor-talk-to-figma-mcp)
- [Cloudflare Tunnels FAQ](https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/)
- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
- [Cloudflare WebSocket docs](https://developers.cloudflare.com/network/websockets/)
- [Cloudflare Connection Limits](https://developers.cloudflare.com/fundamentals/reference/connection-limits/)
- [Tailscale Funnel docs](https://tailscale.com/docs/features/tailscale-funnel)
- [ngrok vs Cloudflare Tunnel vs Tailscale (2025-26)](https://instatunnel.my/blog/comparing-the-big-three-a-comprehensive-analysis-of-ngrok-cloudflare-tunnel-and-tailscale-for-modern-development-teams)
- [LocalCan Speed Test 2025](https://www.localcan.com/blog/ngrok-vs-cloudflare-tunnel-vs-localcan-speed-test-2025)
- [Playwright Stealth — Bot Detection (2026)](https://alterlab.io/blog/playwright-bot-detection-what-actually-works-in-2026)
- [Figma MCP + html-to-design capture.js](https://medium.com/@ux_ankit/two-things-most-designers-miss-about-the-figma-mcp-tool-clipboard-mode-external-website-capture-781e38fa689d)
- [wstunnel — WebSocket tunneling](https://github.com/erebe/wstunnel)
