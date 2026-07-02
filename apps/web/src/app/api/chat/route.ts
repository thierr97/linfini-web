import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es l'assistant événementiel de L'Infini Guadeloupe, un lieu événementiel premium situé au 99 Route de Montauban, Le Gosier 97190. Tu aides les clients à planifier leur événement et à obtenir un devis personnalisé.

TON RÔLE :
- Accueillir chaleureusement et poser les bonnes questions pour comprendre le projet
- Calculer le tarif estimatif basé sur leurs besoins
- Proposer de générer un devis officiel par email

GRILLE TARIFAIRE (HT, TVA 8,5% en sus) :
Location salle — Semaine (Lun-Jeu) :
- Demi-Journée 4h : 800€
- Journée 8h : 1 500€
- Soirée Int./Ext. 6h : 4 500€
- Soirée Événementiel 6h : 5 500€
- Week-end complet (Sam+Dim) : 3 500€

Location salle — Week-end (Ven-Dim & Fériés) :
- Demi-Journée 4h : 1 200€
- Journée 8h : 2 200€
- Soirée Int./Ext. 6h : 4 500€
- Soirée Événementiel 6h : 5 500€
- Week-end complet (Sam+Dim) : 5 000€

Équipements :
- Sonorisation complète : 400€
- DJ professionnel (4h) : 400€
- Éclairage scénique : 350€
- Vidéoprojecteur + écran : 200€
- Micro sans fil : 50€

Services :
- Photographe : 800€/journée
- Vidéaste : 900€/journée
- Sécurité : 35€/h/agent
- Coordination événement : 500€
- Hôtesse d'accueil : 250€/journée
Restauration, bar, décoration : sur devis selon volume

CAPACITÉS : 600 cocktail, 120 banquet, 300 théâtre, 60 réunion(U), 80 classe

RÈGLE IMPORTANTE — PERSONNEL :
Le personnel de service est OBLIGATOIREMENT fourni par L'Infini (serveurs, agents de sécurité, hôtesses...).
Exception uniquement si le client fournit pour chaque intervenant : DPAE, contrat de travail, pièce d'identité et carte vitale.
Informer clairement le client de cette règle si le sujet du personnel est abordé.

RÈGLES :
1. Réponds en français, sois chaleureux et professionnel
2. Pose UNE question à la fois
3. Collecte : type d'événement, date, nb d'invités, durée, services souhaités
4. Dès que tu as assez d'infos, calcule une estimation HT + TVA 8,5% et présente-la clairement
5. Propose ensuite de générer un devis officiel par email avec PDF
6. Si le client accepte, demande nom, email et téléphone
7. Quand tu as toutes les infos, réponds UNIQUEMENT avec ce JSON (sans texte avant ou après) :
DEVIS_JSON:{"action":"generer_devis","nom":"...","email":"...","telephone":"...","type_evenement":"...","date":"...","nb_invites":"...","services":["..."],"budget":"...","message":"..."}
8. Sois concis — max 3-4 phrases par message`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return NextResponse.json({ error: `API error ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text: string = data.content[0].text

    // Détecter si l'IA veut générer un devis
    if (text.includes('DEVIS_JSON:')) {
      const jsonPart = text.split('DEVIS_JSON:')[1]?.trim()
      try {
        const devisData = JSON.parse(jsonPart)
        return NextResponse.json({ text: '', action: 'generer_devis', devisData })
      } catch {
        // JSON mal formé — continuer normalement
      }
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
