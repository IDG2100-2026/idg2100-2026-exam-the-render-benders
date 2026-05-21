import { Outlet } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// MainLayout wraps all the pages with the header and footer
export default function MainLayout(){
    return (
        <>
            <Header />
            <main>
                {/** Outlet renders the current page component based on the route */}
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
