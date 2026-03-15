import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './components/Toast';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import TeamFinder from './pages/TeamFinder';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Grow from './pages/Grow';
import BlogDetail from './pages/BlogDetail';
import OrgDashboard from './pages/OrgDashboard';
import OrgProfile from './pages/OrgProfile';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import FestBot from './components/FestBot';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#080818' }}>
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 animate-spin mx-auto mb-4" />
                    <p className="gradient-text text-xl font-bold">LinkUp</p>
                </div>
            </div>
        );
    }
    return user ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
    return (
        <div className="min-h-screen" style={{ background: '#080818' }}>
            <Navbar />
            <main className="main-content pt-16">
                {children}
            </main>
            <BottomNav />
            <FestBot />
        </div>
    );
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
            <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
            <Route path="/discover" element={<PrivateRoute><AppLayout><Discover /></AppLayout></PrivateRoute>} />
            <Route path="/teams" element={<PrivateRoute><AppLayout><TeamFinder /></AppLayout></PrivateRoute>} />
            <Route path="/events" element={<PrivateRoute><AppLayout><Events /></AppLayout></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><AppLayout><Chat /></AppLayout></PrivateRoute>} />
            <Route path="/chat/:userId" element={<PrivateRoute><AppLayout><Chat /></AppLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><AppLayout><Leaderboard /></AppLayout></PrivateRoute>} />
            {/* NEW v2.0 routes */}
            <Route path="/marketplace" element={<PrivateRoute><AppLayout><Marketplace /></AppLayout></PrivateRoute>} />
            <Route path="/marketplace/:id" element={<PrivateRoute><AppLayout><ListingDetail /></AppLayout></PrivateRoute>} />
            <Route path="/grow" element={<PrivateRoute><AppLayout><Grow /></AppLayout></PrivateRoute>} />
            <Route path="/grow/blog/:id" element={<PrivateRoute><AppLayout><BlogDetail /></AppLayout></PrivateRoute>} />
            <Route path="/org/dashboard" element={<PrivateRoute><AppLayout><OrgDashboard /></AppLayout></PrivateRoute>} />
            <Route path="/org/:id" element={<PrivateRoute><AppLayout><OrgProfile /></AppLayout></PrivateRoute>} />
            <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#080818' }}>
                    <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                    <p className="text-muted text-lg mb-8">This page doesn't exist</p>
                    <a href="/" className="btn-primary px-8 py-3">Go Home</a>
                </div>
            } />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <SocketProvider>
                        <AppRoutes />
                    </SocketProvider>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
