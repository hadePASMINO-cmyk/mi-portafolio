/* Carga el contenido, las unidades, sesiones y documentos del portafolio desde Supabase. */
(function(){
  var SUPABASE_URL = "https://jyxohnsvqhhnxcmkwfgg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_3La-D-KSxaVYsSYNmd6SSA_M4XkieaD";

  var CAMPOS = ["curso-portada","institucion","estudiante","biografia-texto","mision-texto","vision-texto","descripcion-curso","competencia","metodologia"];

  function ses(a, b){ return [{titulo:a, archivos:[]}, {titulo:b, archivos:[]}]; }
  var unidadesIniciales = [
    {nombre:"Fundamentos de la ética y la moral",descripcion:"Fundamentos éticos que orientan la conducta humana y profesional.",archivos:[],sesiones:ses("Conceptos de ética y moral","Valores y principios morales")},
    {nombre:"Deontología y código de ética profesional",descripcion:"Deberes y responsabilidades del profesional de enfermería.",archivos:[],sesiones:ses("Concepto de deontología","Código de ética de enfermería")},
    {nombre:"Principios de la bioética",descripcion:"Aplicación de los principios bioéticos en el cuidado de la salud.",archivos:[],sesiones:ses("Autonomía y beneficencia","No maleficencia y justicia")},
    {nombre:"Valores y virtudes del profesional de enfermería",descripcion:"Importancia de los valores en la relación con el paciente.",archivos:[],sesiones:ses("Respeto y empatía","Responsabilidad y solidaridad")},
    {nombre:"Derechos del paciente y consentimiento informado",descripcion:"Protección de la dignidad y autonomía de los pacientes.",archivos:[],sesiones:ses("Derechos de los pacientes","Consentimiento informado")},
    {nombre:"Secreto profesional y confidencialidad",descripcion:"Protección de los datos personales y de salud.",archivos:[],sesiones:ses("Privacidad del paciente","Protección de información")},
    {nombre:"Dilemas éticos en el cuidado",descripcion:"Reflexión sobre conflictos éticos en enfermería.",archivos:[],sesiones:ses("Identificación de dilemas","Toma de decisiones")},
    {nombre:"Responsabilidad legal y ejercicio ético",descripcion:"Obligaciones legales y éticas del ejercicio profesional.",archivos:[],sesiones:ses("Responsabilidad profesional","Implicancias legales")}
  ];

  function agregarEstilos(){
    var st = document.createElement("style");
    st.textContent =
      ".unit .sesion{margin-top:16px;padding:14px 18px;background:#f7fcfb;border-left:5px solid var(--verde);border-radius:14px}" +
      ".unit .sesion h4{margin:0 0 4px;font-family:var(--serif);font-size:22px;color:var(--verde)}" +
      ".unit .docs{margin-top:10px;display:grid;gap:4px}" +
      ".unit .docs a{text-decoration:none;word-break:break-word}.unit .docs a:hover{text-decoration:underline}";
    document.head.appendChild(st);
  }

  function cargarLibreria(){
    return new Promise(function(resolver, rechazar){
      if(window.supabase){ resolver(); return; }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = function(){ resolver(); };
      s.onerror = function(){ rechazar(new Error("No se pudo cargar la librería de Supabase.")); };
      document.head.appendChild(s);
    });
  }

  function iconoArchivo(nombre, tipo){
    var ext = (String(nombre).split(".").pop() || "").toLowerCase();
    if((tipo || "").indexOf("image/") === 0) return "🖼️";
    if(ext === "pdf") return "📕";
    if(["doc","docx","odt","rtf"].indexOf(ext) >= 0) return "📘";
    if(["xls","xlsx","csv","ods"].indexOf(ext) >= 0) return "📗";
    if(["ppt","pptx","odp"].indexOf(ext) >= 0) return "📙";
    return "📄";
  }

  function bloqueDocs(archivos){
    var conUrl = (archivos || []).filter(function(a){ return a.url; });
    if(!conUrl.length) return null;
    var caja = document.createElement("div");
    caja.className = "docs";
    conUrl.forEach(function(archivo){
      var a = document.createElement("a");
      a.href = archivo.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = iconoArchivo(archivo.nombre, archivo.tipo) + " " + archivo.nombre;
      caja.appendChild(a);
    });
    return caja;
  }

  function mostrarUnidades(unidades){
    var contenedor = document.getElementById("lista-unidades");
    if(!contenedor) return;
    contenedor.replaceChildren();

    if(!unidades.length){
      var mensaje = document.createElement("p");
      mensaje.textContent = "Todavía no hay unidades registradas.";
      contenedor.appendChild(mensaje);
      return;
    }

    unidades.forEach(function(unidad, index){
      var tarjeta = document.createElement("article");
      tarjeta.className = "unit";

      var titulo = document.createElement("h3");
      titulo.textContent = "Unidad " + (index + 1) + ": " + unidad.nombre;
      tarjeta.appendChild(titulo);

      if(unidad.descripcion){
        var descripcion = document.createElement("p");
        descripcion.textContent = unidad.descripcion;
        tarjeta.appendChild(descripcion);
      }

      var docsUnidad = bloqueDocs(unidad.archivos);
      if(docsUnidad) tarjeta.appendChild(docsUnidad);

      (unidad.sesiones || []).forEach(function(sesion, i){
        var caja = document.createElement("div");
        caja.className = "sesion";
        var h = document.createElement("h4");
        h.textContent = "Sesión " + (i + 1) + ": " + sesion.titulo;
        caja.appendChild(h);
        if(sesion.descripcion){
          var p = document.createElement("p");
          p.textContent = sesion.descripcion;
          caja.appendChild(p);
        }
        var docs = bloqueDocs(sesion.archivos);
        if(docs) caja.appendChild(docs);
        tarjeta.appendChild(caja);
      });

      contenedor.appendChild(tarjeta);
    });
  }

  async function cargarContenido(cliente){
    var r = await cliente.from("contenido").select("campo,valor");
    if(r.error) throw r.error;
    (r.data || []).forEach(function(fila){
      if(CAMPOS.indexOf(fila.campo) < 0) return;
      var el = document.getElementById(fila.campo);
      if(el && typeof fila.valor === "string" && fila.valor.trim() !== ""){
        el.textContent = fila.valor;
      }
    });
  }

  function conUrl(cliente, meta){
    var partes = String(meta.ruta || "").split("/");
    var bucket = partes.shift();
    var path = partes.join("/");
    return {
      nombre: meta.nombre,
      tipo: meta.tipo,
      url: cliente.storage.from(bucket).getPublicUrl(path).data.publicUrl
    };
  }

  async function cargarUnidades(cliente){
    var u = await cliente.from("unidades").select("*").order("orden", {ascending:true});
    if(u.error) throw u.error;
    var unidades = u.data || [];

    var sesiones = [], archivos = [];
    if(unidades.length){
      var ids = unidades.map(function(x){ return x.id; });
      var s = await cliente.from("sesiones").select("*").in("unidad_id", ids).order("orden", {ascending:true});
      if(s.error) throw s.error;
      sesiones = s.data || [];
      var a = await cliente.from("archivos").select("*").in("unidad_id", ids).order("creado_en", {ascending:true});
      if(a.error) throw a.error;
      archivos = a.data || [];
    }

    unidades.forEach(function(unidad){
      unidad.archivos = archivos.filter(function(x){ return x.unidad_id === unidad.id && !x.sesion_id; }).map(function(m){ return conUrl(cliente, m); });
      unidad.sesiones = sesiones.filter(function(x){ return x.unidad_id === unidad.id; }).map(function(se){
        se.archivos = archivos.filter(function(x){ return x.sesion_id === se.id; }).map(function(m){ return conUrl(cliente, m); });
        return se;
      });
    });

    mostrarUnidades(unidades);
  }

  async function iniciar(){
    agregarEstilos();
    try{
      await cargarLibreria();
      var cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      var resultados = await Promise.allSettled([cargarContenido(cliente), cargarUnidades(cliente)]);
      resultados.forEach(function(r){ if(r.status === "rejected") console.error("Error de Supabase:", r.reason); });
      if(resultados[1].status === "rejected") mostrarUnidades(unidadesIniciales);
    }catch(error){
      console.error(error);
      mostrarUnidades(unidadesIniciales);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
