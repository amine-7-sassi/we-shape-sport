// ===== Contenu éditorial du site : TOUT ce qui est à personnaliser est dans ce fichier =====

// Coordonnées de la salle (utilisées dans le pied de page et la page Contact)
export const INFOS = {
  adresse: 'École Supérieure des Communications de Tunis (SUP\'COM), Cité Technologique des Communications, Route de Raoued Km 3,5, 2083 Ariana',
  telephone: '+216 70 000 000',
  email: 'contact@weshapesport.tn',
  // Position exacte sur la carte (lien Google Maps de SUP'COM)
  latitude: 36.8918623,
  longitude: 10.1877739,
  lienMaps: 'https://maps.app.goo.gl/FfFhG6a49mjmNv9n6',
};

// Photos : déposer les fichiers dans frontend/public/photos/ (voir le README.txt de ce dossier).
// Pour chaque sport, la photo s'appelle <classe>.jpg ; sinon un fond dégradé s'affiche.
export const SPORTS = [
  { nom: 'Boxe', classe: 'boxe', description: 'Technique, cardio et dépassement de soi : cours collectifs encadrés pour tous les niveaux.' },
  { nom: 'Musculation', classe: 'musculation', description: 'Développez votre force avec des cours guidés et un espace équipé de machines et de charges libres.' },
  { nom: 'Gymnastique', classe: 'gymnastique', description: 'Souplesse, équilibre et gainage pour un corps plus mobile et plus solide.' },
  { nom: 'Cross training', classe: 'cross-training', description: 'Circuits intenses mêlant force et endurance, en petit groupe.' },
  { nom: 'Yoga', classe: 'yoga', description: 'Postures et respiration pour récupérer et se recentrer.' },
  { nom: 'Fitness cardio', classe: 'fitness-cardio', description: 'Séances rythmées pour améliorer votre endurance et brûler des calories.' },
];

export const OFFRES = [
  { nom: 'Mensuel', prix: 60, detail: 'Accès illimité aux cours pendant 1 mois.', etudiante: false },
  { nom: 'Trimestriel', prix: 160, detail: 'Accès illimité pendant 3 mois.', etudiante: false },
  { nom: 'Annuel', prix: 550, detail: 'Accès illimité pendant 12 mois.', etudiante: false },
  { nom: 'Offre étudiante', prix: 45, detail: 'Tarif mensuel réduit sur présentation de la carte d\'étudiant.', etudiante: true },
];

export const HORAIRES = [
  { jour: 'Lundi', horaire: '06:00 – 22:00' },
  { jour: 'Mardi', horaire: '06:00 – 22:00' },
  { jour: 'Mercredi', horaire: '06:00 – 22:00' },
  { jour: 'Jeudi', horaire: '06:00 – 22:00' },
  { jour: 'Vendredi', horaire: '06:00 – 22:00' },
  { jour: 'Samedi', horaire: '08:00 – 20:00' },
  { jour: 'Dimanche', horaire: '09:00 – 14:00' },
];

/** Regroupe les jours consécutifs ayant les mêmes horaires : « Lun – Ven : 06:00 – 22:00 ». */
export function resumeHoraires(): string[] {
  const groupes: { debut: string; fin: string; horaire: string }[] = [];
  for (const h of HORAIRES) {
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.horaire === h.horaire) dernier.fin = h.jour;
    else groupes.push({ debut: h.jour, fin: h.jour, horaire: h.horaire });
  }
  return groupes.map(g => (g.debut === g.fin ? g.debut.slice(0, 3) : `${g.debut.slice(0, 3)} – ${g.fin.slice(0, 3)}`) + ` : ${g.horaire}`);
}
