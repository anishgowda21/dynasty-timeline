import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DynastyPage from './pages/DynastyPage';
import KingPage from './pages/KingPage';
import { DynastyProvider } from './context/DynastyContext';

function App() {
  return (
    <DynastyProvider>
      <Router>
        <div className="min-h-screen bg-dynasty-background text-dynasty-text">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dynasties/:id" element={<DynastyPage />} />
              <Route path="/kings/:id" element={<KingPage />} />
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
