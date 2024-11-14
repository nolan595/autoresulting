import React from 'react';
import Sidebar from './components/Sidebar.jsx';
import Questions from './components/Questions.jsx';
import './styles.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="content">
        <Questions />
      </div>
    </div>
  );
}

export default App;
