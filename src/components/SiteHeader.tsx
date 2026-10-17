export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark">V</div>
        <div>
          <p className="eyebrow">Veilant</p>
          <h1>Security command center</h1>
        </div>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <a href="#overview">Overview</a>
        <a href="#exposure">Exposure trend</a>
        <a href="#assets">Assets</a>
        <a href="#vulnerabilities">Vulnerabilities</a>
      </nav>

      <div className="header-actions">
        <button className="chip active">Live posture</button>
        <button className="chip">Export report</button>
      </div>
    </header>
  )
}
