# Entrega técnica — Estancia Vicentina

## Estructura

- `index.html`: Home / Proyecto, HTML semántico indexable.
- `loteo.html`: Loteo y plano reemplazable.
- `contacto.html`: Condiciones y consulta.
- `configuracion.js`: único objeto de configuración y textos principales.
- `EDITOR.html`, `assets/js/editor.js`: editor local que exporta configuracion.js.
- `assets/css/styles.css`: tipografías, variables, desktop y responsive.
- `assets/js/app.js`: navegación, formularios y configuración.
- `assets/js/analytics.js`: dataLayer, GTM, consentimiento y atribución.
- `assets/images`, `assets/fonts`: recursos locales, sin CDN ni dependencias.

No hay build. HTML contiene el contenido inicial; configuracion.js lo actualiza en navegador. Si se modifican textos para SEO, actualizar también el texto inicial del HTML y los metadatos. El editor no es un CMS remoto ni escribe directamente sobre el hosting.

## Contrato de formularios

Configurar `formularios.contactoEndpoint` y `formularios.newsletterEndpoint`. URLs relativas al documento o HTTPS del servidor. Si se usa otro origen, configurar CORS solo para el origen del sitio.

POST JSON de contacto:

```json
{"nombre":"Nombre de prueba","email":"prueba@example.com","telefono":"123456789","lote":"origen","mensaje":"Consulta de prueba","website":"","form_id":"contacto","event_id":"id-unico","attribution":{"utm_source":"google","utm_medium":"cpc"}}
```

Newsletter: `email`, `form_id: newsletter`, `event_id`, `attribution`.

Confirmación: HTTP 2xx + JSON `{"ok":true}` **solo después de guardar o aceptar durablemente el lead para envío**. Error: HTTP 4xx/5xx + `{"ok":false}`. No devolver detalles SMTP ni datos sensibles. El cliente usa timeout de 15 s, bloquea doble clic y conserva campos si falla. En timeout puede haber recepción del lado servidor: deduplicar por event_id. El backend debe validar tipos, largos y email, normalizar teléfono, validar lote contra lista permitida, rechazar honeypot, aplicar rate limiting y defensa contra spam; nunca confiar en validación del navegador. SMTP y secretos exclusivamente del lado servidor. Para suscripciones, definir confirmación y baja en el proveedor utilizado.

No se implementó backend: corresponde a la responsabilidad de integración indicada en la propuesta adjunta.

## Medición y eventos

Configurar `medicion.gtmId` y opcionalmente `medicion.debug`. No agregar otro snippet de GTM/GA4/Meta en HTML. En producción dejar debug=false.

| Evento dataLayer | Momento | Uso recomendado |
| --- | --- | --- |
| cta_click | Reservar, consultar lotes, ver lote | Interacción secundaria |
| whatsapp_click | Clic en enlace de WhatsApp | Intención de contacto, no conversación confirmada |
| phone_click | Clic en teléfono | Intención de llamada |
| email_click | Clic en correo | Intención de correo |
| plan_open | Clic para ampliar plano | Interés en loteo |
| form_start | Primer cambio de campo, una vez por intento | Inicio de formulario |
| form_submit | Inicio del POST válido | Intento, no conversión |
| generate_lead | Contacto confirmado por backend | Conversión principal |
| newsletter_signup | Suscripción confirmada por backend | Conversión separada |
| form_error | Fallo de red, timeout o servidor | Diagnóstico |
| form_unavailable | Endpoint no configurado | Diagnóstico de integración |

Parámetros permitidos: `page_type`, `page_path` (sin query), `label`, `form_id`, `lot_type`, `event_id`, `error_type`. No enviar email, teléfono, nombre o mensaje a dataLayer ni como parámetros de GA4/Meta. No se implementó enhanced conversions ni CAPI; event_id está disponible para una futura deduplicación Pixel/CAPI.

En GTM:
1. Añadir Google tag para GA4 y conversión/linker de Google Ads según las cuentas.
2. Crear variables de capa de datos para los parámetros anteriores.
3. Crear activadores de evento personalizado con coincidencia exacta de los nombres.
4. Mapear generate_lead a GA4 generate_lead, conversión Ads y Meta Lead. Configurar IDs y labels **en GTM**, no en JS del sitio. No disparar Lead en form_submit ni en clicks.
5. Configurar Meta base/PageView dentro de GTM y los consentimientos adicionales correspondientes para etiquetas no Google.
6. Evitar duplicar conversiones por importación GA4 y etiqueta Ads para una misma acción. Elegir el mecanismo y la acción principal.
7. Usar Tag Assistant, DebugView, pruebas de eventos Meta y diagnóstico de Ads antes de publicar el contenedor.

### Consentimiento y atribución

Antes de GTM, se inicializan ad_storage, analytics_storage, ad_user_data y ad_personalization como denied. El contenedor solo carga tras aceptar. Rechazar no carga GTM. La elección dura la sesión del navegador. Preferencias permite cambiarla; revocar recarga para retirar las etiquetas cargadas. Las cookies existentes de terceros deben gestionarse mediante la CMP final si se adopta una; este control no es una CMP certificada ni borra cookies de otros dominios.

UTM, gclid, gbraid, wbraid y fbclid se retienen en sessionStorage solo tras consentimiento, se conservan entre estas páginas y se envían al backend únicamente si se aceptó. Sin aceptación no se persisten ni se transfieren. El dataLayer no recibe la URL completa ni esos parámetros. En GTM revisar las URL automáticas de las etiquetas para evitar parámetros que contengan datos personales. No reutilizar UTM para emails o nombres.

Cuando el ID GTM está vacío, se permite inspeccionar eventos locales de dataLayer sin ningún envío de red. No activar otro mecanismo publicitario fuera de GTM.

Referencias oficiales revisadas para la implementación:
- https://developers.google.com/tag-platform/devguides/datalayer
- https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic

## Contenidos y recursos

Fotografías, recortes, logo y fuentes provienen de los tres PDF de diseño. Textos HTML, navegación y campos son reales, no una captura de pantalla de la página. El plano y mapa son imágenes ilustrativas; el primero se abre a resolución mayor y es reemplazable. Se preservan el ancho editorial, paleta, orden de secciones y variantes cursivas. Mobile reorganiza columnas.

Los enlaces de redes/LinkedIn sin destino se ocultan. No se agregaron identidades ni URL supuestas. Tampoco diapositivas de loteo que no aparecen en la maqueta. Los acordeones incluyen textos breves de apoyo a revisar con el cliente. No afirmar disponibilidad en vivo.

## Publicación

Copiar solo HTML públicos, configuracion.js y assets. No subir EDITOR.html, LEEME.html ni docs. Usar HTTPS, compresión Brotli/gzip, caché de assets y TTL corto para HTML/configuracion.js. Configurar dominio final; entonces se generan canonical y og:image absolutos. Ajustar robots/sitemap en el hosting cuando se conozca el dominio. Revisar licencias web de fuentes con el diseñador antes de publicar.

## Pruebas de aceptación

- Tres páginas, menú mobile y enlaces relativos con y sin subcarpeta.
- Formulario inválido no hace POST. Endpoint vacío no dice éxito.
- Backend 2xx {ok:true}: un generate_lead; 4xx/5xx/timeout: ninguno.
- Newsletter confirmado: newsletter_signup, nunca generate_lead.
- Rechazar: sin solicitud a GTM. Aceptar: un contenedor; revocar: recarga.
- Editor: descargar JS, reemplazar y comprobar datos en las tres páginas.
- Verificar plano final y enlaces reales antes de lanzar campañas.
