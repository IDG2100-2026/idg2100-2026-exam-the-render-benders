import { Outlet } from "react-router";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import styles from "./Layout.module.css";

// Layout wraps all pages with Header and Footer
export default function Layout() {
    return (
        <>
            <Header />
            <main className={styles.main}><Outlet /></main> {/* Page content goes here */}
            <Footer />
        </>
    );
}
