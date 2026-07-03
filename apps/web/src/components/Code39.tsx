// Code-barres Code 39 en SVG pur (aucune dépendance) — lisible par toute
// douchette USB/laser standard. Suffisant pour des codes numériques.

// Motifs Code 39 : 9 éléments (barre/espace alternés), n = étroit, w = large
const PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  '*': 'nwnnwnwnn',
}

const NARROW = 2
const WIDE = 6 // ratio 3:1 pour une lecture fiable

export default function Code39({ value, height = 64, className }: { value: string; height?: number; className?: string }) {
  const chars = ('*' + value.replace(/[^0-9]/g, '') + '*').split('')
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (const ch of chars) {
    const pattern = PATTERNS[ch]
    if (!pattern) continue
    for (let i = 0; i < 9; i++) {
      const w = pattern[i] === 'w' ? WIDE : NARROW
      if (i % 2 === 0) bars.push({ x, w }) // indices pairs = barres
      x += w
    }
    x += NARROW // espace inter-caractère
  }
  const totalWidth = x - NARROW
  const quiet = NARROW * 10 // zone de silence de part et d'autre

  return (
    <svg
      viewBox={`0 0 ${totalWidth + quiet * 2} ${height}`}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Code-barres ${value}`}
    >
      <rect x="0" y="0" width={totalWidth + quiet * 2} height={height} fill="#ffffff" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x + quiet} y="0" width={b.w} height={height} fill="#000000" />
      ))}
    </svg>
  )
}
