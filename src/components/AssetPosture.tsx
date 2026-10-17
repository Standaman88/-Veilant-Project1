import type { Asset } from '../types'

type AssetPostureProps = {
  assets: Asset[]
}

export function AssetPosture({ assets }: AssetPostureProps) {
  const topAssets = [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)

  return (
    <aside className="panel side-panel" id="assets">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow muted">Risk hotspots</p>
          <h2>Asset posture</h2>
        </div>
      </div>
      <div className="asset-list">
        {topAssets.map((asset) => (
          <div key={asset.id} className="asset-row">
            <div>
              <strong>{asset.name}</strong>
              <small>{asset.environment}</small>
            </div>
            <span className="score-pill">{asset.riskScore}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
