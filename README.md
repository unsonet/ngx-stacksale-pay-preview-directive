# `@unsonet/ngx-securepay-preview-directive`

Angular directive wrapper for the native `SecurePayPreview` library.

This package allows you to use the standalone `SecurePayPreview` renderer inside Angular applications without rewriting the renderer itself in Angular.

The directive attaches the native renderer to any HTML element and forwards native custom events to Angular outputs.

---

# Features

* Angular wrapper around native `SecurePayPreview`
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
npm install @unsonet/ngx-securepay-preview-directive
```

or

```bash
yarn add @unsonet/ngx-securepay-preview-directive
```

---

# Requirements

The directive expects the native `SecurePayPreview` constructor to be available on `window`.

Example:

```ts
window.SecurePayPreview = SecurePayPreview;
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
    "src/assets/securepay-preview.js"
  ]
}
```

The bundle must expose:

```js
window.SecurePayPreview
```

---

## Option 2 — Using ES module import

In your Angular application bootstrap:

```ts
import SecurePayPreview from '@unsonet/securepay-preview';

(window as any).SecurePayPreview = SecurePayPreview;
```

---

# Importing the Directive

## NgModule-based app

```ts
import { SecurepayPreviewDirective } from '@unsonet/ngx-securepay-preview-directive';

@NgModule({
  declarations: [
    SecurepayPreviewDirective
  ]
})
export class AppModule {}
```

---

# Usage

## Template

```html
<div
  securepay-preview
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
new SecurePayPreview({
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
securepay-preview-core
    ↓
ngx-securepay-preview-directive
```

Where:

* `securepay-preview-core` contains rendering logic
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
