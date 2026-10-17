const currentYear = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a className="footer-brand" href="#overview">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>
            <strong>Veilant</strong>
            <small>Security command center</small>
          </span>
        </a>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#overview">Overview</a>
          <a href="#exposure">Exposure trend</a>
          <a href="#assets">Assets</a>
          <a href="#vulnerabilities">Vulnerabilities</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {currentYear} Veilant. Security posture, clearly in view.</span>
        <a href="#overview">Back to top ↑</a>
      </div>
    </footer>
  )
}
