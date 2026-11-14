const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { creerToken, lireToken, exigerConnexion, exigerAdmin } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(lireToken);

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const emailValide = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Places restantes = nb_places - nombre de réservations ; "reserve" = le membre connecté a déjà réservé
const SQL_COURS = `
  SELECT c.id, c.sport, c.jour, c.heure_debut AS heureDebut, c.heure_fin AS heureFin,
         c.nb_places AS nbPlaces,
         (SELECT COUNT(*) FROM reservation r WHERE r.id_cours = c.id) AS reservees,
         EXISTS (SELECT 1 FROM reservation r WHERE r.id_cours = c.id AND r.id_utilisateur = ?) AS reserve
  FROM cours c`;
const ORDRE = `ORDER BY CASE c.jour ${JOURS.map((j, i) => `WHEN '${j}' THEN ${i}`).join(' ')} END, c.heure_debut`;

function formaterCours(c) {
  return { ...c, placesRestantes: c.nbPlaces - c.reservees, reserve: !!c.reserve };
}

// ---------- Authentification ----------
app.post('/api/auth/inscription', (req, res) => {
  const { nom, email, motDePasse } = req.body || {};
  if (!nom || !nom.trim()) return res.status(400).json({ message: 'Le nom est obligatoire.' });
  if (!emailValide(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
  if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  if (db.prepare('SELECT 1 FROM utilisateur WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ message: 'Un compte existe déjà avec cet e-mail.' });
  const info = db.prepare('INSERT INTO utilisateur (nom, email, mot_de_passe) VALUES (?, ?, ?)')
    .run(nom.trim(), email.toLowerCase(), bcrypt.hashSync(motDePasse, 10));
  const u = { id: info.lastInsertRowid, nom: nom.trim(), role: 'membre' };
  res.status(201).json({ token: creerToken(u), utilisateur: u });
});

app.post('/api/auth/connexion', (req, res) => {
  const { email, motDePasse } = req.body || {};
  const u = emailValide(email) && db.prepare('SELECT * FROM utilisateur WHERE email = ?').get(email.toLowerCase());
  if (!u || !bcrypt.compareSync(motDePasse || '', u.mot_de_passe))
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' });
  const pub = { id: u.id, nom: u.nom, role: u.role };
  res.json({ token: creerToken(pub), utilisateur: pub });
});

// ---------- Cours (public) ----------
app.get('/api/cours', (req, res) => {
  const { jour } = req.query;
  const uid = req.user ? req.user.id : 0;
  const lignes = jour
    ? db.prepare(`${SQL_COURS} WHERE c.jour = ? ${ORDRE}`).all(uid, jour)
    : db.prepare(`${SQL_COURS} ${ORDRE}`).all(uid);
  res.json(lignes.map(formaterCours));
});

// ---------- Réservations (membre) ----------
app.post('/api/cours/:id/reserver', exigerConnexion, (req, res) => {
  const idCours = Number(req.params.id);
  // Transaction : on vérifie puis on insère sans qu'une autre requête puisse s'intercaler
  const reserver = () => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const c = db.prepare(`${SQL_COURS} WHERE c.id = ?`).get(req.user.id, idCours);
      let res;
      if (!c) res = { code: 404, message: 'Cours introuvable.' };
      else if (c.reserve) res = { code: 409, message: 'Vous avez déjà réservé ce cours.' };
      else if (c.reservees >= c.nbPlaces) res = { code: 409, message: 'Ce cours est complet.' };
      else {
        db.prepare('INSERT INTO reservation (id_utilisateur, id_cours) VALUES (?, ?)').run(req.user.id, idCours);
        res = { code: 201, message: 'Réservation confirmée.' };
      }
      db.exec('COMMIT');
      return res;
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  };
  const r = reserver();
  res.status(r.code).json({ message: r.message });
});

app.get('/api/mes-reservations', exigerConnexion, (req, res) => {
  const lignes = db.prepare(`
    SELECT r.id, c.id AS idCours, c.sport, c.jour, c.heure_debut AS heureDebut, c.heure_fin AS heureFin, r.date_reservation AS dateReservation
    FROM reservation r JOIN cours c ON c.id = r.id_cours
    WHERE r.id_utilisateur = ?
    ORDER BY CASE c.jour ${JOURS.map((j, i) => `WHEN '${j}' THEN ${i}`).join(' ')} END, c.heure_debut`).all(req.user.id);
  res.json(lignes);
});

app.delete('/api/reservations/:id', exigerConnexion, (req, res) => {
  const info = db.prepare('DELETE FROM reservation WHERE id = ? AND id_utilisateur = ?').run(Number(req.params.id), req.user.id);
  if (!info.changes) return res.status(404).json({ message: 'Réservation introuvable.' });
  res.json({ message: 'Réservation annulée.' });
});

// ---------- Administration ----------
function validerCours(b) {
  if (!b.sport || !b.sport.trim()) return 'Le sport est obligatoire.';
  if (!JOURS.includes(b.jour)) return 'Jour invalide.';
  const h = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!h.test(b.heureDebut || '') || !h.test(b.heureFin || '')) return 'Horaire invalide (format hh:mm).';
  if (b.heureFin <= b.heureDebut) return 'L\'heure de fin doit suivre l\'heure de début.';
  if (!Number.isInteger(Number(b.nbPlaces)) || Number(b.nbPlaces) < 1) return 'Le nombre de places doit être un entier positif.';
  return null;
}

app.post('/api/admin/cours', exigerAdmin, (req, res) => {
  const err = validerCours(req.body || {});
  if (err) return res.status(400).json({ message: err });
  const b = req.body;
  const info = db.prepare('INSERT INTO cours (sport, jour, heure_debut, heure_fin, nb_places) VALUES (?, ?, ?, ?, ?)')
    .run(b.sport.trim(), b.jour, b.heureDebut, b.heureFin, Number(b.nbPlaces));
  res.status(201).json({ id: info.lastInsertRowid, message: 'Cours ajouté.' });
});

app.put('/api/admin/cours/:id', exigerAdmin, (req, res) => {
  const err = validerCours(req.body || {});
  if (err) return res.status(400).json({ message: err });
  const b = req.body;
  const reservees = db.prepare('SELECT COUNT(*) AS n FROM reservation WHERE id_cours = ?').get(Number(req.params.id)).n;
  if (Number(b.nbPlaces) < reservees)
    return res.status(409).json({ message: `Impossible : ${reservees} places sont déjà réservées.` });
  const info = db.prepare('UPDATE cours SET sport=?, jour=?, heure_debut=?, heure_fin=?, nb_places=? WHERE id=?')
    .run(b.sport.trim(), b.jour, b.heureDebut, b.heureFin, Number(b.nbPlaces), Number(req.params.id));
  if (!info.changes) return res.status(404).json({ message: 'Cours introuvable.' });
  res.json({ message: 'Cours modifié.' });
});

app.delete('/api/admin/cours/:id', exigerAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM cours WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ message: 'Cours introuvable.' });
  res.json({ message: 'Cours supprimé.' });
});

app.get('/api/admin/cours/:id/reservations', exigerAdmin, (req, res) => {
  const lignes = db.prepare(`
    SELECT u.nom, u.email, r.date_reservation AS dateReservation
    FROM reservation r JOIN utilisateur u ON u.id = r.id_utilisateur
    WHERE r.id_cours = ? ORDER BY r.date_reservation`).all(Number(req.params.id));
  res.json(lignes);
});

// ---------- Contact ----------
app.post('/api/contact', (req, res) => {
  const { nom, email, message } = req.body || {};
  if (!nom || !nom.trim() || !message || !message.trim()) return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  if (!emailValide(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
  console.log(`[Contact] ${nom} <${email}> : ${message}`);
  res.status(201).json({ message: 'Message envoyé. Merci !' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`API We Shape Sport sur http://localhost:${PORT}`));
module.exports = app;
