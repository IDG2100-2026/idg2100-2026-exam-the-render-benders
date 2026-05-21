import { Outlet } from 'react-router';
import Footer from "./Footer";
import Header from "./Header";
import style from './styles/Layout.module.css';


export default function Layout(){
    return(
        <div className={style['layout']}>
            <Header/>
            <main className={style['main-content']}>
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );
}