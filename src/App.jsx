import React, { useState } from 'react';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Footer from './components/Footer';
import 'tailwindcss/tailwind.css';

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contentState, setContentState] = useState('default');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setContentState(isOpen ? 'default' : 'sidebar-opened');
  };

  return (
    <main>
      <Nav />
      <section>
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      </section>
      <section className={`flex-grow transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <Content isOpen={isOpen} contentState={contentState} />
      </section>
      <section>
        <Footer />
      </section>
    </main>
  );
};

export default App;