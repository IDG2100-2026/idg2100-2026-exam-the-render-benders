import style from './styles/StaticPage.module.css';

export default function TermsPage() {
    return (
        <div className={style['staticPage']}>
            <section className={style['hero']}>
                <p className={style['eyebrow']}>Legal</p>
                <h1 className={style['title']}>Terms and Conditions</h1>
                <p className={style['subtitle']}>
                    These terms govern access to and use of the Spanish Poker Dice platform.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Acceptable Use</h2>
                <p className={style['text']}>
                    Users must not abuse platform features, harass others, or attempt to
                    manipulate match results or ratings.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Accounts</h2>
                <p className={style['text']}>
                    Users are responsible for the accuracy of their account details and for
                    activities performed through their account.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Platform Rights</h2>
                <p className={style['text']}>
                    The platform may suspend accounts, remove content, or update these terms
                    when needed to maintain fair use and service stability.
                </p>
            </section>
        </div>
    );
}