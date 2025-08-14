import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import KboPage from './pages/KboPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/KboPage" element={<KboPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
