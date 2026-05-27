class GamePlayer extends HTMLElement {
    static get observedAttributes() {
        return ["name", "stack", "active"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute("name") || "Player";
        const stack = this.getAttribute("stack") || 0;
        const active = this.hasAttribute("active");
        const background = active ? "#e8f4e8" : "#f9f9f9";
        const border = active ? "2px solid #4caf50" : "2px solid #ddd";

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 8px;
                background: ${background};
                border: ${border};
            }
            .name {
                font-weight: bold;
            }
            .stack {
                font-size: 0.9rem;
                color: #555;
            }
        </style>
        <span class="name">${name}</span>
        <span class="stack">${stack}</span>
        `;
    }
}

customElements.define("game-player", GamePlayer);