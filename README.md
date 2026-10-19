# `@unsonet/ngx-stacksale-pay-preview-directive`

Angular directive wrapper for the native `StacksalePayPreview` library.

This package allows you to use the standalone `StacksalePayPreview` renderer inside Angular applications without rewriting the renderer itself in Angular.

The directive attaches the native renderer to any HTML element and forwards native custom events to Angular outputs.

---

# Features

* Angular wrapper around native `StacksalePayPreview`
* Works with JSON-based form configuration
* Supports live updates
* Forwards native events as Angular outputs
* Keeps rendering logic outside Angular
* Lightweight integration
* Compatible with NX monorepo setups

---

# Installation

Install the package:

```bash
npm install @unsonet/ngx-stacksale-pay-preview-directive
```

or

```bash
yarn add @unsonet/ngx-stacksale-pay-preview-directive
```

---

# Requirements

The directive expects the native `StacksalePayPreview` constructor to be available on `window`.

Example:

```ts
window.StacksalePayPreview = StacksalePayPreview;
```

You can expose it either:

* via `<script>`
* or via ES module import

---

# Setup

## Option 1 — Using script bundle

Add the standalone bundle to `angular.json`:

```json
{
  "scripts": [
    "src/assets/stacksale-pay-preview.js"
  ]
}
```

The bundle must expose:

```js
window.StacksalePayPreview
```

---

## Option 2 — Using ES module import

In your Angular application bootstrap:

```ts
import StacksalePayPreview from '@unsonet/stacksale-pay-preview';

(window as any).StacksalePayPreview = StacksalePayPreview;
```

---

# Importing the Directive

## NgModule-based app

```ts
import { StacksalePayPreviewDirective } from '@unsonet/ngx-stacksale-pay-preview-directive';

@NgModule({
  declarations: [
    StacksalePayPreviewDirective
  ]
})
export class AppModule {}
```

---

# Usage

## Template

```html
<div
  stacksale-pay-preview
  [config]="promotionData"
  [templateID]="templateID"
  (templateUpdated)="onTemplateUpdated($event)"
  (templateSubmit)="onTemplateSubmit($event)">
</div>
```

---

# Inputs

| Input        | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| `config`     | `any`    | JSON form configuration     |
| `templateID` | `string` | Display template identifier |

---

# Outputs

| Output            | Description                         |
| ----------------- | ----------------------------------- |
| `templateUpdated` | Fired when preview template updates |
| `templateSubmit`  | Fired when preview submits          |
| `anyEvent`        | Forwards any native custom event    |

---

# Example Component

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
})
export class DemoComponent {

  templateID = '2755';

  promotionData = {
    id: 4770,
    name: 'Test Promotion',
  };

  onTemplateUpdated(event: any) {
    console.log('Template updated', event);
  }

  onTemplateSubmit(event: any) {
    console.log('Template submit', event);
  }
}
```

---

# Native Library Example

The directive internally creates:

```ts
new StacksalePayPreview({
  promotionData,
  previewElement,
  templateID
});
```

---

# Lifecycle

The directive:

* initializes after `ngAfterViewInit`
* recreates or updates preview on input changes
* destroys preview instance on `ngOnDestroy`

---

# Event Forwarding

Native events dispatched from the preview element:

```js
element.dispatchEvent(
  new CustomEvent('template-submit', {
    bubbles: true,
    detail: data
  })
);
```

become Angular outputs:

```html
(templateSubmit)="..."
```

---

# Recommended Architecture

Recommended structure:

```text
stacksale-pay-preview-core
    ↓
ngx-stacksale-pay-preview-directive
```

Where:

* `stacksale-pay-preview-core` contains rendering logic
* Angular directive is only a wrapper

---

# Notes

The directive intentionally avoids:

* Angular Forms coupling
* Angular template rendering
* Angular DOM ownership

The native renderer fully controls the DOM inside the host element.

---

# License

MIT
