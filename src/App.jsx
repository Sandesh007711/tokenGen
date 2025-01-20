import React, { useState } from 'react'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import Content from './components/Content'
import Footer from './components/Footer'

const App = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <main>
      <Nav />
      <section>
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      </section>
      <section className={`content ${isOpen ? 'content-shift' : ''}`}>
        <Content isOpen={isOpen} />
      </section>
      <section>
        <Footer />
      </section>
    </main>
  )
}

export default App