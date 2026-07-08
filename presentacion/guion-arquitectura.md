# Guion — Presentación de Arquitectura
**App Emergencia Gente Sorda** · Presenta: Benjamin · (~6-8 min)
Audiencia: profesor + usuarios (comunidad sorda y Carabineros)

> Consejo general: como parte del público es sordo, apóyate todo el tiempo en el diagrama.
> Señala cada caja mientras hablas de ella y avanza de izquierda a derecha.
> Frases cortas, pausas entre ideas, y deja el diagrama siempre visible.

---

## 1. Apertura (30 seg)

"Mi compañero les mostró **qué hace** la aplicación. Yo les voy a mostrar **cómo está construida por dentro**: qué piezas tiene, dónde vive cada una y cómo conversan entre sí."

Analogía (para todo público): "Piensen en la aplicación como una comisaría: hay una **puerta para el ciudadano** (la app del celular), un **escritorio del operador** (el panel de CENCO) y un **archivo central** donde queda registrado todo (el servidor con su base de datos)."

## 2. Las tres piezas (1,5 min) — señalar cada caja del diagrama

"El sistema tiene tres partes independientes, cada una publicada en internet por separado:"

**La app móvil** (caja izquierda): es la que usa la persona sorda. Está hecha con **React Native y Expo**, o sea, un solo código que funciona en Android y iPhone. Toda la interfaz está escrita en **glosa de lengua de señas chilena**, no en español gramatical: fue una decisión de diseño para que la app hable el idioma de sus usuarios.

**El panel web de CENCO** (caja derecha): es el que usa el operador de Carabineros. Está hecho con **Angular** y corre en cualquier navegador, sin instalar nada. Desde ahí el operador ve el mapa, despacha la patrulla, chatea, hace la videollamada y genera el informe PDF del caso.

**El backend** (caja central abajo): es el cerebro. Un servidor **Spring Boot (Java 17)** con una base de datos **PostgreSQL**. Ninguna de las dos pantallas habla con la otra directamente: **todo pasa por el servidor**, que valida, guarda y reparte la información.

Despliegue: "La app se distribuye con **Expo/EAS**, el panel está publicado en **Vercel** y el servidor con su base de datos en **Railway**. Son servicios en la nube: no dependemos de ningún computador nuestro encendido."

## 3. Cómo conversan las piezas (2 min) — seguir las flechas del diagrama

"Hay tres canales de comunicación, y cada uno existe por una razón distinta. Los muestro con el ejemplo de una alerta real:"

**Canal 1 — REST con polling (flechas verdes):** "Cuando la persona aprieta el botón de emergencia, la app manda la alerta al servidor por HTTPS con su ubicación GPS. El panel de CENCO le pregunta al servidor cada 2-3 segundos '¿hay algo nuevo?' — eso se llama *polling* — y por eso la alerta aparece en el mapa del operador casi al instante. El mismo canal lleva el estado de vuelta: cuando CENCO despacha la patrulla, la app del ciudadano se entera en el siguiente ciclo y muestra la patrulla avanzando por las calles con su tiempo de llegada."

**Canal 2 — WebSocket/STOMP (flechas naranjas):** "Para el chat y para 'timbrar' la videollamada necesitamos avisos inmediatos, no preguntas cada 2 segundos. Para eso el servidor mantiene una conexión permanente tipo *WebSocket*: es como una línea telefónica abierta por donde el servidor puede empujar mensajes al momento."

**Canal 3 — WebRTC de par a par (flecha morada):** "El video de la videollamada **no pasa por nuestro servidor**: viaja directo entre el celular y el navegador del operador con **WebRTC**, la misma tecnología de las videollamadas de WhatsApp. El servidor solo hace de 'presentador': les pasa los datos técnicos para que se encuentren (señalización), y servidores públicos STUN/TURN los ayudan a atravesar las redes. Esto es clave para una videollamada en lengua de señas: video fluido y sin recargar nuestro servidor."

## 4. Dentro del backend (1,5 min) — para el profesor

"El servidor está organizado en **capas**, el patrón clásico de Spring:"

"Los **Controllers** reciben las peticiones HTTP y definen la API REST; los **Services** — con sus interfaces — contienen la lógica de negocio, como el anti-spam que impide crear dos alertas activas para la misma persona; los **Repositories** con JPA/Hibernate traducen objetos Java a la base de datos, sin SQL escrito a mano."

"La seguridad es con **JWT**: al iniciar sesión el servidor firma un token, y un filtro lo verifica en cada petición. Las claves se guardan cifradas con BCrypt, nunca en texto plano."

"En la base de datos el modelo gira en torno a la **Alerta**: se relaciona con la Persona Sorda que la emite, su Triage (las preguntas de qué está pasando), el Chat del caso, y el Despacho que la conecta con una Patrulla y un Carabinero. Ese registro completo es lo que después sale en el informe PDF."

## 5. Decisiones de arquitectura y por qué (1 min)

"Tres decisiones que quiero destacar:"

"**Costo cero de operación**: mapas con OpenStreetMap/Leaflet, cálculo de rutas con OSRM, direcciones con Nominatim, y video por STUN/TURN públicos. Todo el sistema funciona sin pagar licencias, importante para un proyecto social."

"**Simulación aislada y lista para lo real**: la patrulla que se ve avanzar por las calles hoy es simulada, pero el cálculo de su posición está encapsulado en un módulo aparte; el día que Carabineros entregue el GPS real de sus patrullas, se enchufa ahí sin tocar los mapas ni las pantallas."

"**Tecnologías estándar**: Java/Spring y Angular son lo que usan instituciones grandes como Carabineros; si el proyecto crece, cualquier equipo puede mantenerlo."

## 6. Cierre (20 seg)

"En resumen: tres piezas independientes, un solo cerebro que registra todo, y el canal correcto para cada necesidad — registros por REST, avisos instantáneos por WebSocket y video directo de persona a persona. Esa es la arquitectura que hace posible el flujo que les mostró mi compañero."

---

## Posibles preguntas del profesor (prepárate)

- **¿Por qué polling y no WebSocket para todo?** Simplicidad y robustez: el estado de la alerta es tolerante a 2-3 s de retraso y el polling sobrevive a caídas de conexión sin lógica extra de reconexión; el WebSocket se reserva para lo que sí exige inmediatez (chat, timbre de llamada, señalización).
- **¿Qué pasa si se cae el servidor?** Backend y BD están en Railway con reinicio automático; los clientes reintentan (polling y reconexión STOMP cada 5 s). Punto único de falla: se mitigaría con réplicas, fuera del alcance actual.
- **¿Por qué WebView para WebRTC en el móvil?** `react-native-webrtc` es incompatible con Expo Go y la nueva arquitectura de RN; el WebView usa el WebRTC nativo del sistema con el mismo código que el navegador — decisión pragmática documentada en el historial del repo.
- **¿Escalabilidad?** El backend es sin estado (JWT), así que se puede escalar horizontalmente; PostgreSQL y el broker STOMP serían los siguientes cuellos de botella (broker externo tipo RabbitMQ si crece).
- **¿Seguridad de los datos?** HTTPS en todos los canales, JWT con expiración, BCrypt para claves, y el video P2P va cifrado extremo a extremo por diseño de WebRTC (DTLS-SRTP).
