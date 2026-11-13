---
title: Теги DIV и SPAN
nav_order: 4
---

<p class="docs-lead">Теги <code>[div]</code> и <code>[span]</code> позволяют применять произвольное CSS-оформление к любому фрагменту текста или блоку контента. Оба принимают атрибут <code>style</code> со списком CSS-свойств через точку с запятой.</p>

## Синтаксис

```
[div style="свойство: значение; свойство: значение"]...[/div]
[span style="свойство: значение"]...[/span]
```

**DIV** — блочный элемент (занимает всю ширину строки).  
**SPAN** — строчный элемент (встраивается в текст).

## Допустимые свойства

| Свойство | Описание | Пример |
|---|---|---|
| `border` | Рамка вокруг элемента | `border: 1px solid #ccc` |
| `background` | Цвет или изображение фона | `background: #f0f0f0` |
| `color` | Цвет текста | `color: #333` |
| `width` | Ширина элемента | `width: 50%` |
| `height` | Высота элемента | `height: 200px` |
| `min-width` | Минимальная ширина | `min-width: 100px` |
| `max-width` | Максимальная ширина | `max-width: 600px` |
| `min-height` | Минимальная высота | `min-height: 50px` |
| `max-height` | Максимальная высота | `max-height: 300px` |
| `display` | Способ отображения | `display: flex` |
| `padding` | Внутренний отступ | `padding: 10px` |
| `margin` | Внешний отступ | `margin: 0 auto` |
| `float` | Обтекание | `float: right` |
| `font-family` | Шрифт текста | `font-family: Georgia` |
| `font-style` | Начертание шрифта | `font-style: italic` |
| `line-height` | Межстрочный интервал | `line-height: 1.6` |
| `text-align` | Выравнивание текста | `text-align: center` |
| `text-decoration` | Оформление текста | `text-decoration: underline` |
| `text-shadow` | Тень текста | `text-shadow: 1px 1px 2px #000` |
| `text-transform` | Регистр текста | `text-transform: uppercase` |
| `flex-direction` | Направление flex-элементов | `flex-direction: column` |
| `gap` | Отступ между flex/grid-элементами | `gap: 10px` |

## Значения display

Для свойства `display` допустимы четыре значения:

- `inline` — строчный элемент
- `block` — блочный элемент
- `inline-block` — строчно-блочный (ведёт себя как строчный, но принимает размеры)
- `flex` — флекс-контейнер (дочерние элементы выстраиваются в ряд)

## Примеры

Цветной блок с рамкой:

```
[div style="border: 2px solid #a00; background: #fff5f5; color: #a00"]Текст в блоке[/div]
```

Строчное выделение цветом:

```
Обычный текст, [span style="color: #0055aa; font-style: italic"]выделенный фрагмент[/span], снова обычный.
```

Блок с ограниченной шириной:

```
[div style="max-width: 400px; border: 1px solid #ddd; background: #fafafa"]Содержимое[/div]
```

Два блока рядом через flex:

```
[div style="display: flex"]
[div style="width: 50%; background: #eef"]Левый[/div]
[div style="width: 50%; background: #efe"]Правый[/div]
[/div]
```

## Безопасность

В значениях свойств запрещены конструкции `javascript:`, `expression()`, `behavior:` и им подобные. Такие объявления будут молча отброшены — остальная часть `style` при этом сохранится.
