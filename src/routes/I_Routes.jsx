import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Content from '../pages/Content'
import Test from '../pages/test'

const I_Routes = () => {
  return (
    <Routes>
      <Route path="/content" element={<Content />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  )
}

export default I_Routes