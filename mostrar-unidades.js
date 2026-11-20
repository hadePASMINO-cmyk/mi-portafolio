
const unidadesIniciales = [
  {
    id:"u1",
    nombre:"Fundamentos de la ética y la moral",
    sesion1:"Conceptos de ética y moral",
    sesion2:"Valores y principios morales",
    descripcion:"Fundamentos éticos que orientan la conducta humana y profesional."
  },
  {
    id:"u2",
    nombre:"Deontología y código de ética profesional",
    sesion1:"Concepto de deontología",
    sesion2:"Código de ética de enfermería",
    descripcion:"Deberes y responsabilidades del profesional de enfermería."
  },
  {
    id:"u3",
    nombre:"Principios de la bioética",
    sesion1:"Autonomía y beneficencia",
    sesion2:"No maleficencia y justicia",
    descripcion:"Aplicación de los principios bioéticos en el cuidado de la salud."
  },
  {
    id:"u4",
    nombre:"Valores y virtudes del profesional de enfermería",
    sesion1:"Respeto y empatía",
    sesion2:"Responsabilidad y solidaridad",
    descripcion:"Importancia de los valores en la relación con el paciente."
  },
  {
    id:"u5",
    nombre:"Derechos del paciente y consentimiento informado",
    sesion1:"Derechos de los pacientes",
    sesion2:"Consentimiento informado",
    descripcion:"Protección de la dignidad y autonomía de los pacientes."
  },
  {
    id:"u6",
    nombre:"Secreto profesional y confidencialidad",
    sesion1:"Privacidad del paciente",
    sesion2:"Protección de información",
    descripcion:"Protección de los datos personales y de salud."
  },
  {
    id:"u7",
    nombre:"Dilemas éticos en el cuidado",
    sesion1:"Identificación de dilemas",
    sesion2:"Toma de decisiones",
    descripcion:"Reflexión sobre conflictos éticos en enfermería."
  },
  {
    id:"u8",
    nombre:"Responsabilidad legal y ejercicio ético",
    sesion1:"Responsabilidad profesional",
    sesion2:"Implicancias legales",
    descripcion:"Obligaciones legales y éticas del ejercicio profesional."
  }
];

function obtenerUnidades(){
  try{
    const guardadas=localStorage.getItem("portafolio_unidades");

    if(guardadas===null){
      localStorage.setItem("portafolio_unidades",JSON.stringify(unidadesIniciales));
      return unidadesIniciales;
    }

    const datos=JSON.parse(guardadas);
    return Array.isArray(datos)?datos:unidadesIniciales;
  }catch(error){
    return unidadesIniciales;
  }
}

function mostrarUnidades(){
  const contenedor=document.getElementById("lista-unidades");
  if(!contenedor)return;

  contenedor.replaceChildren();
  const unidades=obtenerUnidades();

  if(unidades.length===0){
    const mensaje=document.createElement("p");
    mensaje.textContent="Todavía no hay unidades registradas.";
    contenedor.appendChild(mensaje);
    return;
  }

  unidades.forEach((unidad,index)=>{
    const tarjeta=document.createElement("article");
    tarjeta.className="unit";

    const titulo=document.createElement("h3");
    titulo.textContent="Unidad "+(index+1)+": "+unidad.nombre;

    const sesion1=document.createElement("p");
    sesion1.textContent="Sesión 1: "+(unidad.sesion1||"Por definir");

    const sesion2=document.createElement("p");
    sesion2.textContent="Sesión 2: "+(unidad.sesion2||"Por definir");

    const descripcion=document.createElement("p");
    descripcion.textContent=unidad.descripcion||"";

    tarjeta.append(titulo,sesion1,sesion2,descripcion);
    contenedor.appendChild(tarjeta);
  });
}

document.addEventListener("DOMContentLoaded",mostrarUnidades);

window.addEventListener("storage",function(evento){
  if(evento.key==="portafolio_unidades"){
    mostrarUnidades();
  }
});
