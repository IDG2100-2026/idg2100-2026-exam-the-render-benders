import { useNavigate } from "react-router";
import LobbySection from "./components/LobbySection/LobbySection";
import TopGames from "./components/TopGames/TopGames";
import MyActiveGames from "./components/MyActiveGames/MyActiveGames";
import styles from "./HomePage.module.css";

export default function HomePage() {
    const navigate = useNavigate(); // used to navigate to /create-game when the button is clicked

    return (
        <div className={styles.page}>
            {/* Hero section - intro text and call to action */}
            <section className={styles.hero}>
                <h1>Welcome</h1>

                <p>Challenge players from around the world. Pick your variant, set your rules, and roll the dice.</p>
                <button className={styles.heroButton} onClick={() => navigate("/create-game")}>
                    Create Game
                </button>
            </section>
            {/* Homepage sections - active games for logged-in users, lobby and top games */}
            <MyActiveGames />
            <LobbySection />
            <TopGames />
        </div>
    );
}