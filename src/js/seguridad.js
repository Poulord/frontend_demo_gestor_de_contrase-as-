// ==================== CONSTANTES ====================
const STORAGE_KEY = "DJPJM_boveda";
const ESTADO_KEY = "DJPJM_estado";
const BACKEND_LOGIN_LOG_URL = "https://backend-demo-gestor-de-contrase-as.onrender.com/api/auth/login";

// ==================== CIFRADO Y DESCIFRADO ====================
function guardarYcifrarBoveda(contrasenas) {
  const master = sessionStorage.getItem("DJPJM_master");
  if (!master) return;

  const json = JSON.stringify(contrasenas);
  const cifrado = CryptoJS.AES.encrypt(json, master).toString();
  localStorage.setItem(STORAGE_KEY, cifrado);
}

function descifrarBoveda(master) {
  try {
    const cifrado = localStorage.getItem(STORAGE_KEY);
    if (!cifrado) return null;

    const bytes = CryptoJS.AES.decrypt(cifrado, master);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(json);
  } catch (error) {
    console.error("Error al descifrar:", error);
    return false;
  }
}

// ==================== GESTIÓN DE ESTADO ====================
function registrarContrasenaMaestra(master) {
  // Guardar un hash de la master para verificar que existe
  const hash = CryptoJS.SHA256(master).toString();
  localStorage.setItem(ESTADO_KEY, hash);
  guardarYcifrarBoveda([]);
}

function verificarEstadoBoveda() {
  const estado = localStorage.getItem(ESTADO_KEY);
  return estado ? "EXISTENTE" : "NUEVA";
}

function intentarIniciarSesion(master) {
  const datos = descifrarBoveda(master);
  return datos;
}

// ==================== EXPORTAR/IMPORTAR ====================
function exportarArchivoDJPJM() {
  const master = sessionStorage.getItem("DJPJM_master");
  const usuario = sessionStorage.getItem("DJPJM_usuario");
  
  if (!master || !usuario) {
    alert("Error: sesión no válida");
    return;
  }

  try {
    const cifrado = localStorage.getItem(STORAGE_KEY);
    if (!cifrado) {
      alert("La bóveda está vacía");
      return;
    }

    const exportData = {
      version: "1.0",
      usuario,
      timestamp: new Date().toISOString(),
      boveda: cifrado
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boveda_${usuario}_${Date.now()}.djpjm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Bóveda exportada correctamente");
    mostrarMensaje("Bóveda exportada correctamente", "success");
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al exportar la bóveda");
  }
}

function importarArchivoDJPJM(evento) {
  const file = evento.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const contenido = JSON.parse(e.target.result);
      
      if (!contenido.boveda || !contenido.version) {
        throw new Error("Formato de archivo inválido");
      }

      // Verificar que el usuario coincida
      const usuarioActual = sessionStorage.getItem("DJPJM_usuario");
      if (contenido.usuario !== usuarioActual) {
        throw new Error(`Este archivo pertenece a otro usuario: ${contenido.usuario}`);
      }

      // Restaurar en localStorage
      localStorage.setItem(STORAGE_KEY, contenido.boveda);
      
      // Recargar la bóveda
      const master = sessionStorage.getItem("DJPJM_master");
      const datos = intentarIniciarSesion(master);
      
      if (datos === false) {
        throw new Error("No se ha podido importar con la contraseña maestra actual");
      }

      contrasenas = datos || [];
      renderVault();
      mostrarMensaje("Bóveda importada correctamente", "success");
    } catch (error) {
      console.error("Error al importar:", error);
      alert("Error al importar: " + error.message);
      mostrarMensaje("Error al importar la bóveda", "error");
    }
  };
  reader.readAsText(file);
}

// ==================== EVENTOS Y LOGS ====================
function mostrarMensaje(mensaje, tipo = "info") {
  const elemento = document.getElementById("vault-message");
  if (elemento) {
    elemento.textContent = mensaje;
    elemento.className = `vault-message ${tipo}`;
    
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      elemento.textContent = "";
      elemento.className = "vault-message";
    }, 5000);
  }
}

async function registrarLogRemoto(usuario, evento) {
  const usuarioVisibleParcial = ocultarUsuarioParcialmente(usuario);
  const payload = {
    evento,
    usuarioVisibleParcial,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(BACKEND_LOGIN_LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`No se pudo registrar el log remoto. Estado: ${response.status}`);
    } else {
      console.log("Log remoto enviado correctamente");
    }
  } catch (error) {
    console.warn("No se pudo registrar el log remoto:", error);
  }
}

function ocultarUsuarioParcialmente(usuario) {
  const len = usuario.length;
  if (len <= 2) return "**";
  return usuario[0] + "*".repeat(len - 2) + usuario[len - 1];
}
