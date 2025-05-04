
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '../biblia-online/App';

const BibliaOnline: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <App />
    </div>
  );
};

export default BibliaOnline;
