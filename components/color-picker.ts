/**
 * Custom Color Picker Component
 */
class ColorPicker extends HTMLElement {
    private _value: string = '#000000';
    private input: HTMLInputElement;
    private preview: HTMLElement;
    private labelElement: HTMLElement | null;

    static get observedAttributes() {
        return ['value', 'label'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Create elements
        const container = document.createElement('div');
        container.className = 'color-picker-container';

        this.labelElement = document.createElement('span');
        this.labelElement.className = 'label';

        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';

        this.preview = document.createElement('div');
        this.preview.className = 'color-preview';

        this.input = document.createElement('input');
        this.input.type = 'color';
        this.input.className = 'color-input';

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-family: inherit;
            }
            
            .color-picker-container {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .label {
                font-size: 0.9rem;
                color: var(--text-secondary, #666);
                font-weight: 500;
            }
            
            .input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }
            
            .color-preview {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                border: 2px solid var(--border-color, #ddd);
                background-color: #000;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .color-input {
                position: absolute;
                opacity: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
                top: 0;
                left: 0;
            }
            
            .input-wrapper:hover .color-preview {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .input-wrapper:active .color-preview {
                transform: scale(0.95);
            }
        `;

        // Assemble
        wrapper.appendChild(this.preview);
        wrapper.appendChild(this.input);
        container.appendChild(this.labelElement);
        container.appendChild(wrapper);
        this.shadowRoot?.appendChild(style);
        this.shadowRoot?.appendChild(container);
    }

    connectedCallback() {
        this.setupEventListeners();

        // Initial values
        if (this.hasAttribute('value')) {
            this.value = this.getAttribute('value') || '#000000';
        }

        if (this.hasAttribute('label')) {
            const labelText = this.getAttribute('label');
            if (this.labelElement && labelText) this.labelElement.textContent = labelText;
        }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;

        if (name === 'value') {
            this.value = newValue;
        } else if (name === 'label') {
            if (this.labelElement) this.labelElement.textContent = newValue;
        }
    }

    setupEventListeners() {
        this.input.addEventListener('input', (e) => {
            const tempValue = (e.target as HTMLInputElement).value;
            this.updatePreview(tempValue);
            // Dispatch input event for real-time updates
            this.dispatchEvent(new CustomEvent('color-changed', {
                detail: { value: tempValue },
                bubbles: true,
                composed: true
            }));

            // Also dispatch standard input event
            this.dispatchEvent(new Event('input', { bubbles: true }));
        });

        this.input.addEventListener('change', (e) => {
            this.value = (e.target as HTMLInputElement).value;
            this.dispatchEvent(new CustomEvent('color-changed', {
                detail: { value: this.value },
                bubbles: true,
                composed: true
            }));

            // Also dispatch standard change event
            this.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    updatePreview(color: string) {
        this.preview.style.backgroundColor = color;
    }

    get value(): string {
        return this._value;
    }

    set value(newValue: string) {
        this._value = newValue;
        this.setAttribute('value', newValue);
        this.input.value = newValue;
        this.updatePreview(newValue);
    }
}

customElements.define('color-picker', ColorPicker);
