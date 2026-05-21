import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import Home from "@/pages/Home/Home";
import Lobby from "@/pages/Lobby/Lobby";
import Tournaments from "@/pages/Tournaments/Tournaments";
import AboutSPD from "@/pages/AboutSPD/AboutSPD";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import Profile from "@/pages/Profile/Profile";
import About from "@/pages/About/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions/TermsAndConditions";
import CreateGame from "@/pages/CreateGame/CreateGame";
import Game from "@/pages/Game/Game";
import Tournament from "@/pages/Tournament/Tournament";
import UserGames from "@/pages/UserGames/UserGames";
import { AppearanceProvider } from "@/contexts/AppearanceContext";


function App() {
    return (
        < AuthProvider >
        {/* Auth Provider wraps everything so that all components can access the authentication state */ }
        {/* AppProv makes dark mode, board color and lobby count available to all components without passing props*/ }
        < AppearanceProvider >
        <BrowserRouter>
            <Routes>
                {/** Login and register does not use the main layout (no footer or header) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/** All other pages use MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/about-spanish-poker-dice" element={<AboutSPD />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                    <Route path="/create-game" element={<CreateGame />} />
                    <Route path="/game/:mid" element={<Game />} />
                    <Route path="/tournaments/:tid" element={<Tournament />} />
                    <Route path="/profile/:uid" element={<Profile />} />
                    <Route path="/profile/:uid/games" element={<UserGames />} />
                </Route>
            </Routes>
        </BrowserRouter>
            </AppearanceProvider >
        </AuthProvider >
  )
}

export default App
