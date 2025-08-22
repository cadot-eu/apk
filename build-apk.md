# Instructions pour générer l'APK

## Fichiers préparés ✅

Votre application Galaxy Watch Heart Rate est maintenant prête à être compilée en APK !

### Structure du projet :
- `www/` - Application web optimisée pour Galaxy Watch
- `android/` - Projet Android natif généré par Capacitor
- `capacitor.config.json` - Configuration de l'application

## Méthodes pour générer l'APK

### Option 1: En ligne (Plus simple)
1. Aller sur [capacitor.build](https://capacitor.build) ou [appcircle.io](https://appcircle.io)
2. Télécharger tout le dossier du projet
3. Suivre les instructions pour compiler l'APK

### Option 2: Avec Android Studio
1. Installer Android Studio
2. Ouvrir le dossier `android/` dans Android Studio
3. Build → Generate Signed Bundle/APK
4. Choisir APK et suivre les étapes

### Option 3: En ligne de commande (si Java/Android SDK installés)
```bash
cd android
./gradlew assembleDebug
# L'APK sera dans android/app/build/outputs/apk/debug/
```

## Fonctionnalités de l'application

✅ Interface Galaxy Watch authentique
✅ Simulation réaliste des battements cardiaques  
✅ Graphique en temps réel
✅ Gestes tactiles (swipe, tap)
✅ Optimisé pour écrans de montre (320px à 400px)
✅ Support de la vibration
✅ Interface responsive

## Installation sur Galaxy Watch

1. Activer le "Mode développeur" sur votre Galaxy Watch
2. Transférer l'APK via Galaxy Watch Studio ou ADB
3. Installer l'application

L'application fonctionnera comme une vraie app de fréquence cardiaque !