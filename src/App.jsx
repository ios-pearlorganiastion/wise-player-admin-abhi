import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard'; // Is file ko create kar lena
import Devices from './components/Devices/Devices';
import Payments from './components/Payments/Payments';
import Subscriptions from './components/Subscriptions/Subscriptions';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route Login par jayega */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/devices" element={<Devices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
        </Routes>
      </div>
    </Router>
  );
}

// YEH LINE SABSE ZAROORI HAI - Isi ki wajah se error aa rahi thi
export default App;