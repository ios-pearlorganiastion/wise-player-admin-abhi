import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard'; // Is file ko create kar lena
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route Login par jayega */}
          <Route path="/" element={<Login />} />
          
          {/* Dashboard route jo login ke baad dikhega */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// YEH LINE SABSE ZAROORI HAI - Isi ki wajah se error aa rahi thi
export default App;