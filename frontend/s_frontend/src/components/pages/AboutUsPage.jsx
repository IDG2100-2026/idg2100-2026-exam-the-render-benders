import style from './styles/StaticPage.module.css';

export default function AboutUsPage() {
    return (
        <div className={style['staticPage']}>
            <section className={style['hero']}>
                <p className={style['eyebrow']}>Platform</p>
                <h1 className={style['title']}>About Us</h1>
                <p className={style['subtitle']}>
                    Spanish Poker Dice is an online home for players who enjoy quick
                    rounds, sharp decisions, and the strange little drama that happens
                    when poker logic meets dice luck.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Where It Started</h2>
                <p className={style['text']}>
                    The platform began as a small community project built by people who
                    loved how easy Spanish dice poker was to learn in person, but hated
                    how hard it was to find a good place to play it online. Most digital
                    card and dice spaces were either too noisy, too old-fashioned, or too
                    generic to make the game feel special.
                </p>
                <p className={style['text']}>
                    So the idea was simple: build a focused platform where the game itself
                    stays front and center. Clear rules, readable match info, quick access
                    to games, and enough profile and ranking features to make regular play
                    feel rewarding.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>What The Platform Is For</h2>
                <p className={style['text']}>
                    Spanish Poker Dice is meant to support both casual drop-in matches and
                    more competitive play. New players should be able to understand what is
                    happening quickly, while returning players should have reasons to stay:
                    profiles, match history, ratings, comments, and a steady flow of games
                    to join from the lobby.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>
                        The homepage introduces the game and helps players jump into a match quickly.
                    </li>
                    <li className={style['listItem']}>
                        The lobby makes it easy to find joinable games that match the current rules.
                    </li>
                    <li className={style['listItem']}>
                        Player profiles give regular users a place to track progress, identity, and recent games.
                    </li>
                    <li className={style['listItem']}>
                        Comments and shared match pages make the platform feel social, not just mechanical.
                    </li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>What We Care About</h2>
                <p className={style['text']}>
                    We care about clarity first. Dice games move fast, so players should
                    never have to fight the interface to understand a match, check a rule,
                    or find the next game. We also care about fairness, lightweight
                    customization, and giving the platform a distinct atmosphere without
                    making it harder to use.
                </p>
                <ul className={style['list']}>
                    <li className={style['listItem']}>Readable layouts and clear match information.</li>
                    <li className={style['listItem']}>Flexible variants with visible rule settings.</li>
                    <li className={style['listItem']}>A balance between competitive structure and casual accessibility.</li>
                    <li className={style['listItem']}>A visual identity that feels intentional rather than generic.</li>
                </ul>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Looking Ahead</h2>
                <p className={style['text']}>
                    The long-term goal is to keep growing the platform into a reliable place
                    for leagues, tournaments, spectating, and community activity. Even in its
                    current form, the project is built around one idea: Spanish dice poker
                    deserves a platform that treats it like a real competitive game, not a novelty.
                </p>
            </section>
        </div>
    );
}
