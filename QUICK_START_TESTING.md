# Quick Start Testing Guide - Al-Muallim

## 🚀 Setup en 5 Minutes

### 1. Installer les Prérequis (Une seule fois)

#### iOS (Mac uniquement)
```bash
# Installer Xcode depuis App Store
# Ouvrir Xcode → Accept license

# Installer Command Line Tools
xcode-select --install

# Installer CocoaPods
sudo gem install cocoapods
```

#### Android
```bash
# Télécharger Android Studio
# https://developer.android.com/studio

# Ouvrir Android Studio
# More Actions → Virtual Device Manager
# Create Device → Pixel 7 → Android 14 → Finish
```

### 2. Cloner et Installer l'App

```bash
# Cloner le repo
cd ~/workspace
git clone https://github.com/rdaa99/al-muallim-mobile.git
cd al-muallim-mobile

# Installer les dépendances
npm install

# iOS: Installer pods
cd ios && pod install && cd ..
```

### 3. Lancer l'App

#### iOS
```bash
# Lister simulateurs disponibles
xcrun simctl list devices

# Lancer sur iPhone 15 Pro
npm run ios -- --simulator="iPhone 15 Pro"

# Ou ouvrir dans Xcode
open ios/alMuallim.xcworkspace
# Puis Cmd+R pour run
```

#### Android
```bash
# Démarrer émulateur
# Android Studio → Device Manager → Play

# Lancer app
npm run android

# Ou spécifier device
npm run android -- --deviceId=emulator-5554
```

---

## 📱 Outils de Debug

### React Native Debugger

```bash
# Installer
brew install --cask react-native-debugger

# Ouvrir (avant de lancer l'app)
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Dans l'app
# Cmd+D (iOS) ou Cmd+M (Android)
# → Debug with Chrome
```

### Flipper (Advanced)

```bash
# Télécharger
# https://fbflipper.com/

# Features:
- Network inspector
- Database viewer
- Layout inspector
- Logs viewer
- Performance monitor
```

### Logs en Direct

```bash
# iOS logs
npm run ios
# Logs dans terminal

# Android logs
npm run android
# Logs dans terminal

# Ou adb logcat
adb logcat | grep -i "al-muallim"
```

---

## 🧪 Tests Rapides

### Smoke Test (2 min)
```bash
1. Lancer app
2. Dashboard s'affiche ✓
3. Tab Review ✓
4. Tab Settings ✓
5. Changer setting ✓
6. Kill & restart ✓
7. Data persiste ✓
```

### Test Offline (1 min)
```bash
1. Lancer app
2. Activer mode avion
3. Compléter review ✓
4. Voir dashboard ✓
5. Réciter sourate ✓
```

### Test Audio (1 min)
```bash
1. Tab Review
2. Play audio ✓
3. Pause ✓
4. Change speed ✓
5. Next verse ✓
```

---

## 🐛 Rapporter un Bug

### Template Rapide

```markdown
**Problème:** [Description courte]

**Étapes:**
1. ...
2. ...
3. ...

**Attendu:** ...
**Actuel:** ...

**Device:** iPhone 15 Pro / iOS 17.2
**App Version:** 1.1.0
```

### GitHub Issues

```
https://github.com/rdaa99/al-muallim-mobile/issues/new

Labels:
- bug
- priority: P0/P1/P2/P3
- platform: ios/android/both
```

### Captures

**iOS Screenshot:**
```
Cmd+Shift+4 → Space → Clique simulator
Sauvé sur Desktop
```

**Android Screenshot:**
```
Android Studio → Device Manager → Screenshot icon
Ou: Cmd+S dans émulateur
```

**Video (iOS):**
```bash
xcrun simctl io booted recordVideo bug.mp4
# Ctrl+C pour stop
```

---

## 🔧 Reset & Clean

### Reset Complet
```bash
# iOS
cd ios
rm -rf build Pods Podfile.lock
pod install
cd ..

# Android
cd android
./gradlew clean
cd ..

# npm
rm -rf node_modules package-lock.json
npm install
```

### Clear App Data

**iOS Simulator:**
```
xcrun simctl uninstall booted com.almuallim.app
# Ou: Long press app → Delete
```

**Android Emulator:**
```
adb shell pm clear com.almuallim
# Ou: Settings → Apps → Al-Muallim → Clear Data
```

---

## 📊 Performance Profiling

### iOS - Instruments
```
1. Ouvrir Xcode
2. Product → Profile (Cmd+I)
3. Choisir template:
   - Time Profiler (CPU)
   - Allocations (Memory)
   - Leaks (Memory leaks)
```

### Android - Profiler
```
1. Android Studio → View → Tool Windows → Profiler
2. Choisir process com.almuallim
3. Monitor:
   - CPU
   - Memory
   - Network
   - Energy
```

### React Native Profiler
```
# Dans app
Cmd+D → Show Perf Monitor

# Ou code
import { enableScreens } from 'react-native-screens';
enableScreens(true);
```

---

## ✅ Checklist Avant de Tester

### Quotidien
- [ ] Pull latest code: `git pull`
- [ ] npm install (si changements)
- [ ] Clear data si besoin
- [ ] Lancer app

### Nouvelle Version
- [ ] Check version number
- [ ] Lire CHANGELOG.md
- [ ] Regarder les nouveaux issues
- [ ] Prioriser les tests

### Devices à Tester
- [ ] iPhone 15 Pro (flagship)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet)
- [ ] Pixel 7 (Android flagship)
- [ ] Budget Android device

---

## 🆘 Problèmes Courants

### "Command not found: react-native"
```bash
npm install -g react-native-cli
# Ou utiliser npx
npx react-native run-ios
```

### "Unable to load script"
```bash
# Reset Metro bundler
npm start -- --reset-cache
```

### iOS Build Error
```bash
cd ios
pod deintegrate
pod install
cd ..
rm -rf node_modules
npm install
npm run ios
```

### Android Build Error
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### "Device not found"
```bash
# iOS
xcrun simctl list devices
npm run ios -- --simulator="iPhone 15"

# Android
adb devices
npm run android -- --deviceId=emulator-5554
```

### "App crashes on launch"
```bash
# Vérifier les logs
adb logcat | grep -i "crash"

# iOS
# Xcode → Window → Devices and Simulators
# → View Logs
```

---

## 📞 Support

### Documentation
- TESTING.md (detailed scenarios)
- TEST_SCENARIOS.md (checklist)
- README.md (project info)

### Si Bloqué
1. Vérifier les logs
2. Google l'erreur
3. Checker GitHub issues
4. Demander à Alex (main agent)

---

**Temps de setup:** 5-10 minutes
**Temps pour smoke test:** 2 minutes
**Temps pour test complet:** 2-3 heures

**Bonne chance ! 🚀**
