# EA-CORE-GPI-PI

## Descripción
Este modulo contiene los extractores usados para el proyecto Emol, Reddit, Telegram, Twitter y Youtube. además incluye algoritmos para filtrar y preparar los comentarios para su posterior análisis.

## Documentación técnica
Este repositorio está diseñado como un modulo utilizado dentro del sistema desarrollado, se incluyen test para verificar el funcionamiento de cada extractor individualmente.

## Configuración y autenticación de los servicios

### Emol 
Este servicio no requiere de ninguna autenticación y puede ser usado libremente.

### Reddit
 Este servicio no requiere de ninguna autenticación y puede ser usado libremente.

### Telegram
Para hacer uso de esta API se requiere tener un numero de teléfono registrado el la plataforma de Telegram, además de ingresar un numero de verificación el cual es enviado al numero de teléfono registrado.
 
### Twitter
 Para hacer uso de este servicio se requiere hacer el registro en [Twitter Developer](https://developer.twitter.com/en) para obtener las api-key necesarias para hacer uso de los servicios que provee Twitter.
### Youtube
 Para hacer uso de este servicio se requiere de una cuenta en [Google Developer](https://developers.google.com/youtube/v3/getting-started?hl=es), luego registrar la aplicación y activar la API de datos de YouTube

## Tests
Para ejecutar los tests incluidos en este repositorio se deben ejecutar los siguientes comandos.
Realizar un test de funcionamiento de los servicios.

```
npm run serve-emol
npm run serve-reddit
npm run serve-telegram
npm run serve-twitter
npm run serve-youtube

```
 

## Instalación
Para ejecutar las pruebas de este modulo es necesario tener instalado y actualizado [`NodeJS`](https://nodejs.org/) y [`NPM`](https://www.npmjs.com/) a sus ultimas versiones en el equipo.
Luego se debe ejecutar el siguiente comando para instalar las librerías necesarias.

```
npm install
```