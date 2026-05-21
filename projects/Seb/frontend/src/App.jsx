import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import { AppearanceProvider } from './context/AppearanceContext.jsx';

import "./App.css";
import Layout from "./components/layout/Layout";
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import LobbyPage from './components/pages/LobbyPage';
import CreateGamePage from './components/pages/CreateGamePage';
import GamePage from './components/pages/GamePage';
import ProfilePage from './components/pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserGamesPage from './components/pages/UserGamesPage.jsx';
import AboutUsPage from './components/pages/AboutUsPage.jsx';
import AboutSpanishDicePage from './components/pages/AboutSpanishDicePage.jsx';
import TermsPage from './components/pages/TermsPage.jsx';
import PrivacyPage from './components/pages/PrivacyPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <GameProvider>
            <Routes>
              <Route element={<Layout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/lobby" element={<LobbyPage/>}/>
                <Route path="/create-game" element={ <ProtectedRoute><CreateGamePage/></ProtectedRoute> }/>
                <Route path="/games/:gameId" element={<GamePage/>}/>
                <Route path="/profile/:userId/games" element={<UserGamesPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/about-spanish-dice" element={<AboutSpanishDicePage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/profile/:userId" element={<ProfilePage/>}/>
              </Route>
            </Routes>
          </GameProvider>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;