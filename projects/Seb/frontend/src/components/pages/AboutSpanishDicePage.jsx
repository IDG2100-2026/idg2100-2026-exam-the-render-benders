import style from './styles/StaticPage.module.css';

export default function AboutSpanishDicePage() {
    return (
        <div className={style['staticPage']}>
            <section className={style['hero']}>
                <p className={style['eyebrow']}>Game Guide</p>
                <h1 className={style['title']}>About Spanish Dice</h1>
                <p className={style['subtitle']}>
                    Spanish Dice Poker is a two-player game played with five poker dice.
                    Each round is about building the strongest hand in up to three rolls,
                    then collecting enough round wins to take the match.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>The Dice</h2>
                <p className={style['text']}>
                    The game uses five six-sided poker dice. Instead of normal numbers,
                    the faces represent classic card-style ranks used to build hands.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>
                        Ace is the highest face.
                    </li>
                    <li className={style['listItem']}>
                        The full face order is A, K, Q, J, 8, 7.
                    </li>
                    <li className={style['listItem']}>
                        Those six faces are the only values used to make pairs, sets,
                        full houses, and straights.
                    </li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>How A Round Works</h2>
                <p className={style['text']}>
                    Both players try to improve the same five dice across a maximum of
                    three rolls. Between rolls, they can keep the dice they like and reroll
                    the rest.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>
                        A round begins with all five dice available and no holds selected.
                    </li>
                    <li className={style['listItem']}>
                        The player rolls all five dice first, then decides which dice to keep.
                    </li>
                    <li className={style['listItem']}>
                        The unheld dice may be rerolled up to two more times.
                    </li>
                    <li className={style['listItem']}>
                        After the final roll, the hand is scored and compared against the opponent.
                    </li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Hand Ranking</h2>
                <p className={style['text']}>
                    Final hands are ranked from strongest to weakest. A better category
                    beats a lower one, and face order is used to break ties when needed.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>Repoker: five of a kind.</li>
                    <li className={style['listItem']}>Poker: four of a kind.</li>
                    <li className={style['listItem']}>Full: three of one face and two of another.</li>
                    <li className={style['listItem']}>
                        Escalera: a straight, if straights are enabled for that game.
                    </li>
                    <li className={style['listItem']}>Trio: three of a kind.</li>
                    <li className={style['listItem']}>Doble pareja: two pairs.</li>
                    <li className={style['listItem']}>Pareja: one pair.</li>
                    <li className={style['listItem']}>Carta alta: a high-card hand.</li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Platform Rules</h2>
                <p className={style['text']}>
                    This platform supports a few configurable rules, so one match may feel
                    different from the next.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>
                        Match length: best of 3, best of 5, or best of 7 rounds.
                    </li>
                    <li className={style['listItem']}>
                        Straights: when enabled, the valid sequences are 7-8-J-Q-K and
                        8-J-Q-K-A. When disabled, those hands count as regular high-card hands.
                    </li>
                    <li className={style['listItem']}>
                        Time control: each round can use a 3, 10, or 30 second timer.
                    </li>
                    <li className={style['listItem']}>
                        To win the match, a player must reach more than half of the listed rounds:
                        2 wins in best of 3, 3 wins in best of 5, or 4 wins in best of 7.
                    </li>
                    <li className={style['listItem']}>
                        Finished dice stay visible on the board until the next round begins.
                    </li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Why It Feels Good To Play</h2>
                <p className={style['text']}>
                    Spanish Dice Poker is fast, readable, and tense. You are always making
                    a tradeoff between protecting a decent hand and rerolling for something
                    stronger, and the short timers make those choices matter.
                </p>
            </section>
        </div>
    );
}
