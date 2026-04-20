import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Devices from './components/Devices/Devices';
import Payments from './components/Payments/Payments';
import Subscriptions from './components/Subscriptions/Subscriptions';
import AdminManagement from './components/Auth/AdminManagement';
import AdminSetup from './components/Auth/AdminSetup';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Resellers from './components/Resellers/Resellers';
import Plans from './components/Plans/Plans';
import ActivationRequests from './components/RechargeRequests/RechargeRequests';
import Reports from './components/Reports/Reports';
import Users from './components/Users/Users';
import SupportTickets from './components/SupportTickets/SupportTickets';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/activation-requests" element={<ActivationRequests />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/resellers" element={<Resellers />} />
              <Route path="/support-tickets" element={<SupportTickets />} />
              <Route path="/admin-management" element={<AdminManagement />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
