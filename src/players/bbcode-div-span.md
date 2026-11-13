---
title: DIV and SPAN Tags
nav_order: 5
---

<p class="docs-lead">The <code>[div]</code> and <code>[span]</code> BBCode tags let you apply arbitrary CSS styling to any block of content or inline text. Both accept a <code>style</code> attribute with semicolon-separated CSS declarations.</p>

## Syntax

```
[div style="property: value; property: value"]...[/div]
[span style="property: value"]...[/span]
```

**DIV** is a block element — it takes up the full line width.  
**SPAN** is an inline element — it flows within text.

## Allowed properties

| Property | Description | Example |
|---|---|---|
| `border` | Border around the element | `border: 1px solid #ccc` |
| `background` | Background color or image | `background: #f0f0f0` |
| `color` | Text color | `color: #333` |
| `width` | Element width | `width: 50%` |
| `height` | Element height | `height: 200px` |
| `min-width` | Minimum width | `min-width: 100px` |
| `max-width` | Maximum width | `max-width: 600px` |
| `min-height` | Minimum height | `min-height: 50px` |
| `max-height` | Maximum height | `max-height: 300px` |
| `display` | Display mode | `display: flex` |
| `padding` | Inner spacing | `padding: 10px` |
| `margin` | Outer spacing | `margin: 0 auto` |
| `float` | Float direction | `float: right` |
| `font-family` | Font face | `font-family: Georgia` |
| `font-style` | Font style | `font-style: italic` |
| `line-height` | Line spacing | `line-height: 1.6` |
| `text-align` | Text alignment | `text-align: center` |
| `text-decoration` | Text decoration | `text-decoration: underline` |
| `text-shadow` | Text shadow | `text-shadow: 1px 1px 2px #000` |
| `text-transform` | Text case | `text-transform: uppercase` |
| `flex-direction` | Flex item direction | `flex-direction: column` |
| `gap` | Space between flex/grid items | `gap: 10px` |

## Display values

Only four values are accepted for `display`:

- `inline` — inline element
- `block` — block element
- `inline-block` — inline but accepts explicit dimensions
- `flex` — flex container (children arrange in a row)

## Examples

Coloured block with a border:

```
[div style="border: 2px solid #a00; background: #fff5f5; color: #a00"]Text inside[/div]
```

Inline colour highlight:

```
Normal text, [span style="color: #0055aa; font-style: italic"]highlighted part[/span], normal again.
```

Width-constrained block:

```
[div style="max-width: 400px; border: 1px solid #ddd; background: #fafafa"]Content[/div]
```

Two side-by-side columns with flex:

```
[div style="display: flex"]
[div style="width: 50%; background: #eef"]Left[/div]
[div style="width: 50%; background: #efe"]Right[/div]
[/div]
```

## Security

Declarations containing `javascript:`, `expression()`, `behavior:`, or similar constructs are silently stripped. The rest of the `style` attribute is preserved.
