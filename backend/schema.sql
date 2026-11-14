-- Schéma de la base We Shape Sport (voir modèle de données, Objectif 2)
CREATE TABLE IF NOT EXISTS utilisateur (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('membre', 'administrateur'))
);

CREATE TABLE IF NOT EXISTS cours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sport TEXT NOT NULL,
  jour TEXT NOT NULL CHECK (jour IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')),
  heure_debut TEXT NOT NULL,
  heure_fin TEXT NOT NULL,
  nb_places INTEGER NOT NULL CHECK (nb_places > 0)
);

CREATE TABLE IF NOT EXISTS reservation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  id_cours INTEGER NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
  date_reservation TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (id_utilisateur, id_cours)
);
