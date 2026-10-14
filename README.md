# El Museo en tu Bolsillo

Galería web que permite explorar la colección del Museo de Arte de Cleveland a través de su API.

## Funcionalidades:
- **Busqueda**: por artista, tema o título.
- **Estados visibles**: carga, error y búsqueda sin resultado.
- **Ordenación**: por relevancia, título o fecha, sin volver a pedir datos a la API.
- **Filtro**: por tipo de la obra.
- **Ficha de la obra**: cuando apretas la obra nos da información téctina, departamento y descripción.
- **Paginación**: se muestran solo 20 obras, y puedes cargar más con un botón.
- **Caché en localStorage**: las búsquedas ya hechas no se vuelven a pedir a la red.
- **Imagen alternativa**: cuando no se puede cargar una image, salta una imagen alternativa.
- **Validación**: las búsquedas vacías se validan.

## Decisiones:
### Asincronía y manejo de errores
- Todas las peticiones usan 'async/await' dentro de un 'try/catch'.
- Se comprueba 'respuesta.ok', ya que 'fetch' no salta con errores HTTP.
- Si se lanza una búsqueda nueva mientras otra se está pidiendo, la respuesta antigua se descarta y solo se muestra la última.
- Un fallo al pedir más obras no borra las que ya se muestran, sino que aparece un aviso y se puede volver a inntentar.

### Transformación de datos
- Los datos de la API se convierten en 'Artwork' para poder usar 'filter' y 'map'.
- La ordenación usa 'toSorted()' para no mutar el array original y poder volver al orden de relevancia.
- Los tipos únicos para el filtro se obtienen con un 'Set', y el resumen de artistas distintos con 'reduce'.
- Los títulos se ordenan con 'localeCompare(..., "es")' para que funcione con acentos y eñes.

### Robustez
- Si la respuesta no trae un array de obras, se muestra como una búsqueda vacía para no romper la app.
- Las obras sin imagen se descartan, y se sustituye por un aviso.
- Si una obra no tiene descripción, se prueban varios campos distintos.
- El acceso a 'localStorage' está protegido con un 'try/catch', por lo que si los datos guardados están corruptos o el almacenamiento está lleno la app sigue funcionando sin caché.

## Uso de IA:
Durante el proyecto he usado Claude como asistente para:
- Obtener un esqueleto inicial del código con la estructura del proyecto.
- Ayuda para añadir funcionalidades.
- Revisar y arreglar errores en el codigo.
Todo fue revisado y entendido por mí. ME apoye en las DevTools para entender los errores y comprobar el funcionamiendo de la app.