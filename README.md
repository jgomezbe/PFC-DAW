<h1> AcaDÉmy </h1>

Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Estado del proyecto](#estado-del-proyecto)
- [Características de la aplicación y demostración](#características-de-la-aplicación-y-demostración)
- [Acceso al proyecto](#acceso-al-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Persona contribuyente](#persona-contribuyente)
- [Desarrollador del proyecto](#desarrollador-del-proyecto)
- [Licencia](#licencia)
- [Conclusión](#conclusión)
## Descripción del proyecto
El proyecto que he desarrollado es una webapp que tiene como objetivo el control de un posible ingreso de unos derechos de formación.

Si bien antes de entrar en detalle del proyecto en sí, debemos de conocer el significado del término derechos de formación.

Los derechos de formación son una indemnización que se debe pagar a los clubes que han formado a un jugador de fútbol desde los 12 hasta los 21 años de edad, cuando este jugador firma su primer contrato profesional o es transferido al exterior antes de finalizar la temporada de su cumpleaños número 23.

## Estado del proyecto
![Estado del proyecto](https://img.shields.io/badge/Estado-Finalizado-brightgreen)
![Versión del proyecto](https://img.shields.io/badge/Versión-1.0-orange)
![Licencia del proyecto](https://img.shields.io/badge/Licencia-MIT-blue)

## Características de la aplicación y demostración
A continuación se muestran brevemente algunos gifs a modo de ejemplo de los rasgos a resaltar de la app:
- Autenticación de usuarios: Permite a los usuarios registrarse, iniciar sesión y gestionar sus perfiles individuales.
![Interacción del perfil del user](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/perfil.gif)
- Gestión de usuarios: Permite a los administradores gestionar las solicitudes de verificación de los clubes formadores y aprobar o rechazar dichas solicitudes.
![Aprobación de una solicitud](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/gestion.gif)
- Importación de jugadores y traspasos: La aplicación ejecuta un script de scrapeo que obtiene los datos de la página besoccer.com para importar información sobre jugadores y sus traspasos recientes. Esto es especialmente útil para jugadores que han pasado por categorías inferiores o el primer equipo del RC Deportivo de la Coruña.
![Menú del panel de administrador donde están los logs](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/logs.gif)
- Consulta de jugadores: Los usuarios pueden realizar búsquedas de jugadores y obtener una lista de resultados, con la posibilidad de acceder a los perfiles de los jugadores en la página web de TransferMarkt, una fuente de información futbolística reconocida.
![Búsqueda de un jugador y navegación por sus transfers](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/buscar.gif)
- Elementos genéricos: La aplicación incluye elementos como una barra de navegación y un pie de página con enlaces complementarios a la propia app, así como enlaces a diferentes endpoints de la misma.
![Navbar y Footer en acción](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/menus.gif)
- Elementos estéticos: Se han incorporado elementos visuales como una galería de imágenes, un mensaje de bienvenida al usuario (dependiendo de si está autenticado o no) y un contador de los días transcurridos desde la fundación del RC Deportivo.
![Menú principal de la app](https://github.com/jgomezbe/PFC-DAW/blob/main/readmesrc/index.gif)
## Acceso al proyecto
### Comandos de ejecución local

Para ejecutar el proyecto en un entorno local, sigue estos pasos:

1. Clona el repositorio:
    https://github.com/jgomezbe/PFC-DAW.git
2. Navega al directorio del proyecto:

    cd PFC-DAW
3. Instala las dependencias del frontend:

    cd frontend

    npm install


4. Inicia el servidor de desarrollo del frontend:

    npm start

5. Abre otra terminal y navega al directorio del backend:

    cd ../backend
6. Crea y activa un entorno virtual (opcional):

    python -m venv env

    source env/bin/activate
7. Instala las dependencias del backend:

    pip install -r requirements.txt

8. Ejecuta las migraciones de la base de datos:

    python manage.py migrate

9. Inicia el servidor de desarrollo del backend:

    python manage.py runserver
10. Accede a la aplicación en tu navegador:
    ```
    http://localhost:3000/
    ```

## Tecnologías utilizadas
- React JS: Biblioteca de JavaScript para construir interfaces de usuario.
- REST Framework de Django: Herramienta que facilita la creación de APIs bajo la arquitectura REST.

## Persona contribuyente
- Javier Gómez Becerra
## Desarrollador del proyecto

- Javier Gómez Becerra
## Licencia
Este proyecto se encuentra bajo la Licencia [MIT](LICENSE).
## Conclusión

En resumen, este proyecto consiste en una webapp para el control de derechos de formación en el ámbito del fútbol. Ha proporcionado funcionalidades de autenticación de usuarios, gestión de usuarios, consulta de jugadores y traspasos, consulta de estos entre otras, siendo los datos obtenidos del portal reconocido mundialmente TransferMarkt, una fuente de información más que contrastada. 

Para mantener la aplicación al día con los avances tecnológicos y las necesidades del usuario, se pueden considerar los siguientes posibles cambios y mejoras:

- Mejoras en la interfaz de usuario: Realizar actualizaciones en el diseño y la usabilidad de la aplicación para ofrecer una experiencia más intuitiva y atractiva para los usuarios.

- Nuevas funcionalidades: Agregar nuevas características, como la capacidad de generar informes personalizados o integrar servicios adicionales de fuentes de datos relevantes.

- Actualizaciones de tecnología: Mantener las tecnologías utilizadas actualizadas y adoptar nuevas herramientas o bibliotecas que puedan mejorar el rendimiento, la seguridad y la eficiencia del proyecto.

- El desarrollo continuo de la aplicación, teniendo en cuenta las necesidades de los usuarios y los avances tecnológicos, permitirá seguir ofreciendo un producto robusto y útil en el ámbito de los derechos de formación en el fútbol.

