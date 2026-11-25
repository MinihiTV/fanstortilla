# TortillaLand · Fan site

Página de fans de TortillaLand con homenaje a Komanche, muro de mensajes, velas, reproductor de la canción tributo, modo noche, espacios de anuncios (Adsterra) y panel de administrador.

**No necesita Firebase ni servidor.** Los datos publicados viven en un archivo JSON dentro de tu repositorio de GitHub, y los visitantes envían mensajes **sin registrarse** a través de un buzón gratuito de Google.

```
index.html             → la página principal
admin.html             → el panel de administrador (tusitio/admin.html)
data/site.json         → lo publicado: anuncios, mensajes aprobados y velas extra
config.js              → URL del buzón de Google (y usuario/repositorio si usas dominio propio)
google-apps-script.gs  → el código del buzón de Google (se pega una vez)
js/store.js            → lee el JSON, habla con el buzón y, desde el panel, guarda en GitHub
img/  audio/           → logo, skin de Komanche, canción e iconos (img/icons)
favicon.ico, manifest.webmanifest → icono de la pestaña y del acceso directo en el móvil
```

## Cómo funciona

| Quién | Qué hace | Dónde se guarda |
|---|---|---|
| **Visitante** | Escribe un mensaje y pulsa **Enviar**, sin cuenta | Buzón de Google (una hoja de cálculo tuya), como *pendiente* |
| **Visitante** | Enciende velas | Contador del buzón de Google, compartido por todos |
| **Tú, en el panel** | Apruebas o rechazas mensajes, gestionas anuncios y velas extra, y pulsas **Publicar** | `data/site.json` en GitHub (el panel hace el *commit*) |

Los mensajes **solo aparecen en el muro cuando tú los apruebas**. Mientras tanto, quien lo envió lo ve en su navegador marcado como “pendiente de aprobación”.

> Sin buzón configurado, el sitio funciona igual, pero los mensajes y las velas de cada visitante se quedan solo en su navegador.

---

## 1. Subir el sitio a GitHub Pages

1. En https://github.com pulsa **New repository**. Nómbralo, por ejemplo, `tortillaland` y márcalo como **Public**.
2. Pulsa **uploading an existing file**. Arrastra **todo el contenido** de esta carpeta, incluidas `data`, `js`, `img`, `audio` y el archivo `.nojekyll`. Pulsa **Commit changes**.
3. Ve a **Settings › Pages**. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)**, y pulsa **Save**.
4. En 1–2 minutos el sitio estará en `https://TU-USUARIO.github.io/tortillaland/`.
   El panel estará en `https://TU-USUARIO.github.io/tortillaland/admin.html`.

## 2. Crear tu token para el panel (una sola vez)

1. Entra en https://github.com/settings/personal-access-tokens/new (**Fine-grained token**).
2. Configúralo así:
   - **Nombre:** `Panel TortillaLand`.
   - **Expiración:** la que prefieras (por ejemplo, 90 días).
   - **Repository access:** *Only select repositories* › elige `tortillaland`.
   - **Permissions › Repository permissions:**
     - **Contents:** *Read and write*.
3. Pulsa **Generate token** y cópialo. Empieza por `github_pat_…`.
4. Abre `admin.html` en tu sitio. Usuario y repositorio ya vienen rellenos. Pega el token y pulsa **Conectar**.
   - Con **“Recordar en este navegador”**, no tendrás que pegarlo otra vez en ese navegador.
   - Úsalo solo en tu computadora o tu teléfono personal.
   - El token nunca se sube al repositorio.

## 3. Crear el buzón de Google (5 minutos, una sola vez)

Así los visitantes envían mensajes sin registrarse y las velas se cuentan entre todos.

1. Entra en https://sheets.new con tu cuenta de Google. Se crea una hoja de cálculo nueva; ponle de nombre “Buzón TortillaLand”.
2. Menú **Extensiones › Apps Script**. Borra el código que aparece y pega **todo** el contenido de `google-apps-script.gs`.
3. En la línea `const CLAVE_ADMIN = '...'`, cambia el texto por una **clave larga que solo sepas tú**, por ejemplo `tortilla-komanche-2026-xyz`. Pulsa 💾 **Guardar**.
4. Arriba a la derecha pulsa **Implementar › Nueva implementación**. En el engranaje ⚙️ elige **Aplicación web** y configura:
   - **Ejecutar como:** *Yo*.
   - **Quién tiene acceso:** *Cualquier persona*.
5. Pulsa **Implementar** y **autoriza** los permisos con tu cuenta. Google mostrará “app no verificada”: pulsa *Configuración avanzada › Ir a…*. Es normal, porque el script es tuyo.
6. Copia la **URL de la aplicación web** (termina en `/exec`).
7. En GitHub abre `config.js`, pulsa el lápiz ✏️ y pega la URL entre las comillas de `url: ""` dentro de `buzon`. Pulsa **Commit changes**.
8. En el panel, pestaña **Mensajes**, escribe tu `CLAVE_ADMIN` cuando te la pida. Se recuerda en ese navegador.

Los mensajes que llegan se ven en la hoja, en la pestaña **Mensajes**, con su estado: *pendiente*, *aprobado* o *rechazado*.

> **Si cambias el código del script:** usa *Implementar › Gestionar implementaciones › ✏️ Editar › Versión: Nueva versión*. Así la URL sigue siendo la misma.

## 4. Usar el panel

- **Todo es un borrador** hasta que pulsas **Publicar cambios**. Entonces el panel guarda `data/site.json` en GitHub con un *commit*, y GitHub Pages actualiza el sitio en **1–2 minutos**.
- **Anuncios:** pega el código de Adsterra en cada espacio, actívalo, ajusta el alto y compruébalo con **Vista previa**.
- **Mensajes:**
  - En **Por aprobar** aparecen los mensajes que llegaron al buzón. **Aprobar** lo añade al muro y **Rechazar** lo descarta. Al publicar, la hoja se actualiza con el estado de cada mensaje.
  - También puedes **añadir mensajes a mano** (por ejemplo, los que te dejen en redes) o **quitar** mensajes ya publicados.
- **Velas:**
  - Las del buzón suben solas cuando los visitantes encienden velas; puedes ponerlas a 0.
  - Las **velas extra** del JSON se suman al total. Úsalas, por ejemplo, para las velas que te reporten en redes.
- Si el archivo cambió en GitHub mientras editabas, el panel te avisa. Pulsa el botón de recargar (↻) y vuelve a aplicar tus cambios.

## 5. Poner los anuncios de Adsterra

1. En https://adsterra.com (cuenta de **Publisher**), añade `https://TU-USUARIO.github.io/tortillaland/` y espera la aprobación.
2. Crea formatos que no molesten:
   - **Banner 728×90**, para computadora, y **Banner 320×50**, para móvil.
   - **Native Banner** o **Banner 300×250**, para el espacio de participantes.
   - **Evita Popunder y Social Bar**: son los que más molestan.
3. Copia el código (*Get code*) y pégalo en `admin.html › Anuncios`. Luego pulsa **Publicar cambios**.

| Espacio | Dónde aparece | Formato recomendado |
|---|---|---|
| `episodios` | Entre “Episodios” y “Creadores” | 728×90 / 320×50 |
| `participantes` | Debajo de la lista de participantes | Native Banner o 300×250 |
| `pie` | Antes del pie de página | 728×90 / 320×50 |

La portada y el homenaje a Komanche **nunca** muestran anuncios. Cada anuncio se carga en un marco aislado (iframe) solo cuando el visitante llega a esa parte de la página. Si alguno no aparece, activa **Modo compatibilidad** en ese espacio.

También puedes editar `data/site.json` a mano directamente en GitHub (lápiz ✏️ › *Commit*).

## 6. Probar en tu computadora

Abre `admin.html` con doble clic y pulsa **Probar en modo demo**. El buzón de Google también funciona desde tu computadora si ya pusiste su URL en `config.js`. Los cambios se guardan solo en ese navegador. Luego abre `index.html` con doble clic y verás lo que publicaste en el demo. Los anuncios reales de Adsterra solo funcionan en tu dominio aprobado.

---

## Avisos

- Página hecha por fans, sin relación oficial con TortillaLand ni con sus creadores. El logo pertenece a sus creadores y Minecraft es marca de Mojang.
- La canción “Comanche v2” es de dani_villa. Su estribillo toma un verso de “DtMF” de Bad Bunny; si la página genera ingresos con anuncios, podrías recibir reclamos de derechos por la canción o el logo.
- Tu repositorio es público: cualquiera puede ver `data/site.json`, incluido el código de los anuncios. Es normal y no es un riesgo.
- La URL del buzón está en `config.js` y es pública. Alguien podría llenarlo de mensajes basura o inflar el contador de velas, pero **ningún mensaje aparece en el muro sin tu aprobación**, y en el panel puedes poner las velas del buzón a 0. Tu `CLAVE_ADMIN` nunca se sube a GitHub.
