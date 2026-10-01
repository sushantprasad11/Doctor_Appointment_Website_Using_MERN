import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ChatBot from './components/ChatBot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorProfilePage from './pages/DoctorProfilePage';
import BookAppointment from './pages/BookAppointment';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorDirectory />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />

          {/* Patient */}
          <Route path="/book/:doctorId" element={
            <RoleRoute roles={['patient']}><BookAppointment /></RoleRoute>
          } />
          <Route path="/patient/dashboard" element={
            <RoleRoute roles={['patient']}><PatientDashboardPage /></RoleRoute>
          } />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={
            <RoleRoute roles={['doctor']}><DoctorDashboardPage /></RoleRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <RoleRoute roles={['admin']}><AdminDashboardPage /></RoleRoute>
          } />


          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <ChatBot />
      </AuthProvider>
    </BrowserRouter>
  );
}
