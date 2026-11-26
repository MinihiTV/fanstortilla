/*
  CONFIGURACIÓN DEL SITIO TORTILLALAND
  ------------------------------------
  Los datos del sitio (anuncios, mensajes del muro y velas) viven en el archivo
  data/site.json de tu repositorio de GitHub. El panel admin.html lo edita por ti.

  owner y repo se detectan solos si usas GitHub Pages (tu-usuario.github.io/tu-repo).
  Rellénalos solo si usas un dominio propio.
*/
window.TL_CONFIG = {
  /* Buzón de Google (opcional pero recomendado): permite que los visitantes envíen
     mensajes SIN registrarse y que las velas se cuenten entre todos.
     Pega aquí la URL de tu Apps Script (termina en /exec). Ver README.md, paso 3. */
  buzon: {
    url: "https://script.google.com/macros/s/AKfycbyziZCd8z0wXRi1LO_mZXSUnCwL1JTLqoROOCTfUwYLBh1rWFHnbXHvkeCfUQmtLYoP/exec"
  },

  github: {
    owner: "",              // tu usuario u organización de GitHub (opcional)
    repo: "",               // nombre del repositorio (opcional)
    branch: "main",         // rama que publica GitHub Pages
    path: "data/site.json"  // archivo de datos
  }
};
