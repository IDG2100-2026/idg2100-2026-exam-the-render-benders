import styles from "./About.module.css";

export default function About() {
    return (
        <div className={styles.page}>
            <h1>About us</h1>
            <section className={styles.section}>
                <h2>Who are we</h2>
                <p>
                    We are SPD, a way for you to play Spanish Poker Dice
                    at home. We were founded in 2026 as a group of friends
                    who shares a passion for this special game. What started 
                    as a hobby project to play with each other has now grown 
                    into a platform by players, for players all over the world.
                </p>
            </section>
            <section className={styles.section}>
                <h2>Our story</h2>
                <p>
                    We started in an apartment in Gjøvik, Norway. Two friends, 
                    bored on a rainy weekend, who wanted to play something they 
                    had never played before. We found this game and fell in love 
                    immediately, but couldn't find a good version online, so we 
                    had to build it ourselves. 
                </p>
                <p>
                    After a whole spring of development and testing, SPD launched 
                    in 2026. Since then, many players have joined the platform to 
                    play, compete, improve and enjoy the game we all love.
                </p>
            </section>
            <section className={styles.section}>
                <h2>Our mission</h2>
                <p>
                    Our mission is simple, but not easy. We want to make Spanish 
                    Poker Dice available for everyone to enjoy. We want to provide 
                    the best online experience for all people, from beginners to 
                    professionals. 
                </p>
            </section>
        </div>
    );
}
