import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TeamProvider } from './store';
import { AuthProvider } from './AuthContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { Users } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Nexus Team
              </Link>
            </div>
          </header>
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/team/:id" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-gray-500">
            <p className="mb-2">&copy; {new Date().getFullYear()} Nexus Team. All rights reserved.</p>
            <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Admin Login
            </Link>
          </footer>
        </div>
      </Router>
    </TeamProvider>
    </AuthProvider>
  );
}
