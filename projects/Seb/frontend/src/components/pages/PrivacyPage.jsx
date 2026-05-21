import style from './styles/StaticPage.module.css';

export default function PrivacyPage() {
    return (
        <div className={style['staticPage']}>
            <section className={style['hero']}>
                <p className={style['eyebrow']}>Legal</p>
                <h1 className={style['title']}>Privacy Policy</h1>
                <p className={style['subtitle']}>
                    This page explains what information the platform stores and how it is used.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Data We Store</h2>
                <p className={style['text']}>
                    We may store account information, match history, profile settings,
                    comments, and platform preferences needed to provide the service.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>How Data Is Used</h2>
                <p className={style['text']}>
                    Stored data is used to display profiles, calculate statistics, power match history,
                    and maintain the general functionality of the platform.
                </p>
            </section>

            <section className={style['section']}>
                <h2 className={style['sectionTitle']}>Your Control</h2>
                <p className={style['text']}>
                    Users can update profile-related information and may request account removal
                    according to platform policy.
                </p>
            </section>
        </div>
    );
}