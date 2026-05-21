import styles from "./AboutSPD.module.css";

export default function AboutSPD() {
    return (
        <div className={styles.page}>
            <h1>What is Spanish Poker Dice</h1>
            <section className={styles.section}>
                <h2>Overview</h2>
                <p>
                    Spanish Poker Dice is a dice game where two or more players
                    go up against each other and tries to get the best hand possible from 
                    3 throws.  
                    Spanish Poker Dice can be played in rounds of 3, 5 or 7, with or without 
                    straights, and with time limits of 3, 10 or 30 seconds.
                </p>
            </section>
            <section className={styles.section}>
                <h2>Equipment</h2>
                <p>
                    You only need 5 dice to play Spanish Poker Dice. The best would be to have 
                    Spanish Poker Dice (with faces: 7, 8, J, Q, K, A), but you can also play with 
                    regular dice and simulate the values of the traditional dices.
                </p>
                <p>
                    You could also just open our website, and play right here. Then, you would 
                    only need a computer and internet! 
                </p>
            </section>
            <section className={styles.section}>
                <h2>Playing flow</h2>
                <p>
                    The game starts by deciding how many rounds you want to play and whether you want 
                    to include straights or not. After deciding that, player 1 starts by throwing all 
                    their dice. They can hold the dice they want to keep and throw the remaining dice 
                    again for a maximum of 3 throws. 
                </p>
                <p>
                    If two players have the same hand, the player with the highest 
                    primary card (the main part of the hand) wins. If they are also 
                    the same, the player with the highest secondary card wins. If 
                    they are also the same, the round is a draw, and the players go 
                    to a new round. 
                </p>
                <p>
                    After both players have done their rounds, the player with the best hand wins the 
                    round. The player who wins the required amount of rounds wins the match! 
                </p>
            </section>
            <section className={styles.section}>
                <h2>Hands</h2>
                <p className={styles.list_info}>
                    There are several possible hands that the player can try to get:
                </p>
                <ul className={styles.list}> 
                    <li>Pôker (5 of a kind)</li>
                    <li>4 of a kind</li>
                    <li>Full house (3 and 2 of a kind)</li>
                    <li>Straight (high, 8-J-Q-K-A)</li>
                    <li>Straight (low, 7-8-J-Q-K)</li>
                    <li>Three of a kind</li>
                    <li>Two pairs</li>
                    <li>One pair</li>
                    <li>High card</li>
                </ul>
            </section>
        </div>
    );
}
