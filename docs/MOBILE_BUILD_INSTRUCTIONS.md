# Instrucciones para Compilar APK Android y Proyecto iOS con Capacitor

## 1. Requisitos Previos
- **Node.js**: v22.0.0 o superior.
- **Android Studio**: Para compilación de Android APK / AAB (requiere Android SDK 34+ y JDK 17/21).
- **Xcode**: Requerido exclusivamente en macOS para compilar el paquete de iOS (.ipa).

## 2. Preparación de la Construcción Web
```bash
# 1. Instalar dependencias
npm install

# 2. Generar el paquete estático web en la carpeta dist/
npm run build
```

## 3. Configuración y Compilación de Android (APK)
```bash
# 1. Agregar la plataforma Android (si no se ha agregado previamente)
npx cap add android

# 2. Sincronizar el bundle generado en dist/ con el proyecto nativo Android
npx cap sync android

# 3. Abrir el proyecto en Android Studio
npx cap open android
```

### Pasos en Android Studio:
1. Esperar la sincronización de Gradle.
2. Ir al menú **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. El APK listo para instalación se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`.

## 4. Configuración y Compilación de iOS (Xcode)
```bash
# 1. Agregar la plataforma iOS en macOS
npx cap add ios

# 2. Sincronizar el bundle web
npx cap sync ios

# 3. Abrir el proyecto en Xcode
npx cap open ios
```

### Pasos en Xcode:
1. Seleccionar el equipo de desarrollo (Signing & Capabilities).
2. Seleccionar el destino (Dispositivo iOS o Simulador).
3. Seleccionar **Product** -> **Archive** para generar el binario `.ipa` o distribuir en TestFlight / App Store.
