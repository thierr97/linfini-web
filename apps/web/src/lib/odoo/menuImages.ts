// Image curée par produit, choisie par nom (les images d'Odoo sont réutilisées
// et parfois fausses ; ce mapping garantit une image distincte et appétissante).
// Retourne un chemin /menu/*.png|jpg local, ou null si aucun match.

const IMG: Record<string, string> = {
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
  margarita: '/menu/margarita-cut.png',
  cosmopolitan: '/menu/cosmopolitan-cut.png',
  maiTai: '/menu/mai-tai.jpg',
  pinaColada: '/menu/pina-colada-cut.png',
  longIsland: '/menu/long-island-cut.png',
  moscowMule: '/menu/moscow-mule.jpg',
  negroni: '/menu/negroni.jpg',
  amaretto: '/menu/amaretto.jpg',
  whiskeySour: '/menu/whiskey-sour.jpg',
  whisky: '/menu/whisky-cut.png',
  aperol: '/menu/aperol-cut.png',
  tequilaSunrise: '/menu/tequila-sunrise.jpg',
  espressoMartini: '/menu/espresso-martini.jpg',
  baileys: '/menu/baileys.jpg',
  campari: '/menu/campari.jpg',
  mocktail: '/menu/mocktail-cut.png',
  cocktailCreation: '/menu/cocktail-creation-cut.png',
  cocktail: '/menu/cocktail-cut.png',
  rhum: '/menu/rhum-cut.png',
  vodka: '/menu/vodka-cut.png',
  cognac: '/menu/cognac-cut.png',
  glassSpirits: '/menu/glass-spirits-cut.png',
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
  wine: '/menu/wine-cut.png',
  jackDaniels: '/menu/jack-daniels-cut.png',
  chicha: '/menu/chicha-cut.png',
  entrance: '/menu/entrance-cut.png',
}

function norm(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
}

/** Image curée pour un produit, par nom + section. null si aucun match. */
export function curatedImage(name: string, section: string): string | null {
  const n = norm(name)
  const has = (...k: string[]) => k.some(w => n.includes(w))

  // ── Plats / tapas ──
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
  if (has('mix tapas')) return IMG.mixTapas
  if (has('frite')) return IMG.frites

  // ── Cocktails ──
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

  // ── Sections cocktails sans match précis ──
  if (section === 'Sans alcool') return IMG.mocktail
  if (section === 'Créations') return IMG.cocktailCreation
  if (has('happy hour', 'cocktail')) return IMG.cocktail

  // ── Au verre (spiritueux) ──
  if (has('ti punch', 'rhum', 'planteur', 'clement')) return IMG.rhum
  if (has('whisky', 'jack daniel', 'william lawson', 'j b', ' jb')) return has('jack daniel') ? IMG.jackDaniels : IMG.whisky
  if (has('vodka', 'absolut', 'smirnoff', 'eristoff', 'divine', 'ciroc', 'belvedere')) return IMG.vodka
  if (has('hennessy', 'cognac', 'gauthier')) return IMG.cognac
  if (has('get', 'ricard', 'pastis', 'gin', 'tequila', 'martini')) return IMG.glassSpirits

  // ── Softs & jus ──
  if (has('coca', 'ordinaire')) return IMG.coca
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
  if (has('fuze', 'green tea', 'ginger')) return IMG.fuzeTea
  if (has('jus ananas', 'ananas')) return IMG.jusAnanas
  if (has('jus goyave', 'goyave')) return IMG.jusGoyave
  if (has('jus mangue', 'mangue')) return IMG.jusMangue
  if (has('jus orange')) return IMG.jusOrange
  if (has('jus passion', 'passion')) return IMG.jusPassion
  if (has('jus pomme', 'pomme')) return IMG.jusPomme
  if (has('minute maid')) return IMG.minuteMaid

  // ── Bières ──
  if (has('corona', 'coronita')) return IMG.corona
  if (has('heineken')) return IMG.heineken
  if (has('carib', 'gwada', 'desperados')) return IMG.beer

  // ── Champagnes / vins ──
  if (section === 'Champagnes' || has('champagne', 'moet', 'ruinart', 'perignon', 'veuve', 'deutz', 'mercier', 'chandon', 'feuillatte', 'coupe')) return IMG.champagneIce
  if (section === 'Vins' || has('vin', 'rose', 'minuty', 'belrose')) return IMG.wine

  // ── Chicha / entrées ──
  if (section === 'Chicha' || has('chicha', 'recharge')) return IMG.chicha
  if (section === 'Entrées' || has('entree', 'conso', 'consommation')) return IMG.entrance

  return null
}
