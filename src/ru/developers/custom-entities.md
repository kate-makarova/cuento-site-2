---
title: Кастомные сущности
nav_order: 8
---

<p class="docs-lead">Cuento позволяет администраторам добавлять произвольные поля к четырём типам сущностей: анкетам персонажей, профилям персонажей, заголовкам эпизодов и объявлениям о желаемых персонажах. Эти поля хранятся по схеме EAV+flattened с двумя таблицами и синхронизируются исключительно через автоматически генерируемые триггеры MariaDB — никакого кода синхронизации на уровне приложения при записи нет.</p>

## Типы сущностей

Четыре типа сущностей поддерживают кастомные поля. Каждый имеет собственную пару таблиц в базе данных.

| `className` | Сущность |
|---|---|
| `character` | Анкета персонажа |
| `character_profile` | Профиль персонажа (вторичный блок отображения) |
| `episode` | Заголовок эпизода |
| `wanted_character` | Объявление о желаемом персонаже |

Для каждого типа существует отдельная базовая таблица (`{name}_base`), управляемая независимо, и пара таблиц для кастомных полей, описанных ниже.

## Схема двух таблиц

Для каждого типа сущности кастомные данные хранятся в двух таблицах.

### `{name}_main` — EAV-таблица

Одна строка на пару (сущность, поле). Для каждого поддерживаемого типа значения есть отдельный столбец; заполняется только тот, который соответствует типу поля:

```
entity_id              INT
field_machine_name     VARCHAR(255)
field_type             VARCHAR(50)
value_int              INT
value_decimal          DECIMAL(10,2)
value_string           VARCHAR(255)
value_text             TEXT
value_date             DATETIME
value_free_formatted_date  JSON
sort_free_formatted_date   BIGINT
```

### `{name}_flattened` — широкая таблица

Одна строка на сущность, один столбец на поле. Тип столбца определяется настроенным типом поля:

| Тип поля | Тип столбца |
|---|---|
| `int` | INT |
| `decimal` | DECIMAL(10,2) |
| `string` | VARCHAR(255) |
| `text` | TEXT |
| `date` | DATETIME |
| `select` | INT (хранит ключ опции) |
| `free_format_date` | JSON (плюс сопровождающий столбец `{field}_sort` BIGINT) |

Флаттенированная таблица также содержит столбец `block_settings JSON`, хранящий состояние видимости блоков для каждой конкретной сущности.

## Таблица `custom_field_config`

Одна строка на тип сущности. Столбец `config` хранит полный шаблон в формате JSON:

```json
{
  "fields": [ { "machine_field_name": "age", "human_field_name": "Возраст", "field_type": "int", "content_field_type": "number", "order": 1 } ],
  "blocks": [ { "id": "basics", "label": "Основное", "fields": ["age", "faction"] } ],
  "block_settings": [ { "machine_name": "extras", "label": "Доп. детали", "children": ["bio", "notes"], "control_type": "manual" } ]
}
```

Конфиги, сохранённые до введения блоков, хранятся как простые массивы полей; сервисный слой поддерживает оба формата.

## Автогенерируемые триггеры

`UpdateTriggers()` в `custom_field_entity.go` удаляет и пересоздаёт три триггера MariaDB каждый раз, когда сохраняется шаблон:

| Триггер | Событие | Действие |
|---|---|---|
| `{name}_after_insert` | INSERT в `{name}_main` | UPSERT соответствующего столбца в `{name}_flattened` |
| `{name}_after_update` | UPDATE в `{name}_main` | UPSERT соответствующего столбца в `{name}_flattened` |
| `{name}_after_delete` | DELETE из `{name}_main` | Обнуляет соответствующий столбец в `{name}_flattened` |

Внутри каждого триггера блок `CASE field_type` выбирает нужный столбец `value_*`. Для полей `free_format_date` триггер также обновляет сопровождающий BIGINT-столбец `{field}_sort`. Поскольку триггеры удаляются и пересоздаются при каждом вызове `UpdateTemplate`, добавление или удаление поля всегда порождает корректный триггер, отражающий текущую схему — инкрементной логики миграции нет.

## Процесс UpdateTemplate

`POST /template/:type/update` (только для администраторов, роль 3):

1. Проверяет все machine name на соответствие `^[a-z0-9_]+$`.
2. Если `{name}_flattened` ещё не существует: вызывает `GenerateEntityTables`, который создаёт обе таблицы — `{name}_main` и `{name}_flattened` — и запускает `UpdateTriggers`.
3. Если флаттенированная таблица уже существует: вызывает `UpdateFlattenedTable`, который сравнивает существующие столбцы с новым конфигом (добавляет недостающие, удаляет лишние), затем вызывает `UpdateTriggers` для перестройки триггеров.
4. UPSERT JSON-конфига в `custom_field_config`.

Удаление поля убирает его столбец из флаттенированной таблицы и перестраивает триггеры без него. Переименование поля (изменение machine name) трактуется как удаление + добавление — данные в старом столбце теряются.

## Чтение сущностей

`GetEntity(id, className, db)` в `custom_entity_service.go`:

1. JOIN `{name}_base LEFT JOIN {name}_flattened` по `entity_id`.
2. Заполняет поля базовой структуры через рефлексию.
3. Итерирует небазовые столбцы флаттенированной строки и наполняет карту `CustomFields` вида `map[string]CustomFieldValue`.
4. Для полей `text`: запускает `ParseBBCode` для заполнения `ContentHtml`.
5. Для полей `select`: разрешает хранимый целочисленный ключ в `{id, value}` через карту Options из конфига.
6. Вызывает `computeHiddenFields` для скрытия полей, чей блок-переключатель выключен для данного экземпляра сущности.

Запись проходит через `{name}_main`; триггеры автоматически поддерживают `{name}_flattened` в актуальном состоянии.

## Блоки и блок-переключатели

**Блоки** (`Block{id, label, fields[]}`) группируют поля для отображения. Список `fields` содержит machine name. Блоки носят исключительно презентационный характер — на хранение не влияют.

**Блок-переключатели** (`BlockSettingToggle{machine_name, label, children, control_type: "manual"}`) позволяют отдельным сущностям показывать или скрывать именованную группу полей. `children` перечисляет machine name затрагиваемых полей. Состояние переключателя хранится на уровне сущности в `{name}_flattened.block_settings` как JSON и обновляется через `SaveEntityBlockSettings`.

`computeHiddenFields(blocks, toggles, entitySettings)` возвращает множество machine name полей, которые в данный момент выключены для данного экземпляра сущности.

## Свободный формат даты

Тип поля `free_format_date` — это кастомная система дат. Администратор задаёт строку формата с типизированными плейсхолдерами (каждый плейсхолдер — числовой диапазон или список строковых значений). Пользователи заполняют плейсхолдеры при редактировании сущности.

Значения хранятся как JSON в `value_free_formatted_date`. `computeFreeFormatDateSort` кодирует значения в сортируемое BIGINT-число, присваивая каждому плейсхолдеру степень 10 — это позволяет ORDER BY по сопровождающему столбцу `{field}_sort` без разбора JSON в запросе.

## Обнаружение конфликтов схемы

Перед загрузкой формы фронтенд администратора считывает текущий шаблон и отслеживает существующий `field_type` для каждого поля. Если администратор меняет тип поля и сохраняет, фронтенд предупреждает перед отправкой — изменение типа меняет тип столбца флаттенированной таблицы и триггеры, а также может незаметно обрезать существующие данные (например, `text` → `string` обрежет значения длиннее 255 символов).

## Ключевые файлы

| Файл | Роль |
|---|---|
| `cuento-backend/src/Entities/custom_field_entity.go` | Структуры, `GenerateEntityTables`, `UpdateFlattenedTable`, `UpdateTriggers` |
| `cuento-backend/src/Services/custom_entity_service.go` | `GetEntity`, `CreateEntity`, `PatchEntity`, `GetEntityTemplateConfig`, `SaveEntityBlockSettings` |
| `cuento-backend/src/Controllers/template.go` | `GetTemplate`, `UpdateTemplate`, `CustomFieldAutocomplete` |
| `cuento-frontend/src/app/admin/field-template-row/` | Компонент редактирования строки поля |
| `cuento-frontend/src/app/models/FieldTemplate.ts` | TypeScript-интерфейсы |
