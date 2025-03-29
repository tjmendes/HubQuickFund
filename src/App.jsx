import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CompetitiveIntelligence from './components/CompetitiveIntelligence'
import BlockchainInfraMonitor from './components/BlockchainInfraMonitor'
import AdvancedAnalytics from './components/AdvancedAnalytics'
import QuickAI from './components/QuickAI'
import ComplianceMonitor from './components/ComplianceMonitor'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/competitive-intelligence" element={<CompetitiveIntelligence />} />
        <Route path="/blockchain-monitor" element={<BlockchainInfraMonitor />} />
        <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
        <Route path="/quick-ai" element={<QuickAI />} />
        <Route path="/compliance-monitor" element={<ComplianceMonitor />} />
      </Routes>
    </Layout>
  )
}

export default App