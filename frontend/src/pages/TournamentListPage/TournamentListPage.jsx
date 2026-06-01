import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getAllTournaments } from "@/services/tournamentService.js";
import styles from "./TournamentListPage.module.css";

export default function TournamentListPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("date");

    useEffect(() => {
        async function fetchTournaments() {
            setLoading(true);
            try {
                const data  = await getAllTournaments();
                setTournaments(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchTournaments();
    }, []);

    const filtered = tournaments
        .filter(t => search.length < 3 || t.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "date") return new Date(a.startDate) - new Date(b.startDate);
            if (sortBy === "title") return a.name.localeCompare(b.name);
            if (sortBy === "players") return (b.players?.length ?? 0) - (a.players?.length ?? 0);
            return 0;
        });
    
        const upcoming = filtered.filter(t => t.status === "upcoming");
        const ongoing = filtered.filter(t => t.status === "ongoing");
        const past = filtered.filter(t => t.status === "finished");

        return (
            <div className={styles.page}>
                <h1>Tournaments</h1>
                <div className={styles.controls}>
                    <input 
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={styles.searchInput} 
                    />
                    <div className={styles.sortGroup}>
                        <span>Sort by</span>
                        {["date", "title", "players"].map(option => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                className={sortBy === option ? styles.sortActive : styles.sortBtn}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {loading && <p className={styles.loading}>Loading tournaments...</p>}

                {!loading && (
                    <>
                        <Section title="Upcoming" tournaments={upcoming} />
                        <Section title="Ongoing" tournaments={ongoing} />
                        <Section title="Past" tournaments={past} /> 
                    </>
                )}
            </div>
        );
}

function Section({ title, tournaments }) {
    if (tournaments.length === 0) return null;

    return (
        <section className={styles.section}>
            <h2>{title}</h2>
            <div className={styles.list}>
                {tournaments.map(t => (
                    <Link
                        key={t._id}
                        to={`/tournaments/${t._id}`}
                        className={styles.card}
                    >
                        <div className={styles.cardTitle}>{t.name}</div>
                        <div className={styles.cardMeta}>
                            <span>{t.tournamentType}</span>
                            <span>{t.players?.length ?? 0} players</span>
                            <span>{t.rounds?.length ?? 0} {t.rounds?.length === 1 ? "round" : "rounds"}</span>
                            <span className={styles.status}>{t.status}</span>
                        </div>
                        {t.startDate && (
                            <div className={styles.cardDate}>
                                {new Date(t.startDate).toLocaleDateString()}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}

