import { MdGroups, MdOutlineRocketLaunch, MdCode } from "react-icons/md";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>About Us</h1>
                <p className={styles.subtitle}>
                    A digital revolution born from a dusty tavern table.
                </p>
            </header>

            <div className={styles.contentList}>
                <section className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <MdOutlineRocketLaunch />
                    </div>
                    <div className={styles.textContainer}>
                        <h2>The Legend Begins</h2>
                        <p>
                            The idea for this platform wasn't born in a high-tech office. It started in 2020, 
                            deep in a bustling tavern in Madrid. A group of developers found themselves caught up in 
                            an intense, hours-long game of traditional Spanish Poker Dice. When the tavern finally closed, 
                            we realized the game shouldn't end there. We decided to bring that exact energy to the web.
                        </p>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <MdGroups />
                    </div>
                    <div className={styles.textContainer}>
                        <h2>A Global Community</h2>
                        <p>
                            What started as a private server for our friends quickly spiraled out of control. 
                            Word spread, and soon we had players logging in from all corners of the globe. 
                            Today, our platform hosts thousands of matches daily, complete with an advanced Elo 
                            rating system that separates the lucky rollers from the true dice masters.
                        </p>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <MdCode />
                    </div>
                    <div className={styles.textContainer}>
                        <h2>The Crafters</h2>
                        <p>
                            We are a small, passionate team of dice enthusiasts and code monkeys. We run everything 
                            from the real-time game servers to the shiny React buttons you see in front of you. 
                            Our goal is to preserve the authentic, cutthroat nature of the classic game, while wrapping 
                            it in a modern, fast, and competitive online experience.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
