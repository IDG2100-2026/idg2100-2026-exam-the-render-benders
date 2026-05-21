import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";

// HeroSection introduces the platform and gives quick access to create or join a game
export default function HeroSection(){
    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>Spanish Poker Dice</h1>
            <p className={styles.subtitle}>
                Challenge players from all around the world in Spanish Poker Dice. 
                Join an ongoing game or create your own! 
            </p>
            <Link to="/create-game">
                <button className="button button-primary">Create Game</button>
            </Link>
        </section>
    );
}
