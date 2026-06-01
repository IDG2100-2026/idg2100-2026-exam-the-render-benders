import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import LobbySection from "@/components/LobbySection/LobbySection";
import TopGames from "@/components/TopGames/TopGames";
import PlatformActivity from "@/components/PlatformActivity/PlatformActivity";
import TournamentPreview from "@/components/TournamentPreview/TournamentPreview";
import styles from "./HomePage.module.css";

export default function HomePage() {
    const navigate = useNavigate(); // used to navigate to /create-game when the button is clicked
    const { user } = useAuth();

    return (
        <div className={styles.page}>
            {/* Hero section - intro text and call to action */}
            <section className={styles.hero}>
                <h1>Welcome</h1>

                <p>Challenge players from around the world. Pick your variant, set your rules, and roll the dice.</p>
                {user ? (
                    <button className={styles.heroButton} onClick={() => navigate("/create-game")}>
                        Create Game
                    </button>
                ) : (
                    <div className={styles.heroButtons}>
                        <button className={styles.heroButton} onClick={() => navigate("/login")}>
                            Login
                        </button>
                        <button className={styles.heroButtonSecondary} onClick={() => navigate("/register")}>
                            Register
                        </button>
                    </div>
                )}
            </section>
            <LobbySection />
            <PlatformActivity />
            <TournamentPreview />
            <TopGames />
        </div>
    );
}