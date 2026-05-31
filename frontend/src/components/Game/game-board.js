import "./game-die.js";

class GameBoard extends HTMLElement {
    static get observedAttributes() {
        return ["spectator"];
    }

    attributeChangedCallback() {
        this.render();
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._state = null;
    }

    // property setter so React can pass objects directly: boardEl.state = { dice: [...] }
    set state(value) {
        this._state = value;
        this.render();
    }

    connectedCallback() {
        // catch die clicks from any of the 5 dice with one listener
        this.shadowRoot.addEventListener("click", (event) => {
            // spectators can see the dice but cannot interact with them
            if (this.hasAttribute("spectator")) return;

            const die = event.target.closest?.("game-die");
            if (!die) return;

            const index = Number(die.getAttribute("index"));
            if (!Number.isInteger(index)) return;

            this.dispatchEvent(
                new CustomEvent("hold-die", { detail: { index }, bubbles: true })
            );

        });
        this.render();
    }

    render() {
        if (!this._state) return;
        const { dice } = this._state;
        const spectator = this.hasAttribute("spectator") ? "spectator" : "";
        const diceHTML = dice.map((die, index) => {
            const held = die.held ? "held" : "";
            return `<game-die index="${index}" value="${die.value}" ${held} ${spectator}></game-die>`;
        }).join("");

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }
            .dice-row {
                display: flex;
                gap: 10px;
            }
        </style>
        <div class="dice-row">${diceHTML}</div>
        `;
    }
}

customElements.define("game-board", GameBoard);