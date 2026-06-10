# Guide d'Installation et Configuration (Setup)

Ce document détaille les étapes nécessaires pour préparer votre environnement de développement afin de lancer **LoopingLewis**.

## 1. Installation de Rust (Obligatoire)

Tauri utilise le langage Rust pour son moteur natif. Vous devez l'installer sur votre machine.

### Windows
1. Téléchargez `rustup-init.exe` sur [rustup.rs](https://rustup.rs/).
2. Lancez l'exécutable et choisissez l'option **1 (Install default)**.
3. **IMPORTANT** : Après l'installation, fermez tous vos terminaux ouverts (PowerShell, CMD, VS Code) et réouvrez-les pour que la commande `cargo` soit reconnue.

### macOS / Linux
Lancez la commande suivante dans votre terminal :
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.net | sh
```

## 2. Outils de compilation C++ (Windows uniquement)

Rust nécessite les outils de build de Microsoft pour compiler les composants système.

1. Téléchargez les **Outils de génération Visual Studio** (Build Tools) : [Télécharger ici](https://visualstudio.microsoft.com/fr/visual-cpp-build-tools/).
2. Lors de l'installation, sélectionnez la charge de travail : **"Développement Desktop en C++"**.
3. Redémarrez votre ordinateur après l'installation si demandé.

## 3. Installation des dépendances Node.js

Une fois Rust installé et fonctionnel, installez les dépendances du projet :

```bash
cd loopingLewis
npm install
```

## 4. Lancement de l'application

Pour tester l'application en mode développement :

```bash
npm run tauri dev
```

*Note : La première compilation peut prendre entre 5 et 10 minutes car Rust compile toutes les dépendances natives. Les lancements suivants seront instantanés.*

## 5. Résolution des problèmes courants

### Erreur : 'cargo' n'est pas reconnu
- **Cause** : Le chemin d'accès (PATH) n'a pas été mis à jour dans votre session actuelle.
- **Solution** : Fermez et réouvrez votre terminal. Si cela persiste, vérifiez que `C:\Users\VOTRE_NOM\.cargo\bin` est présent dans vos variables d'environnement.

### Erreur : 'Visual Studio Build Tools are missing'
- **Cause** : Les outils de compilation C++ ne sont pas installés ou mal configurés.
- **Solution** : Relancez l'installateur Visual Studio et assurez-vous que "Développement Desktop en C++" est bien coché.
