const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // SQLite intégré à Node.js (rien à compiler)
const bcrypt = require('bcryptjs');

const db = new DatabaseSync(path.join(__dirname, '..', 'wss.db'));
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'));

// Données de départ (uniquement si la base est vide)
if (db.prepare('SELECT COUNT(*) AS n FROM utilisateur').get().n === 0) {
  const ajoutUser = db.prepare('INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)');
  ajoutUser.run('Administrateur', 'admin@wss.tn', bcrypt.hashSync('admin123', 10), 'administrateur');
  ajoutUser.run('Membre Démo', 'membre@wss.tn', bcrypt.hashSync('membre123', 10), 'membre');

  const ajoutCours = db.prepare('INSERT INTO cours (sport, jour, heure_debut, heure_fin, nb_places) VALUES (?, ?, ?, ?, ?)');
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const modeles = [
    ['Gymnastique', '07:00', '08:00', 12],
    ['Musculation', '12:30', '13:30', 15],
    ['Boxe', '17:30', '18:30', 10],
    ['Gymnastique', '18:30', '19:30', 12],
    ['Boxe', '19:30', '20:30', 15],
  ];
  jours.forEach((j, i) => {
    // on décale un peu les modèles selon le jour pour varier le planning
    modeles.forEach((m, k) => { if ((i + k) % 2 === 0 || k === 2) ajoutCours.run(m[0], j, m[1], m[2], m[3]); });
  });
}

module.exports = db;
