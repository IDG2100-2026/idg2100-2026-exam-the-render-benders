import HeroSection from "@/components/Home/HeroSection";
import LobbyPreview from "@/components/Home/LobbyPreview";
import TopGames from "@/components/Home/TopGames";
import TournamentPreview from "@/components/Home/TournamentPreview";
import styles from "./Home.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            {/** introduction to the platform, with button to create a new game */}
            <HeroSection />
            {/** list of N number of games available to join (N is set in the appearanceSettings) */}
            <LobbyPreview />
            {/** top 5 running games by average ELO, filled with recent games if less than 5 */}
            <TopGames />
            {/** 5 upcoming tournaments closest to the current date */}
            <TournamentPreview />
        </div>
    );
}
