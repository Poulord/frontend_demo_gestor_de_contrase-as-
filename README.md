# Frontend

El frontend de DJPJM vive en `frontend/src` y representa la capa visible del prototipo. Incluye las pantallas de autenticacion, la vista principal de la boveda y la logica de interaccion con el usuario.

## Estructura

- `html/`: vistas `login.html`, `register.html` e `index.html`.
- `css/`: estilos separados por pantalla.
- `js/register.js`: flujo de registro, login y mensajes al usuario.
- `js/script.js`: logica de la boveda, tarjetas y acciones principales.
- `js/seguridad.js`: cifrado AES, importacion, exportacion y gestion de boveda.
- `js/sha.js`: generacion de contrasenas y hash SHA-256 en cliente.

## Responsabilidades del frontend

- mostrar la interfaz del prototipo;
- validar formularios;
- gestionar la sesion del usuario en navegador;
- cifrar y descifrar el contenido de la boveda;
- permitir crear, editar y eliminar credenciales.

## Estado

El frontend es funcional y demostrable, aunque todavia forma parte de una fase de prototipo. Parte de la logica que en una version final podria depender solo del backend sigue resuelta en cliente para facilitar la entrega y la integracion progresiva.
