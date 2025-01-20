import { useState } from 'react'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import Content from './components/Content'
import Footer from './components/Footer'

const App = () => (
  <main>
    <Nav/>
    {/*sandesh*/}
    <section>
      <Sidebar/>
    </section>
    <section>
      <Content/>
    </section>
    <section>
      <Footer/>
    </section>
  </main>
)

export default App
