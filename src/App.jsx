import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DynastyPage from "./pages/DynastyPage";
import KingPage from "./pages/KingPage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import WarsPage from "./pages/WarsPage";
import WarPage from "./pages/WarPage";
import SettingsPage from "./pages/SettingsPage";
import { DynastyProvider } from "./context/DynastyContext";
import { withBreadcrumbs } from "./components/Breadcrumbs";

// Wrap page components with breadcrumbs
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
    <DynastyProvider>
      <Router>
        <div className="min-h-screen bg-dynasty-background text-dynasty-text">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePageWithBreadcrumbs />} />
              <Route
                path="/dynasties/:id"
                element={<DynastyPageWithBreadcrumbs />}
              />
              <Route path="/kings/:id" element={<KingPageWithBreadcrumbs />} />
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
          <footer className="bg-gray-800 text-white py-4 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} Dynasty Timeline</p>
            </div>
          </footer>
        </div>
      </Router>
    </DynastyProvider>
  );
}

export default App;
