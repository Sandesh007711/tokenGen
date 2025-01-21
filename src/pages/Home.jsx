import { useState } from 'react'
import React from 'react'
import Nav from '../components/Nav'
import Sidebar from '../components/Sidebar'
import Content from './Content'
import Footer from '../components/Footer'
import Route from '../routes/I_Routes'

const Home = () => {

    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };

  return (
    <main>
      <Nav className="fixed top-0 w-full z-50" />
      <section className='pt-[142px]'> {/* Add padding to avoid content being hidden behind the navbar */}
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      </section>
      <section className={`px-10 flex-grow transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <Content isOpen={isOpen}/>
      </section>
      <section>
        <Footer />
      </section>
    </main>
  )
}

export default Home