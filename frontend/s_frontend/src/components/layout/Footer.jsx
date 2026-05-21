import style from './styles/Footer.module.css';
import { Link } from 'react-router-dom';

export default function Footer(){
    const currentYear = new Date().getFullYear();
    const startYear = 2026;
    const yearDisplay = startYear === currentYear ? `${startYear}` : `${startYear}-${currentYear}`;
    
    return(
        <footer className={style['footer']}>
            <div className={style['footer-container']}>
                <div className={style['footer-section']}>
                    <h3 className={style['footer-title']}>Spanish Poker Dice</h3>
                    <p className={style['footer-text']}>
                        A competitive online platform for Spanish Poker Dice Games
                    </p>
                </div>

                <div className={style['footer-section']}>
                    <h4 className={style['footer-subtitle']}>Quick Links</h4>
                    <ul className={style['footer-links']}>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/lobby">Lobby</Link></li>
                        <li><Link to="/about-us">About Us</Link></li>
                        <li><Link to="/about-spanish-dice">About Spanish Dice</Link></li>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                        <li><Link to="/terms">Terms and Conditions</Link></li>
                    </ul>
                </div>
            </div>

            <div className={style['footer-bottom']}>
                <p className={style['footer-copyright']}>
                    &copy; {yearDisplay} Spanish Poker Dice. All rights reserved. Implemented by Sebastian Maurbakken as a part of the obligatory assignments in <a href="https://www.ntnu.edu/studies/courses/IDG2100#tab=omEmnet" target='_blank'>IDG2100</a>
                </p>
            </div>
        </footer>
    );
}