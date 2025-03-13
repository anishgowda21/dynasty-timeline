import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { DynastyProvider } from "./context/DynastyContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import HomePage from "./pages/HomePage";
import DynastyPage from "./pages/DynastyPage";
import KingPage from "./pages/KingPage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import WarsPage from "./pages/WarsPage";
import WarPage from "./pages/WarPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./utils/ScrollToTop";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <DarkModeProvider>
      <DynastyProvider>
        <Router>
          <Toaster />
          <ScrollToTop />
          <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dynasties/:id" element={<DynastyPage />} />
                <Route path="/kings/:id" element={<KingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventPage />} />
                <Route path="/wars" element={<WarsPage />} />
                <Route path="/wars/:id" element={<WarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DynastyProvider>
    </DarkModeProvider>
  );
}

export default App;
