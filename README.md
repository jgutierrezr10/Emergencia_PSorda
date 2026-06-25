##Programas requeridos

Node.js
Java 17
Postgresql

##Extensiones de VSC

Extension Pack for java




##Para correr el backend

Hay que crear las base de datos "emergencia_db"

en cmd escribimos: createdb -E UTF-8 -U postgres emergencia_db

cd backend

./mvnw spring-boot:run

O

Run en Backend EmergenciaApplication.java (Con: Extension Pack for Java)


##Para correr el frontend web

cd frontend-web

npm install

npm start

##Para correr el frontend movil

cd frontend-mobile

npx expo install

npx expo start

