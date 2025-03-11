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
import { withBreadcrumbs } from "./components/Breadcrumbs";
import { Toaster } from "react-hot-toast";

// Apply breadcrumbs to all pages
const HomePageWithBreadcrumbs = withBreadcrumbs(HomePage);
const DynastyPageWithBreadcrumbs = withBreadcrumbs(DynastyPage);
const KingPageWithBreadcrumbs = withBreadcrumbs(KingPage);
const EventsPageWithBreadcrumbs = withBreadcrumbs(EventsPage);
const EventPageWithBreadcrumbs = withBreadcrumbs(EventPage);
const WarsPageWithBreadcrumbs = withBreadcrumbs(WarsPage);
const WarPageWithBreadcrumbs = withBreadcrumbs(WarPage);
const SettingsPageWithBreadcrumbs = withBreadcrumbs(SettingsPage);

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
                <Route path="/" element={<HomePageWithBreadcrumbs />} />
                <Route
                  path="/dynasties/:id"
                  element={<DynastyPageWithBreadcrumbs />}
                />
                <Route
                  path="/kings/:id"
                  element={<KingPageWithBreadcrumbs />}
                />
                <Route path="/events" element={<EventsPageWithBreadcrumbs />} />
                <Route
                  path="/events/:id"
                  element={<EventPageWithBreadcrumbs />}
                />
                <Route path="/wars" element={<WarsPageWithBreadcrumbs />} />
                <Route path="/wars/:id" element={<WarPageWithBreadcrumbs />} />
                <Route
                  path="/settings"
                  element={<SettingsPageWithBreadcrumbs />}
                />
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
