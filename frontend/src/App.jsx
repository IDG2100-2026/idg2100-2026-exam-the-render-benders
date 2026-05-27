import { BrowserRouter, Routes, Route } from "react-router";
import AuthProvider from "@/providers/AuthProvider";
import Layout from "@/layouts/Layout";
import HomePage from "@/pages/HomePage/HomePage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import CreateGamePage from "@/pages/CreateGamePage/CreateGamePage";
import LobbyPage from "@/pages/LobbyPage/LobbyPage";
import UserProfilePage from "@/pages/UserProfilePage/UserProfilePage";
import UserGamesPage from "@/pages/UserGamesPage/UserGamesPage";
import GamePage from "@/pages/GamePage/GamePage";
import AboutPage from "@/pages/AboutPage/AboutPage";
import AboutSpanishDicePage from "@/pages/AboutSpanishDicePage/AboutSpanishDicePage";
import TermsPage from "@/pages/TermsPage/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage/PrivacyPage";
import AppearanceProvider from "@/providers/AppearanceProvider";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage/EmailVerificationPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/create-game" element={<CreateGamePage />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/users/:username" element={<UserProfilePage />} />
              <Route path="/users/:username/games" element={<UserGamesPage />} />
              <Route path="/games/:id" element={<GamePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about-spanish-dice" element={<AboutSpanishDicePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/policy" element={<PrivacyPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;