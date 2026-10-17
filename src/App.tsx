import { AssetPosture } from './components/AssetPosture'
import { ExposureTrend } from './components/ExposureTrend'
import { OverviewCards } from './components/OverviewCards'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { VulnerabilityManager } from './components/VulnerabilityManager'
import { useDashboardData } from './hooks/useDashboardData'
import './App.css'

function App() {
  const { data, loadError, saveVulnerability, deleteVulnerability } = useDashboardData()

  if (!data) {
    return <div className="loading">{loadError || 'Loading Veilant security command center…'}</div>
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="dashboard" id="overview">
        <OverviewCards overview={data.overview} assetCount={data.assets.length} />
        <section className="content-grid">
          <ExposureTrend trend={data.trend} />
          <AssetPosture assets={data.assets} />
        </section>
        <VulnerabilityManager
          assets={data.assets}
          vulnerabilities={data.vulnerabilities}
          onSave={saveVulnerability}
          onDelete={deleteVulnerability}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
