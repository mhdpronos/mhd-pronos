const storageKey = 'mhdAssistantConversations';

const defaultSuggestions = [
  { icon: '⚽️', text: 'Analyse PSG vs Marseille pour ce week-end' },
  { icon: '📊', text: 'Quelle stratégie de mise pour une bankroll de 200€ ?' },
  { icon: '🔥', text: 'Trouve un value bet en Ligue des Champions cette semaine' },
  { icon: '🧠', text: 'Comment garder la discipline après plusieurs pertes ?' },
  { icon: '🎯', text: 'Analyse précise pour un pari buteur en Premier League' },
  { icon: '🛡️', text: 'Quel pari prudent pour sécuriser mes gains ?' }
];

const teamDatabase = [
  {
    name: 'paris saint-germain',
    shortName: 'PSG',
    aliases: ['psg', 'paris', 'paris sg', 'paris saint germain'],
    league: 'Ligue 1',
    form: ['V', 'V', 'N', 'V', 'V'],
    attackRating: 92,
    defenseRating: 84,
    consistency: 8,
    avgGoalsFor: 2.6,
    avgGoalsAgainst: 1.0,
    strengths: ['pression haute constante', 'qualité individuelle dans les 30 derniers mètres'],
    weaknesses: ['relâchements défensifs sur les transitions rapides'],
    keyPlayers: ['Kylian Mbappé', 'Ousmane Dembélé', 'Vitinha'],
    injuries: ['Rotation défensive régulière (gestion de la fatigue)'],
  },
  {
    name: 'olympique de marseille',
    shortName: 'Marseille',
    aliases: ['om', 'marseille', 'olympique de marseille'],
    league: 'Ligue 1',
    form: ['V', 'N', 'V', 'D', 'V'],
    attackRating: 80,
    defenseRating: 78,
    consistency: 6,
    avgGoalsFor: 1.7,
    avgGoalsAgainst: 1.2,
    strengths: ['intensité sur les ailes', 'capacité à emballer les matchs au Vélodrome'],
    weaknesses: ['difficultés défensives sur coups de pied arrêtés'],
    keyPlayers: ['Pierre-Emerick Aubameyang', 'Jordan Veretout'],
    injuries: ['Charnière centrale parfois remaniée'],
  },
  {
    name: 'olympique lyonnais',
    shortName: 'Lyon',
    aliases: ['ol', 'lyon', 'olympique lyonnais'],
    league: 'Ligue 1',
    form: ['N', 'V', 'V', 'N', 'V'],
    attackRating: 78,
    defenseRating: 74,
    consistency: 5,
    avgGoalsFor: 1.5,
    avgGoalsAgainst: 1.3,
    strengths: ['transition rapide', 'jeunesse créative'],
    weaknesses: ['manque d’expérience dans la gestion des fins de match'],
    keyPlayers: ['Alexandre Lacazette', 'Rayan Cherki'],
    injuries: ['Latéral droit incertain'],
  },
  {
    name: 'real madrid',
    shortName: 'Real Madrid',
    aliases: ['real madrid', 'real', 'madrid'],
    league: 'Liga',
    form: ['V', 'V', 'V', 'N', 'V'],
    attackRating: 91,
    defenseRating: 88,
    consistency: 9,
    avgGoalsFor: 2.3,
    avgGoalsAgainst: 0.8,
    strengths: ['solidité défensive', 'capacité à gagner les gros matchs'],
    weaknesses: ['dépendance à Bellingham pour les projections'],
    keyPlayers: ['Jude Bellingham', 'Vinícius Jr', 'Federico Valverde'],
    injuries: ['Rotation au poste de latéral gauche'],
  },
  {
    name: 'fc barcelone',
    shortName: 'Barça',
    aliases: ['barca', 'fc barcelone', 'barça'],
    league: 'Liga',
    form: ['V', 'N', 'V', 'V', 'N'],
    attackRating: 86,
    defenseRating: 85,
    consistency: 7,
    avgGoalsFor: 1.9,
    avgGoalsAgainst: 0.9,
    strengths: ['maîtrise de la possession', 'jeunes performants sur les côtés'],
    weaknesses: ['difficultés sous pression intense'],
    keyPlayers: ['Robert Lewandowski', 'Pedri', 'Gavi'],
    injuries: ['Milieu parfois décimé'],
  },
  {
    name: 'manchester city',
    shortName: 'Man City',
    aliases: ['man city', 'manchester city', 'city'],
    league: 'Premier League',
    form: ['V', 'V', 'N', 'V', 'V'],
    attackRating: 94,
    defenseRating: 90,
    consistency: 9,
    avgGoalsFor: 2.5,
    avgGoalsAgainst: 0.9,
    strengths: ['maîtrise du ballon', 'variantes offensives nombreuses'],
    weaknesses: ['faible profondeur défensive en cas de blessure'],
    keyPlayers: ['Erling Haaland', 'Kevin De Bruyne', 'Phil Foden'],
    injuries: ['Milieu en gestion physique'],
  },
  {
    name: 'liverpool',
    shortName: 'Liverpool',
    aliases: ['liverpool', 'reds'],
    league: 'Premier League',
    form: ['V', 'V', 'D', 'V', 'V'],
    attackRating: 88,
    defenseRating: 82,
    consistency: 7,
    avgGoalsFor: 2.2,
    avgGoalsAgainst: 1.1,
    strengths: ['pression intense', 'profondeur offensive'],
    weaknesses: ['espaces laissés dans le dos de la défense'],
    keyPlayers: ['Mohamed Salah', 'Dominik Szoboszlai'],
    injuries: ['Latéraux parfois ménagés'],
  },
  {
    name: 'bayern munich',
    shortName: 'Bayern',
    aliases: ['bayern', 'bayern munich'],
    league: 'Bundesliga',
    form: ['V', 'V', 'V', 'D', 'V'],
    attackRating: 93,
    defenseRating: 83,
    consistency: 8,
    avgGoalsFor: 2.9,
    avgGoalsAgainst: 1.1,
    strengths: ['puissance offensive', 'qualité sur coups de pied arrêtés'],
    weaknesses: ['défense haute parfois prise dans le dos'],
    keyPlayers: ['Harry Kane', 'Jamal Musiala'],
    injuries: ['Rotation défensive constante'],
  },
  {
    name: 'borussia dortmund',
    shortName: 'Dortmund',
    aliases: ['dortmund', 'borussia dortmund', 'bvb'],
    league: 'Bundesliga',
    form: ['V', 'N', 'V', 'D', 'V'],
    attackRating: 82,
    defenseRating: 79,
    consistency: 6,
    avgGoalsFor: 1.8,
    avgGoalsAgainst: 1.2,
    strengths: ['jeu vertical', 'capacité à marquer en transition'],
    weaknesses: ['erreurs individuelles défensives'],
    keyPlayers: ['Julian Brandt', 'Donyell Malen'],
    injuries: ['Latéraux offensifs en reprise'],
  },
  {
    name: 'juventus',
    shortName: 'Juventus',
    aliases: ['juventus', 'juve'],
    league: 'Serie A',
    form: ['V', 'V', 'V', 'N', 'D'],
    attackRating: 82,
    defenseRating: 86,
    consistency: 7,
    avgGoalsFor: 1.4,
    avgGoalsAgainst: 0.7,
    strengths: ['assise défensive solide', 'efficacité sur coups de pied arrêtés'],
    weaknesses: ['manque de créativité dans le dernier tiers'],
    keyPlayers: ['Dusan Vlahovic', 'Federico Chiesa'],
    injuries: ['Milieux parfois absents'],
  },
  {
    name: 'inter milan',
    shortName: 'Inter',
    aliases: ['inter', 'inter milan'],
    league: 'Serie A',
    form: ['V', 'V', 'V', 'V', 'N'],
    attackRating: 89,
    defenseRating: 87,
    consistency: 9,
    avgGoalsFor: 2.2,
    avgGoalsAgainst: 0.8,
    strengths: ['bloc compact', 'transitions rapides'],
    weaknesses: ['dépendance au duo Martinez-Thuram'],
    keyPlayers: ['Lautaro Martínez', 'Nicolo Barella'],
    injuries: ['Rotation limitée sur les postes offensifs'],
  },
  {
    name: 'ac milan',
    shortName: 'AC Milan',
    aliases: ['ac milan', 'milan ac', 'milan'],
    league: 'Serie A',
    form: ['N', 'V', 'D', 'V', 'V'],
    attackRating: 83,
    defenseRating: 81,
    consistency: 6,
    avgGoalsFor: 1.7,
    avgGoalsAgainst: 1.1,
    strengths: ['ailes explosives', 'qualité de projection des milieux'],
    weaknesses: ['baisse de régime à l’heure de jeu'],
    keyPlayers: ['Rafael Leão', 'Theo Hernandez'],
    injuries: ['Gardien numéro 1 en reprise'],
  },
  {
    name: 'napoli',
    shortName: 'Napoli',
    aliases: ['naples', 'napoli'],
    league: 'Serie A',
    form: ['V', 'N', 'D', 'V', 'N'],
    attackRating: 85,
    defenseRating: 80,
    consistency: 6,
    avgGoalsFor: 2.0,
    avgGoalsAgainst: 1.1,
    strengths: ['pression offensive haute', 'jeu combiné dans l’axe'],
    weaknesses: ['manque de régularité à domicile cette saison'],
    keyPlayers: ['Victor Osimhen', 'Khvicha Kvaratskhelia'],
    injuries: ['Milieu défensif souvent ménagé'],
  }
];

const knowledgeModules = [
  {
    name: 'greetings',
    keywords: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou'],
    generate(message) {
      return `Bonjour ! Je suis mhd bot, assistant spécialisé dans les paris sportifs. Dis-moi ce que tu veux analyser : cote, bankroll, match précis… je te construis une réponse personnalisée.`;
    }
  },
  {
    name: 'identity',
    keywords: ['qui es tu', 'qui es-tu', 'présente', 'presentation', 'présentation'],
    generate() {
      return `Je suis mhd bot, une IA conçue pour analyser les matchs, estimer les probabilités, détecter les value bets et t’aider à gérer tes mises avec responsabilité. Plus ta question est précise, plus ma réponse sera pointue.`;
    }
  },
  {
    name: 'bankroll',
    keywords: ['bankroll', 'gestion', 'mise', 'money management', 'percentage', 'stake'],
    generate(message, context) {
      const base = `Pour sécuriser ta bankroll, répartis tes mises entre 1% et 3% de ton capital par pari : ${context.bankrollTip}.`;
      const streak = context.streak <= -2
        ? `Tu restes sur une série négative, diminue la taille de mise (0,5% à 1%) jusqu’à retrouver confiance.`
        : context.streak >= 2
          ? `Comme tu es sur une bonne dynamique, garde la même structure et note bien chaque pari pour confirmer ton edge.`
          : `Stabilise ton volume de mise sur les matchs où tu as un réel avantage chiffré.`;
      const diversification = `Diversifie entre paris simples à forte conviction et combinés limités à deux sélections maximum.`;
      return `${base}\n\n${streak}\n\n${diversification}\n\nNote tout dans un tableau : date, mise, cote, résultat et justification. Cela t’aidera à mesurer ton ROI et à couper rapidement si tu perds le fil.`;
    }
  },
  {
    name: 'responsible',
    keywords: ['addiction', 'responsable', 'perte', 'perdu', 'probleme', 'problème', 'risque'],
    generate() {
      return `Fais toujours passer la protection de ta bankroll avant le gain potentiel. Fixe-toi un plafond de pertes hebdomadaire, fais des pauses régulières et n’hésite pas à demander de l’aide si le jeu prend trop de place. Les ressources comme joueurs-info-service.fr peuvent t’accompagner en toute confidentialité.`;
    }
  },
  {
    name: 'combines',
    keywords: ['combiné', 'combine', 'multi', 'parlay'],
    generate() {
      return `Limite tes combinés à des tickets de deux matchs maximum, idéalement avec des cotes entre 1.35 et 1.65. Au-delà, tu fais exploser ton risque cumulatif. Utilise les combinés pour booster un ticket “safe”, jamais pour rattraper un retard. N’oublie pas de calculer la probabilité réelle de réussite : multiplie les chances de chaque sélection.`;
    }
  },
  {
    name: 'valuebet',
    keywords: ['value', 'valeur', 'valuebet', 'value bet'],
    generate() {
      return `Pour dénicher une value bet, estime ta propre probabilité (via statistiques, forme, absences) puis compare-la à la cote convertie en probabilité implicite. Si ton estimation est supérieure de 5 points ou plus, tu as un edge exploitable. Garde une marge de sécurité et mise avec discipline.`;
    }
  },
  {
    name: 'thanks',
    keywords: ['merci', 'thank', 'merci beaucoup'],
    generate() {
      return `Avec plaisir ! Quand tu veux approfondir un match ou une stratégie, je suis prêt à analyser avec toi.`;
    }
  }
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn('Impossible de charger les conversations', error);
    return [];
  }
}

function saveConversations(conversations) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  } catch (error) {
    console.warn('Impossible de sauvegarder les conversations', error);
  }
}

function createConversationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function createAssistantGreeting() {
  const now = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());
  return `Bonjour ! Il est ${now}, parfait pour analyser tes prochains paris. Donne-moi un match, une cote ou une problématique bankroll et je te prépare un plan d’action personnalisé.`;
}

function createConversation() {
  const id = createConversationId();
  const now = new Date().toISOString();
  return {
    id,
    title: 'Nouvelle discussion',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: `${id}-welcome`,
        role: 'assistant',
        content: createAssistantGreeting(),
        createdAt: now
      }
    ]
  };
}

function findTeamMatches(message) {
  const normalized = normalize(message);
  const found = [];
  for (const team of teamDatabase) {
    if (team.aliases.some((alias) => normalized.includes(alias))) {
      if (!found.includes(team)) {
        found.push(team);
      }
    }
  }
  return found;
}

function computeRatings(team) {
  const attack = team.attackRating || 70;
  const defense = team.defenseRating || 70;
  const consistency = (team.consistency || 5) * 5;
  return attack * 0.6 + defense * 0.3 + consistency * 0.1;
}

function buildProbability(teamA, teamB) {
  const ratingA = computeRatings(teamA);
  const ratingB = computeRatings(teamB);
  const diff = ratingA - ratingB;
  const logistic = (value) => 1 / (1 + Math.exp(-value));
  const scale = 0.12;
  const probA = logistic(diff * scale);
  const probB = 1 - logistic(diff * scale);
  const drawBase = 0.22 + (0.04 - Math.min(Math.abs(diff) / 200, 0.12));
  const adjustA = probA * (1 - drawBase);
  const adjustB = probB * (1 - drawBase);
  const total = adjustA + adjustB;
  const normalizedA = (adjustA / total) * (1 - drawBase);
  const normalizedB = (adjustB / total) * (1 - drawBase);
  return {
    home: Math.round(normalizedA * 100),
    draw: Math.round(drawBase * 100),
    away: Math.round(normalizedB * 100)
  };
}

function describeForm(team) {
  const winCount = team.form.filter((f) => f === 'V').length;
  const drawCount = team.form.filter((f) => f === 'N').length;
  const loseCount = team.form.filter((f) => f === 'D').length;
  return `${team.form.join('-')} (${winCount}V ${drawCount}N ${loseCount}D)`;
}

function craftRecommendation(teamA, teamB, message) {
  const normalized = normalize(message);
  const ratingA = computeRatings(teamA);
  const ratingB = computeRatings(teamB);
  const diff = ratingA - ratingB;
  const requestOver = /(over|plus de|+\s*2\.5|+\s*1\.5)/.test(normalized);
  const requestUnder = /(under|moins de|-\s*2\.5|-\s*1\.5)/.test(normalized);

  if (requestOver) {
    const avgGoals = (teamA.avgGoalsFor + teamB.avgGoalsFor) / 2;
    const risk = avgGoals >= 2 ? 'Les statistiques offensives des deux équipes soutiennent un over 2,5 buts.' : 'La moyenne de buts est moyenne, vise plutôt un over 1,5 buts pour sécuriser.';
    return {
      suggestion: avgGoals >= 2 ? 'Over 2,5 buts' : 'Over 1,5 buts',
      justification: risk
    };
  }

  if (requestUnder) {
    const avgGoalsAgainst = (teamA.avgGoalsAgainst + teamB.avgGoalsAgainst) / 2;
    const safe = avgGoalsAgainst <= 1 ? 'Les défenses sont solides, un under 2,5 buts se défend.' : 'Les défenses concèdent régulièrement, privilégie un under 3,5 pour garder de la marge.';
    return {
      suggestion: avgGoalsAgainst <= 1 ? 'Under 2,5 buts' : 'Under 3,5 buts',
      justification: safe
    };
  }

  if (Math.abs(diff) <= 5) {
    return {
      suggestion: 'Double chance + buteur prudent',
      justification: 'Écart serré : sécurise avec un 1X/12/2X couplé à un buteur en forme pour booster la cote sans trop de risque.'
    };
  }

  if (diff > 5) {
    return {
      suggestion: `${teamA.shortName} gagne avec couverture Draw No Bet`,
      justification: `${teamA.shortName} affiche un écart de puissance notable. Le DNB te protège du nul tout en gardant de la value.`
    };
  }

  return {
    suggestion: `${teamB.shortName} ou nul`,
    justification: `${teamB.shortName} a les armes pour surprendre, sécurise avec une double chance.`
  };
}

function generateMatchAnalysis(message, context) {
  const teams = findTeamMatches(message);
  if (teams.length < 2) {
    return null;
  }

  const [teamA, teamB] = teams.slice(0, 2);
  const probabilities = buildProbability(teamA, teamB);
  const recommendation = craftRecommendation(teamA, teamB, message);

  const riskAdvice = context.streak <= -2
    ? `Tu sors d’une série négative : mise à 0,75% de bankroll maximum et note tes raisons de pari.`
    : context.streak >= 2
      ? `Bonne dynamique récente, mais reste discipliné : garde ton stake habituel et refuse les paris émotionnels.`
      : `Stabilise tes mises entre 1% et 2% de bankroll et n’ouvre pas plus de deux tickets simultanés.`;

  const response = `Analyse ${teamA.shortName} vs ${teamB.shortName}

• ${teamA.shortName} — Forme ${describeForm(teamA)}, ${teamA.avgGoalsFor.toFixed(1)} buts marqués de moyenne, joueurs clés : ${teamA.keyPlayers.join(', ')}. ${teamA.strengths[0]}. Attention à ${teamA.weaknesses[0]}.
• ${teamB.shortName} — Forme ${describeForm(teamB)}, ${teamB.avgGoalsFor.toFixed(1)} buts marqués de moyenne, joueurs clés : ${teamB.keyPlayers.join(', ')}. ${teamB.strengths[0]}. Prudence sur ${teamB.weaknesses[0]}.

Probabilités estimées : ${teamA.shortName} ${probabilities.home}% | Nul ${probabilities.draw}% | ${teamB.shortName} ${probabilities.away}%.

Pronostic suggéré : ${recommendation.suggestion}. ${recommendation.justification}

Gestion du risque : ${riskAdvice}

Rappelle-toi de vérifier les compositions officielles 60 minutes avant le coup d’envoi et d’annuler si les cadres annoncés sont absents.`;

  return {
    score: 10,
    response
  };
}

function detectModuleResponse(message, context) {
  const normalized = normalize(message);
  for (const module of knowledgeModules) {
    if (module.keywords.some((keyword) => normalized.includes(keyword))) {
      return {
        score: 6,
        response: module.generate(message, context)
      };
    }
  }
  return null;
}

function analyseMessageIntent(message) {
  const normalized = normalize(message);
  const teams = findTeamMatches(message);
  const flags = {
    bankroll: /(bankroll|gestion|mise|stake|money management|capital|budget)/.test(normalized),
    value: /(cote|odds|value|valeur|probabilit)/.test(normalized),
    market: /(over|under|buteur|handicap|score exact|1x2|double chance|clean sheet|parlay|combo|combin)/.test(normalized),
    psychology: /(perte|tilt|mental|confiance|motivation|pause|addiction)/.test(normalized),
    strategy: /(strategie|strat\s|plan|conseil|astuce|analyse|pronostic)/.test(normalized)
  };

  let focus = 'general';
  if (flags.bankroll) {
    focus = 'bankroll';
  } else if (teams.length >= 2) {
    focus = 'match';
  } else if (flags.value) {
    focus = 'value';
  } else if (flags.market) {
    focus = 'market';
  } else if (flags.psychology) {
    focus = 'psychology';
  } else if (teams.length === 1) {
    focus = 'team';
  } else if (flags.strategy) {
    focus = 'strategy';
  }

  return { normalized, teams, flags, focus };
}

function buildIntentGuidelines(intent) {
  const { teams, focus } = intent;
  const formatTeamList = () => teams.map((team) => team.shortName).join(' vs ');

  switch (focus) {
    case 'bankroll':
      return {
        summary: 'Ta demande concerne la gestion de capital et la taille de mise.',
        steps: [
          'Calcule ton capital disponible, fixe un objectif réaliste et définis un stop-loss quotidien.',
          'Choisis une méthode de mise (flat, Kelly fractionné, mise proportionnelle) et teste-la sur papier avant application.',
          'Mets à jour un journal de bets : date, mise, cote, résultat et ressenti pour suivre ton ROI et ton état émotionnel.'
        ]
      };
    case 'value':
      return {
        summary: 'Tu veux déterminer si une cote offre de la valeur.',
        steps: [
          'Compile les données clés : forme récente, statistiques de buts/xG, absences, motivation des équipes.',
          'Convertis la cote en probabilité implicite (1/cote) et compare-la à ton estimation maison.',
          'Ne valide le pari que si ton edge est supérieur à 5 points et que la cote reste disponible au moment de miser.'
        ]
      };
    case 'market':
      return {
        summary: 'Ta question vise un marché précis (buteur, over/under, handicap…).',
        steps: [
          'Analyse les profils offensifs/défensifs : volumes de tirs, zones attaquées, rythme moyen des matchs.',
          'Vérifie les tendances statistiques du marché ciblé (buts marqués/encaissés, xG, séries récentes).',
          'Adapte le stake : 1% à 1,5% sur un pari plus risqué, monte à 2% seulement si les indicateurs convergent.'
        ]
      };
    case 'psychology':
      return {
        summary: 'Tu évoques la gestion mentale ou une série compliquée.',
        steps: [
          'Fais un état des lieux objectif : derniers résultats, émotions ressenties, moments de perte de contrôle.',
          'Planifie des pauses et impose-toi des limites de pertes avant de reprendre la prise de pari.',
          'Reviens avec une check-list fixe (analyse, cote cible, justification écrite) pour éviter les paris impulsifs.'
        ]
      };
    case 'team':
      return {
        summary: `Tu souhaites approfondir le profil de ${teams[0].shortName}.`,
        steps: [
          `Étudie ses cinq derniers matchs : dynamique ${teams[0].form.join('-')} et contexte (domicile/extérieur).`,
          'Identifie les forces/faiblesses récurrentes : circuits préférés, joueurs clés, zones fragiles.',
          'Déduis les marchés compatibles (1X2, buteur, over/under) et note la cote minimale acceptable.'
        ]
      };
    case 'match':
      return {
        summary: `Tu compares ${formatTeamList()} et tu veux trancher.`,
        steps: [
          `Compare la forme des deux équipes et les styles de jeu pour repérer les déséquilibres.`,
          'Confronte les statistiques (buts, xG, coups de pied arrêtés) et la disponibilité des cadres.',
          'Projette un scénario de match et prépare deux plans : pari principal et option de couverture si la cote bouge.'
        ]
      };
    case 'strategy':
      return {
        summary: 'Tu demandes une méthode générale pour améliorer tes pronostics.',
        steps: [
          'Segment tes paris par compétition/marché pour identifier les zones où tu as de l’avance.',
          'Crée une routine d’étude (veille statistique, revue des cotes, validation) avant chaque prise de pari.',
          'Évalue tes résultats chaque semaine et ajuste ta stratégie en te basant sur les données, pas sur l’intuition.'
        ]
      };
    default:
      return {
        summary: 'Le message est assez large : je te propose une méthode universelle pour clarifier ta prochaine décision.',
        steps: [
          'Pose le contexte exact : compétition, enjeu, marché visé et informations déjà collectées.',
          'Rassemble les métriques utiles (forme, statistiques avancées, absences, calendrier).',
          'Définis à l’avance la cote cible, la taille de mise et le plan de sortie en cas de pari perdant.'
        ]
      };
  }
}

function generateFallback(message, context) {
  const intent = analyseMessageIntent(message);
  const guidelines = buildIntentGuidelines(intent);
  const sanitizedQuestion = message.replace(/\s+/g, ' ').trim();
  const questionPreview = sanitizedQuestion.length > 140
    ? `${sanitizedQuestion.slice(0, 137)}…`
    : sanitizedQuestion;
  const riskAdvice = context.streak <= -2
    ? 'Série négative détectée : limite tes mises à 0,5%-0,75% et fais une pause dès que l’analyse devient floue.'
    : context.streak >= 2
      ? 'Bonne dynamique : reste discipliné et évite d’augmenter tes mises par excès de confiance.'
      : 'Garde un stake fixe entre 1% et 2% de bankroll et consigne chaque pari pour suivre ton edge.';
  const bankrollRoutine = context.bankrollTip
    ? `${context.bankrollTip.charAt(0).toUpperCase()}${context.bankrollTip.slice(1)}`
    : '';

  const steps = guidelines.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n');

  const parts = [
    `Question détectée : « ${questionPreview || 'demande non précisée'} ».`,
    guidelines.summary,
    '',
    'Plan d’action recommandé :',
    steps,
    '',
    `Gestion du risque : ${riskAdvice}`
  ];

  if (bankrollRoutine) {
    parts.push('', `Routine bankroll à garder en tête : ${bankrollRoutine}.`);
  }

  parts.push('', 'Besoin d’un angle plus précis (cote, marché, joueur) ? Ajoute-le et je pourrai affiner encore.');

  return parts.join('\n');
}

function summariseConversation(conversation) {
  const firstUserMessage = conversation.messages.find((msg) => msg.role === 'user');
  if (!firstUserMessage) {
    return 'Nouvelle discussion';
  }
  const trimmed = firstUserMessage.content.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed;
}

function formatTimestamp(isoDate) {
  if (!isoDate) {
    return '';
  }
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  });
  return formatter.format(new Date(isoDate));
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
}

function createMessageElement(message) {
  const wrapper = document.createElement('div');
  wrapper.className = `assistant-message assistant-message--${message.role}`;

  const bubble = document.createElement('div');
  bubble.className = 'assistant-message__bubble';
  bubble.textContent = message.content;
  wrapper.appendChild(bubble);

  const time = document.createElement('span');
  time.className = 'assistant-message__time';
  time.textContent = formatTimestamp(message.createdAt);
  wrapper.appendChild(time);

  return wrapper;
}

function renderSuggestions(container, onSelect) {
  container.innerHTML = '';
  const template = document.getElementById('suggestion-template');
  if (!template) {
    return;
  }
  const clone = template.content.cloneNode(true);
  const chipsContainer = clone.querySelector('.assistant-suggestions__chips');
  defaultSuggestions.forEach((suggestion) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'assistant-suggestions__chip';
    chip.textContent = `${suggestion.icon} ${suggestion.text}`;
    chip.addEventListener('click', () => onSelect(suggestion.text));
    chipsContainer.appendChild(chip);
  });
  container.appendChild(clone);
  container.setAttribute('data-visible', 'true');
}

(function bootstrap() {
  const conversationList = document.getElementById('conversationList');
  const newConversationBtn = document.getElementById('newConversation');
  const messagesContainer = document.getElementById('conversationMessages');
  const suggestionsContainer = document.getElementById('assistantSuggestions');
  const form = document.getElementById('assistantForm');
  const textarea = document.getElementById('assistantInput');

  if (!conversationList || !newConversationBtn || !messagesContainer || !form || !textarea) {
    return;
  }

  let conversations = loadConversations();
  if (!Array.isArray(conversations) || conversations.length === 0) {
    const conversation = createConversation();
    conversations = [conversation];
    saveConversations(conversations);
  }

  let activeConversationId = conversations[0].id;

  function getActiveConversation() {
    return conversations.find((conversation) => conversation.id === activeConversationId);
  }

  function updateSidebar() {
    conversationList.innerHTML = '';
    conversations
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .forEach((conversation) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'assistant-conversation-item';
        item.setAttribute('role', 'listitem');
        if (conversation.id === activeConversationId) {
          item.setAttribute('aria-current', 'true');
        }
        const title = document.createElement('p');
        title.className = 'assistant-conversation-item__title';
        title.textContent = summariseConversation(conversation);
        const meta = document.createElement('p');
        meta.className = 'assistant-conversation-item__meta';
        meta.textContent = `Mis à jour ${formatTimestamp(conversation.updatedAt)}`;
        item.appendChild(title);
        item.appendChild(meta);
        item.addEventListener('click', () => {
          activeConversationId = conversation.id;
          updateSidebar();
          renderActiveConversation();
        });
        conversationList.appendChild(item);
      });
  }

  function renderActiveConversation() {
    const conversation = getActiveConversation();
    if (!conversation) {
      return;
    }
    messagesContainer.innerHTML = '';
    conversation.messages.forEach((message) => {
      messagesContainer.appendChild(createMessageElement(message));
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const hasUserMessage = conversation.messages.some((msg) => msg.role === 'user');
    if (!hasUserMessage) {
      renderSuggestions(suggestionsContainer, (text) => {
        textarea.value = text;
        autoResizeTextarea(textarea);
        textarea.focus();
      });
    } else {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.removeAttribute('data-visible');
    }
  }

  function persist() {
    saveConversations(conversations);
    updateSidebar();
  }

  function appendMessage(role, content, metadata = {}) {
    const conversation = getActiveConversation();
    if (!conversation) {
      return;
    }
    const message = {
      id: createConversationId(),
      role,
      content,
      metadata,
      createdAt: new Date().toISOString()
    };
    conversation.messages.push(message);
    conversation.updatedAt = message.createdAt;
    if (role === 'user' && conversation.title === 'Nouvelle discussion') {
      conversation.title = summariseConversation(conversation);
    }
    messagesContainer.appendChild(createMessageElement(message));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    persist();
    return message;
  }

  function computeConversationContext() {
    const conversation = getActiveConversation();
    const messages = conversation ? conversation.messages : [];
    const userMessages = messages.filter((msg) => msg.role === 'user');
    let streak = 0;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (msg.role !== 'user') {
        continue;
      }
      const content = normalize(msg.content);
      if (/gagne|gagné|win|profit|✅/.test(content)) {
        streak = streak >= 0 ? streak + 1 : 1;
      } else if (/perdu|perte|lose|defaite|défaite|❌/.test(content)) {
        streak = streak <= 0 ? streak - 1 : -1;
      } else {
        break;
      }
      if (Math.abs(streak) >= 3) {
        break;
      }
    }
    const bankrollTipPool = [
      'miser fixe (flat betting) pour lisser la variance',
      'combiner Kelly fractionné (20% du Kelly théorique) et mise fixe',
      'séparer ton capital en 3 tiers : pari simple, prise de risque, réserve'
    ];
    const bankrollTip = bankrollTipPool[(userMessages.length + streak + 5) % bankrollTipPool.length];
    return {
      streak,
      bankrollTip,
      messages
    };
  }

  function generateResponse(message) {
    const context = computeConversationContext();

    const match = generateMatchAnalysis(message, context);
    if (match) {
      const metadata = { streak: context.streak };
      appendMessage('assistant', match.response, metadata);
      return;
    }

    const moduleResponse = detectModuleResponse(message, context);
    if (moduleResponse) {
      const metadata = { streak: context.streak };
      appendMessage('assistant', moduleResponse.response, metadata);
      return;
    }

    const fallback = generateFallback(message, context);
    const metadata = { streak: context.streak };
    appendMessage('assistant', fallback, metadata);
  }

  textarea.addEventListener('input', () => autoResizeTextarea(textarea));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = textarea.value.trim();
    if (!value) {
      return;
    }
    textarea.value = '';
    autoResizeTextarea(textarea);
    appendMessage('user', value);

    const typingMessage = appendMessage('assistant', 'Analyse en cours…', { transient: true });

    setTimeout(() => {
      const conversation = getActiveConversation();
      if (!conversation) {
        return;
      }
      const index = conversation.messages.findIndex((msg) => msg.id === typingMessage.id);
      if (index !== -1) {
        conversation.messages.splice(index, 1);
        persist();
        renderActiveConversation();
      }
      generateResponse(value);
    }, 500 + Math.random() * 800);
  });

  newConversationBtn.addEventListener('click', () => {
    const newConversation = createConversation();
    conversations.unshift(newConversation);
    activeConversationId = newConversation.id;
    persist();
    renderActiveConversation();
    textarea.focus();
  });

  updateSidebar();
  renderActiveConversation();
})();
