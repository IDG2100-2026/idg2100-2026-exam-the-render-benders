class GameDie extends HTMLElement {
    static get observedAttributes() {
        return ["value", "held", "spectator"];
    }

    constructor() {
        super();
        this.attachShadow({
            mode: "open"
        });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener("click", () => {
            if (this.hasAttribute("spectator")) return;
            // bubbles: true so game-board can catch all die clicks with one listener
            this.dispatchEvent(
                new CustomEvent("die-click", {
                    bubbles: true
                })
            );
        });
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const value = this.getAttribute("value") || "?";
        const held = this.hasAttribute("held");
        const spectator = this.hasAttribute("spectator");
        const background = held ? "#2ecc71" : "#ffffff";
        const color = "#0f0f0f";
        const border = held ? "#27ae60" : "#000";
        const cursor = spectator ? "default" : "pointer";

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    width: 64px;
                    height: 64px;
                    background: ${background};
                    border: 4px solid ${border};
                    border-radius: 10px;
                    align-items: center;
                    justify-content: center;
                    cursor: ${cursor};
                    font-size: 1.6rem;
                    font-weight: bold;
                    color: ${color};
                    user-select: none;
                }
                ${!spectator ? ":host(:hover) { border-color: #c9a84c; }" : ""}
            </style>
            ${value}
        `;
    }
}

customElements.define("game-die", GameDie);