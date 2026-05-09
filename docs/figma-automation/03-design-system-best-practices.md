# 03 — Best Practices дизайн-систем в Figma

> Контекст: проект **kopeika** — iOS-first PWA для учёта финансов.
> В файле `G6uJMia6jzgTEDJbjQiCVW` сейчас один плоский фрейм 2118x5881 (импорт HTML).
> Цель этого документа — описать, как превратить плоский импорт в полноценную дизайн-систему с переиспользуемыми компонентами.
>
> Смежные документы: [01-remote-vs-local.md](./01-remote-vs-local.md) | [02-figma-api-mcp-ecosystem.md](./02-figma-api-mcp-ecosystem.md) | [04-recommendations-kopeika.md](./04-recommendations-kopeika.md)

---

## Содержание

1. [Основы: Component vs Frame vs Group](#1-основы-component-vs-frame-vs-group)
2. [Component Set с вариантами](#2-component-set-с-вариантами)
3. [Variables](#3-variables)
4. [Auto-layout](#4-auto-layout)
5. [Работа с Instance](#5-работа-с-instance)
6. [Программное обновление компонентов](#6-программное-обновление-компонентов--ключевой-вопрос)
7. [Сценарий: «Меняю Button — отражается на 10 экранах»](#7-сценарий-меняю-button--отражается-на-10-экранах)
8. [Чеклист перехода от плоского дизайна к дизайн-системе](#8-чеклист-перехода-от-плоского-дизайна-к-дизайн-системе)

---

## 1. Основы: Component vs Frame vs Group

### Frame

**Frame** — базовый контейнер в Figma. Аналог `<div>` в HTML. Фреймы:

- Имеют собственные размеры (width/height), не зависящие от содержимого (если не включен auto-layout).
- Поддерживают auto-layout, constraints, clip content, fill/stroke.
- Могут быть вложенными (parent/child).
- Используются для экранов, секций, карточек — любых контейнеров.

**Но:** фрейм нельзя переиспользовать. Если скопировать фрейм 10 раз, получится 10 независимых копий. Изменение одной копии не затронет остальные.

### Group

**Group** — простая обёртка для нескольких слоёв. Аналог `<g>` в SVG. Группы:

- Не имеют собственных размеров — их bounding box определяется содержимым.
- Не поддерживают auto-layout, constraints, fill, stroke.
- Полезны для временного объединения элементов при перемещении / выравнивании.

**Когда использовать Group:** почти никогда в дизайн-системе. Group — инструмент для быстрой работы, но не для архитектуры.

### Component

**Component** — это Frame с суперспособностью: возможность создавать **Instance** (копии), которые автоматически обновляются при изменении оригинала.

| Понятие | Описание |
|---------|----------|
| **Main Component** (Master) | Оригинальный компонент — единственный источник правды. Имеет иконку с четырьмя ромбами. |
| **Instance** | Копия Main Component. Имеет иконку с одним ромбом. Наследует все свойства master-компонента. |
| **Detached Instance** | Бывший instance, отсоединённый от master. Теряет связь — становится обычным фреймом. |

**Критическое различие для kopeika:**

Сейчас в файле `G6uJMia6jzgTEDJbjQiCVW` все элементы — **фреймы**. Это значит, что Button, CategoryCard, TransactionRow — все продублированы N раз без связи. Изменение одной кнопки не затронет остальные. Чтобы это исправить, нужно превратить повторяющиеся элементы в **Components**.

> **Правило:** если элемент используется больше одного раза — он должен быть Component.

**Ссылки:**
- [Component architecture in Figma](https://www.figma.com/best-practices/component-architecture/) — официальный гайд Figma
- [Figma Help: Components](https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma)

---

## 2. Component Set с вариантами

### Что такое Component Set

**Component Set** — контейнер, объединяющий несколько вариантов одного компонента. Вместо трёх отдельных компонентов `Button-Primary`, `Button-Secondary`, `Button-Disabled` — один Component Set `Button` с property `Style = Primary | Secondary | Disabled`.

### Пример для kopeika: Button

```
Component Set: Button
├── Variant: Style=Primary, Size=Large     → зелёная кнопка «Добавить расход»
├── Variant: Style=Primary, Size=Medium    → зелёная кнопка в карточке
├── Variant: Style=Secondary, Size=Large   → белая кнопка «Отмена»
├── Variant: Style=Secondary, Size=Medium  → белая кнопка в модальном окне
├── Variant: Style=Disabled, Size=Large    → серая кнопка (неактивная)
└── Variant: Style=Disabled, Size=Medium   → серая кнопка (неактивная)
```

### Component Properties — четыре типа

Figma поддерживает четыре типа свойств компонента:

#### 1. Variant Property

Определяет вариации компонента внутри Component Set. Каждая комбинация variant properties — отдельный вариант с визуальным представлением на холсте.

```
Button:
  Variant Property "Style":  Primary | Secondary | Disabled
  Variant Property "Size":   Large | Medium | Small
```

- Применяется только к Component Set (не к одиночным компонентам).
- Значение по умолчанию определяется вариантом в верхнем левом углу Component Set.

#### 2. Boolean Property

Переключатель true/false — показывает или скрывает вложенный слой.

```
Button:
  Boolean "Show Icon": true | false    → показывает/скрывает иконку слева
  Boolean "Show Badge": true | false   → показывает/скрывает бейдж-счётчик
```

- На данный момент Boolean Property управляет только видимостью слоёв.
- Создание: выбрать вложенный слой → Appearance → Apply property → Boolean.

#### 3. Instance Swap Property

Позволяет заменять вложенные instance-компоненты внутри компонента.

```
CategoryCard:
  Instance Swap "Icon": icon-food | icon-transport | icon-rent | ...
```

- Можно задать **Preferred Values** — список рекомендуемых компонентов для замены, чтобы пользователь не искал среди сотен иконок.
- Создание: выбрать вложенный instance → Apply instance swap property.

#### 4. Text Property

Указывает, какие текстовые слои можно редактировать в instance.

```
TransactionRow:
  Text "Title": "Кофе в Surf"
  Text "Amount": "-150 ₽"
  Text "Category": "Еда"
```

- Не поддерживает rich text (списки, верхний индекс и т.д.).
- Создание: выбрать текстовый слой → Text → Apply variable/property.

### Naming Conventions

Используйте слэш (`/`) для иерархической организации:

```
Button/Primary
Button/Secondary
Button/Disabled
Icon/Category/Food
Icon/Category/Transport
Icon/Navigation/Back
Icon/Navigation/Settings
```

Figma автоматически сгруппирует компоненты по иерархии слэшей в панели Assets.

### Nested Components (вложенные компоненты)

Компоненты могут содержать instance других компонентов:

```
TransactionRow (Component)
├── Icon (Instance of CategoryIcon)    → Instance Swap property
├── TextGroup (Frame with auto-layout)
│   ├── Title (Text)                   → Text property
│   └── Category (Text)               → Text property
└── Amount (Text)                      → Text property
```

**Правило вложенности:** чем атомарнее компоненты — тем проще их переиспользовать. Atomic Design в Figma:

| Уровень | Примеры для kopeika |
|---------|---------------------|
| Atoms | Icon, Badge, Label, Divider |
| Molecules | Button (icon + text), InputField (label + input + helper) |
| Organisms | TransactionRow (icon + texts + amount), CategoryCard (icon + label + progress) |
| Templates | TransactionList, CategoryGrid, DonutChart + Legend |
| Pages | Главный экран, Экран добавления транзакции, Настройки |

**Ссылки:**
- [Create and use variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants)
- [Explore component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties)

---

## 3. Variables

### Что такое Variables

Variables — именованные значения, которые можно привязать к свойствам элементов вместо «захардкоженных» значений. Это аналог **design tokens** из мира разработки.

Вместо `#2ECC71` в 47 местах — переменная `color/primary`, которую можно изменить один раз.

### Типы переменных

| Тип | Значение | Примеры использования в kopeika |
|-----|----------|---------------------------------|
| **Color** | Сплошной цвет | `color/primary: #2ECC71`, `color/bg: #FFFFFF`, `color/expense: #E74C3C` |
| **Number** | Числовое значение (целое или до сотых) | `spacing/xs: 4`, `spacing/sm: 8`, `radius/card: 12`, `size/icon: 24` |
| **String** | Строка текста | `font/family: "SF Pro"`, `text/add-expense: "Добавить расход"` |
| **Boolean** | true / false | `feature/dark-mode: true`, `show/onboarding: false` |

### Collections (коллекции)

Collection — логическая группа переменных с одинаковым набором modes. Рекомендуемая структура коллекций для kopeika:

```
Collection: Primitives
├── color/green-500: #2ECC71
├── color/red-500: #E74C3C
├── color/gray-100: #F5F5F5
├── color/gray-900: #1A1A1A
└── ...

Collection: Semantic
├── color/primary       → alias → Primitives/color/green-500
├── color/expense       → alias → Primitives/color/red-500
├── color/income        → alias → Primitives/color/green-500
├── color/background    → alias → Primitives/color/gray-100
├── color/text-primary  → alias → Primitives/color/gray-900
└── ...

Collection: Spacing
├── space/xs: 4
├── space/sm: 8
├── space/md: 16
├── space/lg: 24
├── space/xl: 32
└── ...

Collection: Component-specific
├── button/height: 48
├── button/radius: 12
├── card/radius: 16
├── card/padding: 16
└── ...
```

**Alias-переменные** — переменная, которая ссылается на другую переменную. Это ключ к архитектуре: `color/primary` (semantic) ссылается на `color/green-500` (primitive). При смене палитры достаточно поменять alias.

### Modes (режимы)

Mode — альтернативное значение переменной в рамках одной коллекции. Главный use case — **тёмная тема**.

```
Collection: Semantic
                        Mode: Light         Mode: Dark
color/background        #FFFFFF             #1A1A1A
color/text-primary      #1A1A1A             #F5F5F5
color/card-bg           #F5F5F5             #2D2D2D
color/primary           #2ECC71             #3DDB85
color/expense           #E74C3C             #FF6B6B
```

Другие применения modes:
- **Responsive:** Desktop / Tablet / Mobile — разные значения spacing.
- **Локализация:** RU / EN — разные строки текста.
- **Accessibility:** Стандартная тема / Высокий контраст.

Переключение mode на фрейме мгновенно обновляет все привязанные переменные внутри.

### Scoping (области видимости)

Scoping ограничивает, где переменная может использоваться. Доступен для Color, Number, String переменных:

- **Color scoping:** Fill, Stroke, или оба.
- **Number scoping:** Width, Height, Gap, Padding, Border Radius, Font Size, и т.д.
- **String scoping:** Font Family, Font Style.

Пример: переменная `space/md: 16` со scoping `Gap, Padding` не появится в выборе для `Border Radius` — меньше шума, меньше ошибок.

### Доступность Variables по тарифам Figma

| Функция | Starter (Free) | Professional | Organization | Enterprise |
|---------|:-:|:-:|:-:|:-:|
| Создание переменных | Ограниченно | Да | Да | Да |
| Количество modes на коллекцию | 1 (без modes) | **до 10** | **до 20** | **Безлимитно** (extended collections) |
| Variables в прототипах | Нет | Да | Да | Да |
| Публикация variables в Team Library | Нет | Да | Да | Да |
| REST API для variables | Нет | Нет | Нет | **Только Enterprise** |
| Extended collections (наследование) | Нет | Нет | Нет | **Только Enterprise** |
| Лимит переменных на коллекцию | — | 5 000 | 5 000 | 5 000 |

**Что это значит для kopeika (Figma Pro):**

- Доступно до **10 modes** на коллекцию — достаточно для Light/Dark тем.
- Можно публиковать variables в Team Library.
- REST API для variables **не доступен** — нельзя программно читать/писать переменные через REST API. Но Plugin API (через cursor-talk-to-figma-mcp) имеет доступ к variables.

### Typography: Styles vs Variables

На текущий момент (2025-2026) Figma **не имеет полноценного типа variable для типографики**. Типографические стили (font family + weight + size + line height + letter spacing) задаются через **Text Styles**, а не через Variables.

Однако отдельные числовые свойства типографики (font size, line height) можно привязать к Number variables. Рекомендуемый подход:

```
Text Styles:                          Variables для числовых свойств:
├── Heading/H1                        ├── fontSize/h1: 28
├── Heading/H2                        ├── fontSize/h2: 22
├── Body/Regular                      ├── fontSize/body: 16
├── Body/Small                        ├── fontSize/small: 13
├── Caption                           └── fontSize/caption: 11
└── Button
```

**Ссылки:**
- [Overview of variables, collections, and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)
- [Guide to variables in Figma](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)

---

## 4. Auto-layout

### Аналогия с CSS Flexbox

Auto-layout в Figma — визуальный аналог CSS Flexbox. Он автоматически распределяет дочерние элементы по горизонтали или вертикали с заданными отступами.

| CSS Flexbox | Figma Auto-layout |
|-------------|-------------------|
| `flex-direction: row` | Horizontal layout (→) |
| `flex-direction: column` | Vertical layout (↓) |
| `gap: 8px` | Gap between items: 8 |
| `padding: 16px` | Padding: 16 (все стороны) |
| `justify-content` | Primary axis alignment |
| `align-items` | Counter axis alignment |
| `flex-wrap: wrap` | Wrap (доступен с 2023, обновлён в 2025) |

С мая 2025 Figma также поддерживает **Grid auto-layout flow** — аналог CSS Grid.

### Padding и Gap

**Padding** — внутренние отступы от края фрейма до содержимого:
- Uniform: одно значение для всех сторон.
- Horizontal/Vertical: раздельно по осям.
- Individual: отдельно Top, Right, Bottom, Left (как в CSS).

**Gap** — расстояние между дочерними элементами:
- Фиксированное число (например, 8px).
- `Auto` — аналог `justify-content: space-between` в CSS.

Оба свойства можно привязать к **Variables** для единообразия. Например: `gap: var(space/sm) = 8`.

### Resizing: Fixed, Hug, Fill

| Режим | Поведение | CSS-аналог |
|-------|-----------|------------|
| **Fixed** | Элемент сохраняет заданный размер | `width: 200px` |
| **Hug** | Фрейм сжимается до размера содержимого + padding | `width: fit-content` |
| **Fill** | Элемент растягивается на доступное пространство в родителе | `flex: 1` / `width: 100%` |

**Типичная комбинация для kopeika:**

```
TransactionRow (Fill по ширине, Hug по высоте)
├── Icon (Fixed 40x40)
├── TextGroup (Fill по ширине, Hug по высоте)
│   ├── Title (Fill по ширине)
│   └── Category (Fill по ширине)
└── Amount (Hug по ширине)
```

Результат: строка транзакции растягивается на всю ширину экрана, иконка фиксирована, текст заполняет доступное пространство, сумма прижата вправо.

### Nested Auto-layouts для сложных компонентов

Сложные компоненты строятся через вложенные auto-layout фреймы:

```
CategoryCard (Vertical auto-layout, padding: 16, gap: 12)
├── Header (Horizontal auto-layout, gap: 8)
│   ├── Icon (Fixed 32x32)
│   └── CategoryName (Fill)
├── ProgressBar (Horizontal auto-layout)
│   └── FilledBar (Fill, но с max-width через constraints)
└── Footer (Horizontal auto-layout, alignment: space-between)
    ├── Spent (Hug)
    └── Budget (Hug)
```

### Responsive Design через Auto-layout

Auto-layout — основной инструмент responsive design в Figma:

1. **Fill Container** на корневых элементах — они растягиваются на ширину родительского фрейма.
2. **Min/Max width** (через constraints) — ограничивает минимальную и максимальную ширину.
3. **Wrap** — перенос элементов на новую строку при нехватке места (как `flex-wrap`).
4. **Modes для spacing** — переменные с разными значениями для Desktop/Tablet/Mobile.

Для iOS-first PWA kopeika основной экран — 390px (iPhone). Auto-layout гарантирует, что при изменении ширины фрейма все элементы адаптируются автоматически.

**Ссылки:**
- [Guide to auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout)
- [Auto layout fundamentals](https://help.figma.com/hc/en-us/articles/31351261703063-FD4B-Auto-layout-fundamentals)
- [Horizontal and vertical flows in auto layout](https://help.figma.com/hc/en-us/articles/31289464393751-Use-the-horizontal-and-vertical-flows-in-auto-layout)

---

## 5. Работа с Instance

### Что такое Instance

Instance — копия Main Component, сохраняющая живую связь с оригиналом. Любое изменение Main Component автоматически транслируется во все instances.

### Overrides — что можно менять без Detach

В instance можно менять (override) следующие свойства **без потери связи** с master:

| Override | Пример |
|----------|--------|
| Текст | Изменить «Кофе» на «Такси» в TransactionRow |
| Fill / Stroke | Поменять цвет фона карточки |
| Размер (если auto-layout) | Растянуть кнопку на всю ширину |
| Visibility слоёв | Скрыть иконку, показать бейдж |
| Instance Swap | Заменить иконку еды на иконку транспорта |
| Component Property значения | Переключить variant с Primary на Secondary |
| Effect (тени, blur) | Добавить/убрать тень |

**Чего нельзя без Detach:**
- Добавить новый слой в instance.
- Удалить слой (можно только скрыть).
- Изменить порядок слоёв.
- Изменить иерархию вложенности.

### Detach Instance и почему его ИЗБЕГАТЬ

**Detach Instance** (`Right click → Detach instance`) превращает instance обратно в обычный frame. После этого:

- Связь с Main Component **разрывается навсегда**.
- Будущие обновления master-компонента **не дойдут** до detached instance.
- Detached instance — главный враг дизайн-системы. Каждый detach — это +1 элемент, который придётся обновлять вручную.

**Когда detach допустим:**
- Одноразовый элемент, который точно больше не будет переиспользован.
- Элемент нужно фундаментально перестроить (добавить слои, изменить структуру).
- Но даже в этих случаях — лучше обновить Main Component или создать новый вариант.

**Профилактика detach:**
- Делайте компоненты гибкими: больше вариантов, больше Boolean properties для toggle слоёв.
- Используйте Instance Swap для замены вложенных элементов.
- Если кто-то detach'ит — значит, компонент недостаточно гибкий. Это сигнал к улучшению master-компонента.

### Reset Instance и Swap Instance

- **Reset Instance** — сбрасывает все overrides instance до значений master-компонента.
- **Swap Instance** — заменяет instance на instance другого компонента, сохраняя при этом совместимые overrides (тексты, размеры).

### Что происходит при обновлении Main Component

Механизм распространения изменений:

1. Вы изменяете **Main Component** (например, меняете border-radius кнопки с 8 на 12).
2. Figma мгновенно обновляет **все instances** этого компонента в файле.
3. Если компонент опубликован в **Team Library** — при открытии файлов-потребителей появится уведомление об обновлении. Пользователь может принять или отклонить обновление.
4. **Overrides сохраняются** — если в instance был изменён текст, после обновления master этот текст останется изменённым. Обновится только то, что не было override'нуто.

**Ссылки:**
- [Apply changes to instances](https://help.figma.com/hc/en-us/articles/360039150733-Apply-changes-to-instances)
- [Detach an instance from the component](https://help.figma.com/hc/en-us/articles/360038665754-Detach-an-instance-from-the-component)

---

## 6. Программное обновление компонентов — КЛЮЧЕВОЙ ВОПРОС

> Можно ли через AI/API программно обновить master-компонент в Figma?

Это критический вопрос для автоматизации дизайн-системы kopeika. Рассмотрим все доступные инструменты.

### 6.1. Figma REST API — НЕТ записи узлов

**Вердикт: нельзя обновлять компоненты.**

Figma REST API — **read-only** для узлов (nodes). Доступные операции:

| Операция | Доступность |
|----------|------------|
| Чтение файла (GET /files/:key) | Да |
| Чтение узлов (GET /files/:key/nodes) | Да |
| Экспорт изображений (GET /images/:key) | Да |
| Комментарии (POST /comments) | Да |
| Dev Resources (POST/PUT) | Да |
| **Изменение узлов (PUT/PATCH node properties)** | **НЕТ** |
| **Создание узлов** | **НЕТ** |
| REST API для Variables | Только Enterprise |

REST API позволяет читать структуру файла, экспортировать ассеты, управлять комментариями и dev resources — но **нельзя создать, удалить или изменить ни один узел** файла.

> Подробнее: [02-figma-api-mcp-ecosystem.md](./02-figma-api-mcp-ecosystem.md)

### 6.2. html-to-design MCP (mcp.figma.com) — создаёт НОВЫЙ фрейм

**Вердикт: нельзя обновить существующий компонент. Создаёт новый фрейм.**

`generate_figma_design` — инструмент из официального Figma MCP Server, который принимает HTML/CSS и создаёт соответствующие Figma-узлы.

**Что происходит при повторном импорте:**

1. Каждый вызов `generate_figma_design` создаёт **новый фрейм** на холсте.
2. Он **не обновляет** существующий фрейм — не ищет «предыдущую версию» для обновления.
3. Результат импорта — «мёртвая» геометрия: frames, rectangles, text nodes. **Никаких component instances, variable bindings, variant properties.**
4. Даже если исходный HTML построен на компонентах с Code Connect — импорт не осведомлён о дизайн-системе.

**Ограничения для kopeika:**
- Повторный импорт = ещё один плоский фрейм 2118x5881. Накопление дублей.
- Результат нужно вручную разбирать на компоненты.
- Не подходит для итеративного обновления дизайн-системы.

> Примечание: Figma MCP Server имеет инструменты `search_design_system` и `use_figma`, которые теоретически позволяют заменить raw-фреймы на компоненты из библиотеки. Но это требует, чтобы библиотека компонентов **уже существовала**.

### 6.3. cursor-talk-to-figma-mcp — МОЖЕТ обновлять узлы

**Вердикт: да, может программно изменять master-компоненты.**

[cursor-talk-to-figma-mcp](https://github.com/grab/cursor-talk-to-figma-mcp) (от Grab) работает через **Figma Plugin API**, которое имеет полный read/write доступ к узлам.

**Архитектура:**

```
AI Agent (Claude Code / Cursor)
     ↓ MCP protocol
cursor-talk-to-figma-mcp server
     ↓ WebSocket
Figma Plugin (TalkToFigma)
     ↓ Plugin API
Figma Document (live editing)
```

**Доступные операции для обновления компонентов:**

| Операция | Инструмент MCP |
|----------|---------------|
| Изменить fill/stroke цвет | `set_fill_color`, `set_stroke_color` |
| Изменить текст | `set_text_content`, `batch_update_text` |
| Изменить размер | `resize_node` |
| Переместить элемент | `move_node` |
| Изменить border-radius | `set_corner_radius` |
| Настроить auto-layout | `set_auto_layout`, `set_auto_layout_padding`, `set_auto_layout_spacing` |
| Клонировать узел | `clone_node` |
| Удалить узел | `delete_node` |
| Получить все компоненты | `get_local_components` |
| Создать instance | `create_component_instance` |
| Управлять overrides | `get_instance_overrides`, `set_instance_overrides` |
| Сканировать текст | `scan_text_nodes` |
| Экспорт | `export_node_as_image` |

**Пример сценария: обновить цвет кнопки во всём файле:**

1. AI Agent вызывает `get_local_components` → получает список всех компонентов.
2. Находит `Button` master component по имени.
3. Внутри него находит фоновый прямоугольник через `get_node_info`.
4. Вызывает `set_fill_color` с новым цветом.
5. Все instances автоматически обновляются (это делает Figma, не плагин).

**Ограничения:**
- Требует открытый Figma Desktop с установленным плагином TalkToFigma.
- WebSocket-соединение должно быть активно (Figma открыта, плагин запущен).
- Нет операции «создать Component из Frame» — нельзя через Plugin API превратить обычный frame в component программно (на уровне MCP-инструментов; сам Plugin API поддерживает `figma.createComponent()`, но это не вынесено в MCP-сервер).

### 6.4. Figma Code Connect (Dev Mode) — синхронизация Figma → Код

**Вердикт: однонаправленный мост Figma → Code. Не меняет Figma.**

Code Connect связывает компоненты Figma с их кодовой реализацией:

```
Figma Component «Button»
     ↓ Code Connect mapping
React Component <Button />  (или SwiftUI, Vue, Compose)
```

**Как работает:**

1. В репозитории создаётся файл `.figma.ts` (или `.figma.swift` и т.д.) с маппингом.
2. При инспекции компонента в Dev Mode разработчик видит **реальный продакшен-код**, а не авто-генерированный CSS.
3. Figma MCP Server использует Code Connect для предоставления AI-агентам точного контекста реализации.

**Поддерживаемые фреймворки:** React, React Native, HTML (Web Components, Angular, Vue), SwiftUI, Jetpack Compose.

**Ограничения:**
- Доступен только на **Organization и Enterprise** планах (не Pro).
- **Однонаправленный:** код не влияет на Figma-компонент. Изменение React-кода не обновит Figma.
- Можно использовать только один тип подключения на компонент (UI или CLI).

**Для kopeika (Figma Pro):** Code Connect **недоступен**. Потребуется апгрейд на Organization план.

### Итоговая таблица: программное обновление master-компонента

| Инструмент | Может обновить master component? | Способ | Ограничения |
|------------|:---:|--------|-------------|
| **REST API** | Нет | — | Read-only для узлов |
| **html-to-design / Figma MCP** | Нет | Создаёт новый фрейм | «Мёртвая» геометрия без компонентов |
| **cursor-talk-to-figma-mcp** | **Да** | Plugin API через WebSocket | Требует открытый Figma + плагин |
| **Code Connect** | Нет | Figma → Code (не наоборот) | Organization/Enterprise only |
| **Plugin API (напрямую)** | **Да** | Полный read/write | Нужен кастомный плагин |

**Ответ: единственный способ программно обновить master-компонент — через Plugin API.** Наиболее удобная обёртка — `cursor-talk-to-figma-mcp`, которая предоставляет MCP-интерфейс для AI-агентов.

**Ссылки:**
- [Figma REST API Introduction](https://developers.figma.com/docs/rest-api/)
- [Figma Plugin API Reference](https://developers.figma.com/docs/plugins/api/api-reference/)
- [cursor-talk-to-figma-mcp (GitHub)](https://github.com/grab/cursor-talk-to-figma-mcp)
- [Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [Figma MCP Server Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)

---

## 7. Сценарий: «Меняю Button — отражается на 10 экранах»

### Сценарий A: Button — это Component (правильный путь)

**Предусловие:** Button оформлен как Main Component. На 10 экранах размещены instances этого компонента.

**Действие:** Изменяем master Button — например, меняем border-radius с 8px на 16px.

**Результат:**

```
Main Component: Button (border-radius: 8 → 16)
     ↓ автоматически
Instance на Экране 1: border-radius обновился → 16
Instance на Экране 2: border-radius обновился → 16
Instance на Экране 3: border-radius обновился → 16
...
Instance на Экране 10: border-radius обновился → 16
```

- Все 10 экранов обновляются **мгновенно**.
- Overrides (изменённый текст, подставленные иконки) **сохраняются**.
- Не нужно посещать каждый экран.

**Через AI-автоматизацию:**

1. Claude Code / Cursor подключается к Figma через `cursor-talk-to-figma-mcp`.
2. Вызывает `get_local_components` → находит master Button.
3. Вызывает `get_node_info` для Button → находит внутренние слои.
4. Вызывает `set_corner_radius` на нужном слое с новым значением.
5. Figma мгновенно обновляет все instances.

**Одна команда AI → одно изменение master → 10 экранов обновлены.**

### Сценарий B: Button — это просто Frame, продублированный 10 раз (текущая ситуация)

**Предусловие:** Button — обычный Frame, скопированный на 10 экранов через Cmd+D.

**Действие:** Изменяем border-radius на одном из фреймов.

**Результат:**

```
Frame «Button» на Экране 1: border-radius: 8 → 16 ✓ (изменён вручную)
Frame «Button» на Экране 2: border-radius: 8 (не изменён)
Frame «Button» на Экране 3: border-radius: 8 (не изменён)
...
Frame «Button» на Экране 10: border-radius: 8 (не изменён)
```

- Нужно **вручную** изменить каждый из 10 фреймов.
- Легко пропустить один — и получить inconsistency.
- При 50+ элементах UI это становится неуправляемым.

**Через AI-автоматизацию (workaround):**

Даже без компонентов, `cursor-talk-to-figma-mcp` может помочь:

1. AI сканирует все узлы файла.
2. Находит все фреймы с именем «Button» (или похожим).
3. Применяет `set_corner_radius` к каждому из найденных фреймов.

Но это **хрупкий подход**: зависит от naming conventions, не гарантирует полноту, не масштабируется.

### Вывод

| Критерий | Component + Instance | Копии Frame |
|----------|:---:|:---:|
| Одно изменение обновляет все | Да | Нет |
| AI может автоматизировать | Одна операция | N операций (хрупко) |
| Защита от inconsistency | Встроенная | Нет |
| Масштабируемость | Линейная | Экспоненциальная сложность |

**Первый приоритет для kopeika:** превратить повторяющиеся элементы в Components.

---

## 8. Чеклист перехода от «плоского дизайна» к дизайн-системе

Пошаговый план превращения текущего плоского фрейма 2118x5881 в полноценную дизайн-систему.

### Фаза 1: Аудит и инвентаризация

- [ ] **Создать страницу «_Components»** в Figma-файле — отдельная страница для master-компонентов.
- [ ] **Каталогизировать повторяющиеся элементы.** Пройтись по плоскому фрейму и выписать все повторяющиеся UI-элементы:
  - Кнопки (Button) — сколько вариантов? Primary, Secondary, Disabled, Ghost?
  - Карточки категорий (CategoryCard) — какие варианты?
  - Строки транзакций (TransactionRow) — какие варианты?
  - Input fields, Bottom navigation, Headers, Modals, Donut chart, и т.д.
- [ ] **Составить список уникальных цветов** — выписать все hardcoded цвета из фрейма.
- [ ] **Составить список уникальных текстовых стилей** — все комбинации font/size/weight/lineHeight.
- [ ] **Составить список уникальных spacing-значений** — padding'и, gap'ы, margin'ы.

### Фаза 2: Создание токенов (Variables и Styles)

- [ ] **Создать коллекцию «Primitives»** — базовые цвета (green-500, red-500, gray-100...).
- [ ] **Создать коллекцию «Semantic»** — семантические цвета (primary, expense, income, background, text-primary...) как aliases на Primitives.
- [ ] **Добавить Mode «Dark»** в коллекцию Semantic — задать значения для тёмной темы.
- [ ] **Создать коллекцию «Spacing»** — xs(4), sm(8), md(16), lg(24), xl(32).
- [ ] **Создать Text Styles** — H1, H2, Body, Small, Caption, Button.
- [ ] **Настроить Scoping** — ограничить переменные spacing от использования в color-полях и наоборот.

### Фаза 3: Создание атомарных компонентов (Atoms)

- [ ] **Icon component** — Component Set с вариантами для каждой категории (Food, Transport, Rent...).
- [ ] **Badge** — маленький числовой индикатор.
- [ ] **Divider** — горизонтальная линия-разделитель.
- [ ] **Avatar** — заглушка для пользовательского аватара.

Для каждого атома:
- [ ] Применить auto-layout.
- [ ] Привязать цвета к Variables (не hardcoded).
- [ ] Привязать spacing к Variables.
- [ ] Применить Text Styles к текстовым слоям.

### Фаза 4: Создание молекул (Molecules)

- [ ] **Button** — Component Set:
  - Variant Properties: `Style` (Primary/Secondary/Ghost/Disabled), `Size` (Large/Medium/Small).
  - Boolean: `Show Icon`.
  - Instance Swap: `Icon` (для иконки слева).
  - Text: `Label`.
  - Auto-layout: horizontal, padding привязан к Variables.
- [ ] **InputField** — Component Set:
  - Variant: `State` (Default/Focused/Error/Disabled).
  - Text: `Placeholder`, `Label`, `Helper Text`.
  - Boolean: `Show Helper`.
- [ ] **BottomTabItem** — Component Set:
  - Variant: `State` (Active/Inactive).
  - Instance Swap: `Icon`.
  - Text: `Label`.

### Фаза 5: Создание организмов (Organisms)

- [ ] **TransactionRow** — основная строка транзакции:
  - Instance Swap: `CategoryIcon`.
  - Text: `Title`, `Category`, `Amount`, `Date`.
  - Variant: `Type` (Expense/Income).
  - Auto-layout: horizontal, Fill по ширине.
- [ ] **CategoryCard** — карточка категории с прогрессом:
  - Instance Swap: `Icon`.
  - Text: `Name`, `Spent`, `Budget`.
  - Variant: `Size` (Large/Compact).
- [ ] **DonutChart** — круговая диаграмма расходов.
- [ ] **BottomNavigation** — нижнее меню из BottomTabItem instances.
- [ ] **Header** — шапка экрана.

### Фаза 6: Сборка экранов из компонентов

- [ ] **Создать страницу «Screens»** — для готовых экранов.
- [ ] Собрать каждый из 10 экранов из instances компонентов (не копий фреймов).
- [ ] Убедиться, что **ни один элемент** на экранах не является detached instance или обычным frame (кроме layout-контейнеров).
- [ ] Применить auto-layout к экранным фреймам для responsive поведения.

### Фаза 7: Публикация и верификация

- [ ] **Опубликовать библиотеку** — если используется Team Library (Figma Pro поддерживает).
- [ ] **Проверка: изменить master Button** → убедиться, что все instances на всех экранах обновились.
- [ ] **Проверка: переключить Mode Light/Dark** → убедиться, что все цвета переключаются корректно.
- [ ] **Проверка: найти detached instances** → исправить (можно использовать плагин [Master](https://dominate.design/fix-detached)).
- [ ] **Задокументировать naming conventions** — чтобы при добавлении новых компонентов сохранялась консистентность.

### Фаза 8: Подключение AI-автоматизации (опционально)

- [ ] Установить [TalkToFigma Plugin](https://www.figma.com/community/plugin/1485687494525374295/talk-to-figma-mcp-plugin) в Figma.
- [ ] Настроить `cursor-talk-to-figma-mcp` для Claude Code / Cursor.
- [ ] Проверить, что AI может читать компоненты (`get_local_components`).
- [ ] Проверить, что AI может обновлять свойства master-компонента.
- [ ] Создать шаблоны промптов для типовых операций: «Обнови цвет primary на #XX», «Добавь variant Disabled к Button».

> Подробнее о рекомендациях для kopeika: [04-recommendations-kopeika.md](./04-recommendations-kopeika.md)

---

## Источники

### Официальная документация Figma
- [Component architecture in Figma](https://www.figma.com/best-practices/component-architecture/)
- [Create and use variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants)
- [Explore component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties)
- [Overview of variables, collections, and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)
- [Guide to variables in Figma](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- [Guide to auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout)
- [Auto layout fundamentals](https://help.figma.com/hc/en-us/articles/31351261703063-FD4B-Auto-layout-fundamentals)
- [Apply changes to instances](https://help.figma.com/hc/en-us/articles/360039150733-Apply-changes-to-instances)
- [Detach an instance from the component](https://help.figma.com/hc/en-us/articles/360038665754-Detach-an-instance-from-the-component)
- [Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)

### Figma Developer Docs
- [REST API Introduction](https://developers.figma.com/docs/rest-api/)
- [Plugin API Reference](https://developers.figma.com/docs/plugins/api/api-reference/)
- [ComponentNode (Plugin API)](https://developers.figma.com/docs/plugins/api/ComponentNode/)
- [Code Connect — Getting Started](https://developers.figma.com/docs/code-connect/quickstart-guide/)

### MCP и инструменты
- [cursor-talk-to-figma-mcp (GitHub)](https://github.com/grab/cursor-talk-to-figma-mcp)
- [TalkToFigma Plugin (Figma Community)](https://www.figma.com/community/plugin/1485687494525374295/talk-to-figma-mcp-plugin)
- [Figma MCP Server Guide (GitHub)](https://github.com/figma/mcp-server-guide)
- [html.to.design](https://html.to.design/home/)

### Статьи и гайды
- [Design System Mastery with Figma Variables: 2025/2026 Playbook](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)
- [Structuring Large-Scale Figma Design Systems: 2025 Guide](https://medium.com/@claus.nisslmueller/structuring-and-splitting-large-scale-figma-design-systems-a-2025-master-guide-for-scalable-c1c3a7dabb0e)
- [Best Figma plugins for design systems in 2026](https://story.to.design/blog/best-design-system-plugins-of-2026)
- [Figma Design Systems in 2026: 26 Scalable Features & Tips](https://zeroheight.com/blog/building-scalable-design-systems-with-figma-26-tips-for-2026/)
