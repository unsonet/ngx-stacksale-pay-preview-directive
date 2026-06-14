// securepay-preview.directive.ts
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import { PreviewComponent as SecurePayPreview } from '@unsonet/securepay-preview'

@Directive({
  selector: '[securepay-preview]',
  standalone: false,
})
export class SecurepayPreviewDirective implements AfterViewInit, OnChanges, OnDestroy {
  /** JSON config */
  @Input('config') config: any;
  @Input('previewTemplate') previewTemplate!: string;
  @Input('morphing') morphing!: boolean;
  @Input('saveInputStates') saveInputStates!: boolean;

  /** Forwarded native events from the preview element */
  @Output() templateUpdated = new EventEmitter<any>();
  @Output() templateSubmit = new EventEmitter<any>();
  @Output() anyEvent = new EventEmitter<CustomEvent>();

  private previewInstance: any = null;
  private hostEl: HTMLElement;
  private viewInitialized = false;

  // bound listeners so we can remove them
  private onTemplateUpdated = (e: Event) => this.templateUpdated.emit((e as CustomEvent).detail);
  private onTemplateSubmit = (e: Event) => this.templateSubmit.emit((e as CustomEvent).detail);
  private onAnyEvent = (e: Event) => this.anyEvent.emit(e as CustomEvent);

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.hostEl = this.elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.tryInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('config' in changes || 'previewTemplate' in changes) {
      this.tryInit();
    }
  }

  ngOnDestroy(): void {
    this.teardownPreview();
  }

  // ===== Init logic =====

  private tryInit(): void {
    if (!this.viewInitialized) return;
    if (!this.config) return;
    if (!this.previewTemplate) return;

    this.createOrUpdatePreview();
  }

  // ===== SecurePayPreview integration =====

  private getCtor(): any {
    // Prefer window.SecurePayPreview (when lib is included as <script>)
    const w = window as any;
    if (w && w.SecurePayPreview) {
      return w.SecurePayPreview;
    } else {
      return SecurePayPreview;
    }

    // If you also import the module somewhere and attach to window, above will catch it.
    // Otherwise, you can import SecurePayPreview in this file and return it here (uncomment):
    // import SecurePayPreview from 'path/to/securepay'; return SecurePayPreview;

    return null;
  }

  private createOrUpdatePreview(): void {

    const ctor = this.getCtor();
    if (!ctor) {
      console.error('SecurepayPreviewDirective: SecurePayPreview constructor not found on window. Make sure the script is loaded or import the class and attach to window.SecurePayPreview.');
      return;
    }

    // If instance exists, try to update
    if (this.previewInstance) {
      // prefer an explicit update method if library provides one
      if (typeof this.previewInstance.updateData === 'function') {
        try {
          this.previewInstance.updateData(this.config);
          return;
        } catch (err) {
          // fallback to recreate below
          console.warn('SecurepayPreviewDirective: updateData(...) failed, recreating instance', err);
        }
      }
      // else destroy and recreate
      //this.teardownPreview();
    } else {
      // Create new instance. The library accepts either selector or element — pass element.
      try {
        console.log('BIBA');
        this.previewInstance = new ctor({
          promotionData: this.config,
          previewElement: this.hostEl,
          previewTemplate: this.previewTemplate,
          morphing: this.morphing,
          saveInputStates: this.saveInputStates
        });
      } catch (err) {
        console.error('SecurepayPreviewDirective: failed to instantiate SecurePayPreview', err);
        this.previewInstance = null;
        return;
      }

      // Attach listeners for events emitted inside the preview
      // The library dispatches custom events on the element (in your example it used '#promotion')
      this.hostEl.addEventListener('template-updated', this.onTemplateUpdated as EventListener);
      this.hostEl.addEventListener('template-submit', this.onTemplateSubmit as EventListener);

      // generic forwarder (optional)
      this.hostEl.addEventListener('template-updated', this.onAnyEvent as EventListener);
      this.hostEl.addEventListener('template-submit', this.onAnyEvent as EventListener);
    }

  }

  private teardownPreview(): void {
    if (!this.previewInstance) return;

    // If the preview instance has destroy method — call it
    if (typeof this.previewInstance.destroy === 'function') {
      try {
        this.previewInstance.destroy();
      } catch (err) {
        console.warn('SecurepayPreviewDirective: error while calling destroy()', err);
      }
    }

    // Remove listeners
    this.hostEl.removeEventListener('template-updated', this.onTemplateUpdated as EventListener);
    this.hostEl.removeEventListener('template-submit', this.onTemplateSubmit as EventListener);
    this.hostEl.removeEventListener('template-updated', this.onAnyEvent as EventListener);
    this.hostEl.removeEventListener('template-submit', this.onAnyEvent as EventListener);

    this.previewInstance = null;
  }

  // Optional helper: expose the native preview instance if consumer needs direct access
  public get instance(): any {
    return this.previewInstance;
  }
}
