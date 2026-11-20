/* Carga el contenido y las unidades del portafolio desde Supabase.
   Reemplaza al mostrar-unidades.js anterior (que usaba localStorage). */
(function(){
  var SUPABASE_URL = "https://jyxohnsvqhhnxcmkwfgg.supabase.co";
  var SUPABASE_KEY = "sb_publishable_3La-D-KSxaVYsSYNmd6SSA_M4XkieaD";

  var CAMPOS = ["curso-portada","institucion","estudiante","biografia-texto","mision-texto","vision-texto","descripcion-curso","competencia","metodologia"];

  var unidadesIniciales = [
    {nombre:"Fundamentos de la ética y la moral",sesion1:"Conceptos de ética y moral",sesion2:"Valores y principios morales",descripcion:"Fundamentos éticos que orientan la conducta humana y profesional."},
    {nombre:"Deontología y código de ética profesional",sesion1:"Concepto de deontología",sesion2:"Código de ética de enfermería",descripcion:"Deberes y responsabilidades del profesional de enfermería."},
    {nombre:"Principios de la bioética",sesion1:"Autonomía y beneficencia",sesion2:"No maleficencia y justicia",descripcion:"Aplicación de los principios bioéticos en el cuidado de la salud."},
    {nombre:"Valores y virtudes del profesional de enfermería",sesion1:"Respeto y empatía",sesion2:"Responsabilidad y solidaridad",descripcion:"Importancia de los valores en la relación con el paciente."},
    {nombre:"Derechos del paciente y consentimiento informado",sesion1:"Derechos de los pacientes",sesion2:"Consentimiento informado",descripcion:"Protección de la dignidad y autonomía de los pacientes."},
    {nombre:"Secreto profesional y confidencialidad",sesion1:"Privacidad del paciente",sesion2:"Protección de información",descripcion:"Protección de los datos personales y de salud."},
    {nombre:"Dilemas éticos en el cuidado",sesion1:"Identificación de dilemas",sesion2:"Toma de decisiones",descripcion:"Reflexión sobre conflictos éticos en enfermería."},
    {nombre:"Responsabilidad legal y ejercicio ético",sesion1:"Responsabilidad profesional",sesion2:"Implicancias legales",descripcion:"Obligaciones legales y éticas del ejercicio profesional."}
  ];

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

      var sesion1 = document.createElement("p");
      sesion1.textContent = "Sesión 1: " + (unidad.sesion1 || "Por definir");

      var sesion2 = document.createElement("p");
      sesion2.textContent = "Sesión 2: " + (unidad.sesion2 || "Por definir");

      var descripcion = document.createElement("p");
      descripcion.textContent = unidad.descripcion || "";

      tarjeta.append(titulo, sesion1, sesion2, descripcion);

      (unidad.archivos || []).forEach(function(archivo){
        if(!archivo.url) return;
        var p = document.createElement("p");
        var a = document.createElement("a");
        a.href = archivo.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = iconoArchivo(archivo.nombre, archivo.tipo) + " " + archivo.nombre;
        p.appendChild(a);
        tarjeta.appendChild(p);
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

  async function cargarUnidades(cliente){
    var u = await cliente.from("unidades").select("*").order("orden", {ascending:true});
    if(u.error) throw u.error;
    var unidades = u.data || [];

    var archivos = [];
    if(unidades.length){
      var ids = unidades.map(function(x){ return x.id; });
      var a = await cliente.from("archivos").select("*").in("unidad_id", ids).order("creado_en", {ascending:true});
      if(a.error) throw a.error;
      archivos = a.data || [];
    }

    unidades.forEach(function(unidad){
      unidad.archivos = archivos.filter(function(x){ return x.unidad_id === unidad.id; }).map(function(meta){
        var partes = String(meta.ruta || "").split("/");
        var bucket = partes.shift();
        var path = partes.join("/");
        var url = cliente.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        return {nombre: meta.nombre, tipo: meta.tipo, url: url};
      });
    });

    mostrarUnidades(unidades);
  }

  async function iniciar(){
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
