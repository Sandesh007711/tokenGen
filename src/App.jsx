import { useState } from 'react'
import Nav from './components/Nav'
import Sidebar from './components/Sidebar'

const App = () => (
  <main>
    <Nav/>
    {/*sandesh*/}
    <section>
      <Sidebar/>
    </section>
    <section>
      <h1>content</h1>
    </section>
    <section>
      <h1>footer</h1>
    </section>
  </main>
)

export default App
