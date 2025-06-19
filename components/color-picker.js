/**
 * ColorPicker Web Component
 * A custom web component that wraps a color input with additional features
 */
class ColorPicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });

        // Initialize properties
        this._value = '#FFFFFF';
        this._label = 'Color';
        this._id = '';
        this._name = '';
    }

    static get observedAttributes() {
        return ['value', 'label', 'id', 'name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'value':
                this._value = newValue;
                if (this.shadowRoot.querySelector('input')) {
                    this.shadowRoot.querySelector('input').value = newValue;
                }
                break;
            case 'label':
                this._label = newValue;
                if (this.shadowRoot.querySelector('label')) {
                    this.shadowRoot.querySelector('label').textContent = newValue;
                }
                break;
            case 'id':
                this._id = newValue;
                if (this.shadowRoot.querySelector('input')) {
                    this.shadowRoot.querySelector('input').id = `${newValue}-internal`;
                    this.shadowRoot.querySelector('label').htmlFor = `${newValue}-internal`;
                }
                break;
            case 'name':
                this._name = newValue;
                if (this.shadowRoot.querySelector('input')) {
                    this.shadowRoot.querySelector('input').name = newValue;
                }
                break;
        }
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        // Get attribute values or use defaults
        const value = this.getAttribute('value') || this._value;
        const label = this.getAttribute('label') || this._label;
        const id = this.getAttribute('id') || this._id;
        const name = this.getAttribute('name') || this._name;

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
            }

            .color-input-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            label {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: var(--text-color-secondary, #495057);
                font-size: 0.9rem;
            }

            input[type="color"] {
                width: 40px;
                height: 40px;
                padding: 0;
                border: 2px solid var(--border-color, #e9ecef);
                border-radius: var(--border-radius, 4px);
                cursor: pointer;
                background-color: transparent;
                transition: border-color 0.2s ease, transform 0.2s ease;
            }

            input[type="color"]:focus {
                outline: none;
                border-color: var(--border-color-focus, #007bff);
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                transform: scale(1.05);
            }

            .color-preview {
                display: inline-block;
                height: 24px;
                min-width: 60px;
                border-radius: var(--border-radius, 4px);
                margin-left: 10px;
                border: 1px solid var(--border-color, #e9ecef);
                font-size: 0.8rem;
                padding: 0 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
            }
        </style>

        <div class="color-input-group">
            <label for="${id}-internal">${label}</label>
            <input type="color" id="${id}-internal" name="${name}" value="${value}">
            <div class="color-preview" style="background-color: ${value}">
                ${value}
            </div>
        </div>
        `;
    }

    setupEventListeners() {
        const input = this.shadowRoot.querySelector('input');
        const preview = this.shadowRoot.querySelector('.color-preview');

        input.addEventListener('change', (event) => {
            const newValue = event.target.value;
            this._value = newValue;

            // Update preview
            preview.style.backgroundColor = newValue;
            preview.textContent = newValue;

            // Set the attribute to keep it in sync
            this.setAttribute('value', newValue);

            // Dispatch custom event
            this.dispatchEvent(new CustomEvent('color-changed', {
                bubbles: true,
                composed: true,
                detail: {
                    value: newValue,
                    id: this.getAttribute('id'),
                    name: this.getAttribute('name')
                }
            }));
        });
    }

    // Getter and setter for the value property
    get value() {
        return this._value;
    }

    set value(newValue) {
        this._value = newValue;
        this.setAttribute('value', newValue);
        if (this.shadowRoot.querySelector('input')) {
            this.shadowRoot.querySelector('input').value = newValue;
            this.shadowRoot.querySelector('.color-preview').style.backgroundColor = newValue;
            this.shadowRoot.querySelector('.color-preview').textContent = newValue;
        }
    }
}

// Define the custom element
customElements.define('color-picker', ColorPicker);