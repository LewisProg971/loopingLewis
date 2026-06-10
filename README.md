# LoopingLewis - Modélisation de Base de Données (MCD/MLD/SQL)

LoopingLewis est une application de bureau de modélisation de bases de données, inspirée du logiciel Looping, mais entièrement moderne et multiplateforme (macOS, Windows, Linux).
Elle est construite avec **Tauri v2**, **React**, **TypeScript**, **Tailwind CSS**, et **React Flow**.

## Fonctionnalités

- **Modélisation Conceptuelle (MCD)** :
  - Création d'Entités avec leurs attributs (clés primaires, types : INT, VARCHAR, DATE, BOOLEAN...).
  - Création d'Associations avec cardinalités (0,1 / 1,1 / 0,n / 1,n).
  - Canvas interactif infini (zoom, drag & drop) propulsé par React Flow.
- **Génération MLD Automatique** :
  - Un panneau latéral affiche le Modèle Logique de Données (MLD) mis à jour en temps réel à partir de votre MCD.
  - Résolution des clés étrangères et tables de liaisons (many-to-many).
- **Génération et Export SQL** :
  - Exportez vos tables générées au format SQL via le dialogue natif de votre OS.
- **Rétro-conception (Reverse Engineering)** :
  - Importez un script SQL existant via un dialogue de fichier.
  - L'application recréera automatiquement les entités et associations (tables de liaisons) sur le Canvas.

## Prérequis

**IMPORTANT :** Si vous n'avez jamais utilisé Rust ou Tauri, veuillez suivre le [**GUIDE D'INSTALLATION DÉTAILLÉ (SETUP.md)**](./SETUP.md) avant de commencer.

1. **Node.js** (v18 ou supérieur) : [Télécharger Node.js](https://nodejs.org/)
2. **Rust** : Nécessaire pour Tauri.
   - Sur macOS / Linux : `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.net | sh`
   - Sur Windows : Téléchargez `rustup-init.exe` depuis [le site officiel](https://www.rust-lang.org/tools/install).
3. **Dépendances système (macOS)** : Les outils de compilation macOS (Xcode Command Line Tools). Lancez `xcode-select --install` dans votre terminal.

## Installation

Dans le dossier du projet, exécutez la commande suivante pour installer les dépendances Node :

```bash
npm install
```

## Développement

Pour lancer l'application en mode développement (avec rechargement à chaud) :

```bash
npm run tauri dev
```
La première fois, cela peut prendre un certain temps car Rust va compiler les dépendances natives de Tauri.

## Compilation (Build)

Pour générer l'exécutable final (un `.app` sur macOS, `.exe` sur Windows, ou `.deb`/`AppImage` sur Linux) :

```bash
npm run tauri build
```

Le résultat de la compilation se trouvera dans le dossier `src-tauri/target/release/bundle/`. 
Sur macOS, vous trouverez un fichier `tauri-app.app` (ou le nom défini) que vous pouvez glisser-déposer dans votre dossier `/Applications`.

## Comment utiliser l'application

1. **Ajouter des éléments** : Utilisez la barre d'outils en haut pour ajouter des "Entités" ou des "Associations".
2. **Connecter les éléments** : Sur le Canvas, glissez-déposez à partir des points bleus (handles) d'une Entité vers une Association pour créer un lien.
3. **Modifier les propriétés** : Cliquez sur une Entité, une Association ou un Lien. Le panneau de droite "Propriétés" vous permettra de modifier le nom, les attributs, ou les cardinalités.
4. **Visualiser le MLD** : Cliquez sur le bouton "MLD" dans la barre d'outils pour ouvrir le panneau latéral affichant les tables générées.
5. **Exporter / Importer** : Utilisez les boutons "Exporter SQL" ou "Importer SQL" pour interagir avec le système de fichiers natif.
