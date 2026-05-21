import { MdStars, MdAccessTime, MdLayers, MdCheckCircle } from "react-icons/md";
import styles from "./AboutSpanishDicePage.module.css";

export default function AboutSpanishDicePage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>About Spanish Dice</h1>
                <p className={styles.subtitle}>
                    A classic game of chance, bluffing, and strategy.
                </p>
            </header>

            <section className={styles.section}>
                <h2><MdStars /> The Basics</h2>
                <p>
                    Spanish Poker Dice is a traditional dice game popular in Spain and Latin America. 
                    It is played with five dice and combines elements of traditional poker and classic dice games. 
                    Each round, players roll the dice and try to form the best possible combination.
                </p>
            </section>

            <section className={styles.section}>
                <h2><MdCheckCircle /> Winning Hands (Highest to Lowest)</h2>
                <div className={styles.handsGrid}>
                    <div className={styles.handCard}>
                        <h3>Five of a Kind (Repoker)</h3>
                        <p>All five dice showing the same value. The absolute best hand.</p>
                        <div className={styles.diceRow}>⚄ ⚄ ⚄ ⚄ ⚄</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>Four of a Kind (Poker)</h3>
                        <p>Four dice showing the same value.</p>
                        <div className={styles.diceRow}>⚃ ⚃ ⚃ ⚃ ⚁</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>Full House (Full)</h3>
                        <p>Three of a kind combined with a pair.</p>
                        <div className={styles.diceRow}>⚂ ⚂ ⚂ ⚅ ⚄</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>Straight (Escalera)</h3>
                        <p>Five sequential dice (1-2-3-4-5 or 2-3-4-5-6). <em>Only valid if "Straights Allowed" rule is active.</em></p>
                        <div className={styles.diceRow}>⚀ ⚁ ⚂ ⚃ ⚄</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>Three of a Kind (Pierna)</h3>
                        <p>Three dice showing the same value.</p>
                        <div className={styles.diceRow}>⚅ ⚅ ⚅ ⚁ ⚃</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>Two Pair (Dobles)</h3>
                        <p>Two distinct pairs.</p>
                        <div className={styles.diceRow}>⚃ ⚃ ⚁ ⚁ ⚄</div>
                    </div>
                    <div className={styles.handCard}>
                        <h3>One Pair (Pareja)</h3>
                        <p>Two dice showing the same value.</p>
                        <div className={styles.diceRow}>⚄ ⚄ ⚀ ⚂ ⚃</div>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2><MdLayers /> Platform Game Rules</h2>
                <p>When playing on this platform, you can customize your game setup:</p>
                <div className={styles.rulesGrid}>
                    <div className={styles.ruleCard}>
                        <div className={styles.ruleHeader}>
                            <div className={styles.ruleIcon}><MdLayers /></div>
                            <h3>Rounds</h3>
                        </div>
                        <p>Decide the length of the match. You can play a quick <strong>Best of 3</strong>, a standard <strong>Best of 5</strong>, or an epic <strong>Best of 7</strong> series.</p>
                    </div>
                    <div className={styles.ruleCard}>
                        <div className={styles.ruleHeader}>
                            <div className={styles.ruleIcon}><MdAccessTime /></div>
                            <h3>Time Control</h3>
                        </div>
                        <p>Set the pace of the game. Choose from <strong>3s (Blitz)</strong> for rapid-fire, <strong>10s (Standard)</strong> for balanced play, or <strong>30s (Relaxed)</strong> for careful strategy.</p>
                    </div>
                    <div className={styles.ruleCard}>
                        <div className={styles.ruleHeader}>
                            <div className={styles.ruleIcon}><MdCheckCircle /></div>
                            <h3>Straights</h3>
                        </div>
                        <p>Traditionalists often prefer to play without straights. You can toggle this rule <strong>On</strong> or <strong>Off</strong> to suit your preferred playstyle.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
