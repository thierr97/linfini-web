// Image curée par produit, choisie par nom DANS le contexte de sa catégorie
// (les images d'Odoo sont réutilisées/fausses ; ce mapping garantit une image
// distincte et cohérente). Raisonnement par section d'abord pour éviter qu'un
// mot-clé déborde (ex. "oran-GIN-a" ne doit pas devenir un verre de gin).
// Retourne un chemin /menu/*.png|jpg local, ou null si aucun match.

const IMG = {
  accras: '/menu/accras.jpg',
  carbonara: '/menu/spaghetti-carbonara.jpg',
  bolognaise: '/menu/spaghetti-bolognaise.jpg',
  burgerFrites: '/menu/burger-frites-cut.png',
  burger: '/menu/burger.jpg',
  travers: '/menu/travers-porc.jpg',
  tenders: '/menu/tenders-poulet-cut.png',
  tasty: '/menu/tasty-poulet.jpg',
  croustilles: '/menu/croustilles-cut.png',
  wrap: '/menu/wrap.jpg',
  mixTapas: '/menu/mix-tapas.jpg',
  frites: '/menu/frites-cut.png',
  mojito: '/menu/mojito-cut.png',
  caipirinha: '/menu/caipirinha.jpg',
  daiquiri: '/menu/daiquiri-cut.png',
  margarita: '/menu/cocktail-cut.png',      // margarita-cut = cutout vide
  cosmopolitan: '/menu/cocktail-cut.png',   // cosmopolitan-cut = clipart minuscule
  // Fallbacks cocktails : les assets "mai-tai/baileys/whiskey-sour/tequila-sunrise"
  // du repo sont en réalité des DESSINS de recette, et margarita/cosmo/pina des
  // cutouts vides/minuscules → on retombe sur un beau cocktail générique.
  // (En pratique Odoo fournit la vraie photo pour ces cocktails, ceci n'est qu'un secours.)
  maiTai: '/menu/cocktail-cut.png',
  pinaColada: '/menu/cocktail-cut.png',
  longIsland: '/menu/long-island-cut.png',
  moscowMule: '/menu/moscow-mule.jpg',
  negroni: '/menu/negroni.jpg',
  amaretto: '/menu/amaretto.jpg',
  whiskeySour: '/menu/cocktail-cut.png',
  aperol: '/menu/aperol-cut.png',
  tequilaSunrise: '/menu/cocktail-cut.png',
  espressoMartini: '/menu/espresso-martini.jpg',
  baileys: '/menu/cocktail-cut.png',
  campari: '/menu/campari.jpg',
  cosmoCut: '/menu/cocktail-cut.png',
  mocktail: '/menu/mocktail-cut.png',
  cocktailCreation: '/menu/cocktail-creation-cut.png',
  cocktail: '/menu/cocktail-cut.png',
  rhum: '/menu/rhum-cut.png',
  vodka: '/menu/vodka-cut.png',
  cognac: '/menu/cognac-cut.png',
  whisky: '/menu/whisky-cut.png',
  jackDaniels: '/menu/jack-daniels-cut.png',
  glassSpirits: '/menu/glass-spirits-cut.png',
  spiritsBottle: '/menu/spirits-bottle.jpg',
  coca: '/menu/coca-cola-cut.png',
  fantaExotique: '/menu/off-fanta-exotique-cut.png',
  fantaOrange: '/menu/off-fanta-orange-cut.png',
  sprite: '/menu/off-sprite-cut.png',
  schweppes: '/menu/off-schweppes-cut.png',
  orangina: '/menu/off-orangina-cut.png',
  perrier: '/menu/off-perrier-cut.png',
  water: '/menu/water.jpg',
  redBull: '/menu/red-bull-cut.png',
  longHorn: '/menu/off-long-horn-energy-drink-cut.png',
  xlEnergy: '/menu/off-xl-energy-cut.png',
  fuzeTea: '/menu/off-fuze-tea-cut.png',
  jusAnanas: '/menu/off-jus-d-ananas-caraibos-cut.png',
  jusGoyave: '/menu/off-jus-goyave-cut.png',
  jusMangue: '/menu/off-jus-mangue-cut.png',
  jusOrange: '/menu/jus-orange.jpg',
  jusPassion: '/menu/off-jus-fruit-de-la-passion-cut.png',
  jusPomme: '/menu/off-jus-de-pomme-cut.png',
  minuteMaid: '/menu/off-minute-maid-orange-cut.png',
  softDrink: '/menu/soft-drink-cut.png',
  corona: '/menu/corona-cut.png',
  heineken: '/menu/heineken.jpg',
  beer: '/menu/beer.jpg',
  champagneIce: '/menu/champagne-ice.jpg',
  champagne: '/menu/champagne.jpg',
  wine: '/menu/wine-cut.png',
  chicha: '/menu/chicha-cut.png',
  entrance: '/menu/entrance-cut.png',
}

function norm(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Image curée pour un produit, selon sa catégorie puis son nom. null si aucun match. */
export function curatedImage(name: string, section: string): string | null {
  const n = norm(name)
  const words = n.split(' ')
  const has = (...k: string[]) => k.some(w => n.includes(w))       // sous-chaîne
  const word = (...k: string[]) => k.some(w => words.includes(w))  // mot entier (évite oran-gin-a)

  switch (section) {
    // ── Plats / tapas ────────────────────────────────────────────────────────
    case 'Tapas / Resto':
      if (has('accras')) return IMG.accras
      if (has('carbonara')) return IMG.carbonara
      if (has('bolognaise', 'bolognese')) return IMG.bolognaise
      if (has('burger') && has('frite')) return IMG.burgerFrites
      if (has('burger')) return IMG.burger
      if (has('travers')) return IMG.travers
      if (has('tenders')) return IMG.tenders
      if (has('tasty')) return IMG.tasty
      if (has('croustille', 'crousty', 'croustill')) return IMG.croustilles
      if (has('wrap')) return IMG.wrap
      if (has('mix')) return IMG.mixTapas
      if (has('frite')) return IMG.frites
      return IMG.mixTapas

    // ── Cocktails créations (signatures sans photo dédiée) ───────────────────
    case 'Créations':
      return IMG.cocktailCreation

    // ── Cocktails classiques + mocktails ─────────────────────────────────────
    case 'Cocktails classiques':
    case 'Sans alcool': {
      if (has('mojito')) return IMG.mojito
      if (has('caipi')) return IMG.caipirinha
      if (has('daiquiri')) return IMG.daiquiri
      if (has('margarita')) return IMG.margarita
      if (has('cosmo')) return IMG.cosmopolitan
      if (has('mai tai', 'maitai') || (has('mai') && has('tai'))) return IMG.maiTai
      if (has('pina', 'colada')) return IMG.pinaColada
      if (has('long island')) return IMG.longIsland
      if (has('moscow')) return IMG.moscowMule
      if (has('negroni')) return IMG.negroni
      if (has('amaretto')) return IMG.amaretto
      if (has('whiskey sour', 'whisky sour')) return IMG.whiskeySour
      if (has('old fashioned')) return IMG.whisky
      if (has('aperol')) return IMG.aperol
      if (has('tequila sunrise')) return IMG.tequilaSunrise
      if (has('espresso', 'expresso')) return IMG.espressoMartini
      if (has('bailey')) return IMG.baileys
      if (has('campari')) return IMG.campari
      // pas de match précis : mocktail générique pour les sans-alcool, cocktail sinon
      return section === 'Sans alcool' ? IMG.mocktail : IMG.cocktail
    }

    // ── Spiritueux au verre ──────────────────────────────────────────────────
    case 'Au verre':
      if (has('ti punch', 'punch', 'rhum', 'planteur')) return IMG.rhum
      if (has('hennessy', 'cognac')) return IMG.cognac
      if (has('whisky', 'jb')) return IMG.whisky
      if (word('vodka')) return IMG.vodka
      if (has('happy hour', 'cocktail')) return IMG.cocktail
      // get, ricard, pastis, gin (mot entier), tequila, martini, campari…
      return IMG.glassSpirits

    // ── Softs & jus ──────────────────────────────────────────────────────────
    case 'Softs & Jus':
      if (has('coca')) return IMG.coca
      if (has('fanta exotique')) return IMG.fantaExotique
      if (has('fanta')) return IMG.fantaOrange
      if (has('sprite')) return IMG.sprite
      if (has('schweppes')) return IMG.schweppes
      if (has('orangina')) return IMG.orangina
      if (has('perrier')) return IMG.perrier
      if (has('eau')) return IMG.water
      if (has('red bull')) return IMG.redBull
      if (has('long horn')) return IMG.longHorn
      if (has('xl energy')) return IMG.xlEnergy
      if (has('fuze', 'green tea')) return IMG.fuzeTea
      if (has('ananas')) return IMG.jusAnanas
      if (has('goyave')) return IMG.jusGoyave
      if (has('mangue')) return IMG.jusMangue
      if (has('jus orange')) return IMG.jusOrange
      if (has('passion')) return IMG.jusPassion
      if (has('pomme')) return IMG.jusPomme
      if (has('minute maid')) return IMG.minuteMaid
      return IMG.softDrink   // Ginger Beer, Ordinaire, etc.

    // ── Bières (jamais une image de cocktail/spiritueux) ─────────────────────
    case 'Bières':
      if (has('corona')) return IMG.corona
      if (has('heineken')) return IMG.heineken
      return IMG.beer   // Carib, Gwada, tous les Desperados…

    case 'Champagnes':
      return IMG.champagneIce
    case 'Vins':
      return IMG.wine

    // ── Bouteilles (spiritueux) ──────────────────────────────────────────────
    case 'Bouteilles':
      if (has('jack daniel')) return IMG.jackDaniels
      if (has('whisky', 'lawson', 'j b', 'jb')) return IMG.whisky
      if (has('vodka', 'absolut', 'smirnoff', 'eristoff', 'divine', 'ciroc', 'belvedere')) return IMG.vodka
      if (has('cognac', 'hennessy', 'gauthier')) return IMG.cognac
      if (has('rhum', 'clement')) return IMG.rhum
      return IMG.spiritsBottle

    case 'Chicha':
      return IMG.chicha
    case 'Entrées':
      return IMG.entrance
  }
  return null
}
