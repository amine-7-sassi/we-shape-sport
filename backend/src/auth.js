const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secret-de-dev-wss';

const creerToken = (u) => jwt.sign({ id: u.id, role: u.role, nom: u.nom }, SECRET, { expiresIn: '8h' });

// Lit le jeton s'il existe (routes publiques qui s'adaptent à l'utilisateur)
function lireToken(req, _res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try { req.user = jwt.verify(h.slice(7), SECRET); } catch { /* jeton invalide : ignoré */ }
  }
  next();
}
const exigerConnexion = (req, res, next) =>
  req.user ? next() : res.status(401).json({ message: 'Connexion requise.' });
const exigerAdmin = (req, res, next) =>
  req.user && req.user.role === 'administrateur' ? next() : res.status(403).json({ message: 'Accès réservé à l\'administrateur.' });

module.exports = { creerToken, lireToken, exigerConnexion, exigerAdmin };
