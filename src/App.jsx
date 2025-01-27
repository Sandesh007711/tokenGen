import React from 'react';
import { AuthProvider } from './context/AuthContext';
import W_Routes from './routes/W_Routes';

const App = () => {
  return (
    <AuthProvider>
      <W_Routes />
    </AuthProvider>
  );
};

export default App;