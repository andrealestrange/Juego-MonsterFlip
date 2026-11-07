/* MONSTER FLIP - Taller de Vanilla JS y DOM
   Reglas integradas: B (intercambio), C (hielo) y D (inversión).
   Conceptos: 1 variables, 2 condiciones, 3 arreglos, 4 objetos,
   5 funciones, 6 eventos, 7 DOM. */


// VARIABLES Y TIPOS PRIMITIVOS
// Guardan el estado de la partida: number, boolean y string.
let turnoActual = 0;
let jugadasExitosas = 0;
let cartasDestapadas = 0;
let jugadorCongelado = -1;
let modoInvertido = false;
let juegoTerminado = false;
const TITULO = "Monster Flip";


// ARREGLOS Y OBJETOS LITERALES
// Arreglo de objetos: cada monstruo tiene nombre, imagen, puntos y si congela.
// Yeti y Rey Escarcha son los de la Regla C.
const monstruos = [
  { nombre: "Boolardo",      imagen: "img/boolardo.png",      puntos: 1, congela: false },
  { nombre: "Pedro Cerebro", imagen: "img/pedro-cerebro.png", puntos: 2, congela: false },
  { nombre: "Drácula",       imagen: "img/dracula.png",       puntos: 3, congela: false },
  { nombre: "Fafnir",        imagen: "img/fafnir.png",        puntos: 5, congela: false },
  { nombre: "Zorgon",        imagen: "img/zorgon.png",        puntos: 2, congela: false },
  { nombre: "Metalón 3000",  imagen: "img/metalon-3000.png",  puntos: 3, congela: false },
  { nombre: "Don Murci",     imagen: "img/don-murci.png",     puntos: 1, congela: false },
  { nombre: "Aracne",        imagen: "img/aracne.png",        puntos: 2, congela: false },
  { nombre: "Fenrir",        imagen: "img/fenrir.png",        puntos: 4, congela: false },
  { nombre: "Grendel",       imagen: "img/grendel.png",       puntos: 4, congela: false },
  { nombre: "Reptilón",      imagen: "img/reptilon.png",      puntos: 5, congela: false },
  { nombre: "Cthulhu",       imagen: "img/cthulhu.png",       puntos: 3, congela: false },
  { nombre: "Don Aguijón",   imagen: "img/don-aguijon.png",   puntos: 2, congela: false },
  { nombre: "La Catrina",    imagen: "img/la-catrina.png",    puntos: 1, congela: false },
  { nombre: "Yeti",          imagen: "img/yeti.png",          puntos: 0, congela: true },
  { nombre: "Rey Escarcha",  imagen: "img/rey-escarcha.png",  puntos: 0, congela: true }
];

// Arreglo de objetos con los dos jugadores.
const jugadores = [
  { nombre: "Jugador 1", puntos: 0 },
  { nombre: "Jugador 2", puntos: 0 }
];

// Arreglo lógico del tablero: cada posición guarda un monstruo y si está destapada.
// El DOM solo muestra lo que dice este arreglo, nunca se usa como base de datos.
let tablero = [];
let ultimoIntercambio = [];
let cartasDOM = [];


// FUNCIONES
// Función flecha: mezcla un arreglo con el algoritmo Fisher-Yates.
const mezclar = (arreglo) => {
  for (let i = arreglo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporal = arreglo[i];
    arreglo[i] = arreglo[j];
    arreglo[j] = temporal;
  }
  return arreglo;
};


// MANIPULACIÓN DEL DOM
// Cambia el texto de la caja de mensajes con textContent.
const mostrarMensaje = (texto) => {
  document.getElementById("mensaje").textContent = texto;
};

// Actualiza puntajes, turno activo y estadísticas con textContent y classList.
// Usa un ternario (concepto 2) para el texto del modo de victoria.
const actualizarPanel = () => {
  document.getElementById("puntos1").textContent = jugadores[0].puntos;
  document.getElementById("puntos2").textContent = jugadores[1].puntos;
  document.getElementById("jugador1").classList.toggle("activo", turnoActual === 0);
  document.getElementById("jugador2").classList.toggle("activo", turnoActual === 1);

  document.getElementById("statCartas").textContent = `${cartasDestapadas} de ${tablero.length}`;
  document.getElementById("statJugadas").textContent = jugadasExitosas;
  document.getElementById("statIntercambio").textContent = `en ${4 - (jugadasExitosas % 4)} jugada(s)`;

  const statModo = document.getElementById("statModo");
  statModo.textContent = modoInvertido ? "Menos puntos" : "Más puntos";
  statModo.classList.toggle("invertido", modoInvertido);
};

// Función declarada: crea el tablero lógico con los monstruos mezclados.
function crearTablero() {
  tablero = [];
  const mezclados = mezclar([...monstruos]);
  for (let i = 0; i < mezclados.length; i++) {
    tablero.push({ monstruo: mezclados[i], destapada: false });
  }
}


// EVENTOS Y MANIPULACIÓN DEL DOM
// Crea un div por cada carta con createElement (sin innerHTML)
// y le asigna un evento click que llama a destaparCarta.
function crearCartasDOM() {
  const contenedor = document.getElementById("tablero");
  contenedor.textContent = "";
  cartasDOM = [];

  for (let i = 0; i < tablero.length; i++) {
    const carta = document.createElement("div");
    carta.classList.add("carta");

    const interna = document.createElement("div");
    interna.classList.add("carta-interna");

    const dorso = document.createElement("div");
    dorso.classList.add("cara", "dorso");
    dorso.textContent = "?";

    const frente = document.createElement("div");
    frente.classList.add("cara", "frente");

    const imagen = document.createElement("img");
    imagen.classList.add("imagen-monstruo");
    const nombre = document.createElement("span");
    nombre.classList.add("nombre");
    const puntos = document.createElement("span");
    puntos.classList.add("puntos-carta");

    frente.appendChild(imagen);
    frente.appendChild(nombre);
    frente.appendChild(puntos);
    interna.appendChild(dorso);
    interna.appendChild(frente);
    carta.appendChild(interna);

    carta.addEventListener("click", () => destaparCarta(i));

    contenedor.appendChild(carta);
    cartasDOM.push(carta);
  }
}

// Refleja en pantalla lo que dice el arreglo lógico.
// Solo las cartas destapadas muestran su monstruo.
function actualizarCartas() {
  for (let i = 0; i < tablero.length; i++) {
    const carta = cartasDOM[i];
    const datos = tablero[i];
    const imagen = carta.querySelector(".imagen-monstruo");

    carta.classList.toggle("destapada", datos.destapada);
    carta.classList.toggle("hielo", datos.destapada && datos.monstruo.congela);
    carta.classList.toggle("intercambiada", ultimoIntercambio.includes(i));

    if (datos.destapada) {
      imagen.src = datos.monstruo.imagen;
      imagen.alt = datos.monstruo.nombre;
      carta.querySelector(".nombre").textContent = datos.monstruo.nombre;
      carta.querySelector(".puntos-carta").textContent = `${datos.monstruo.puntos} pts`;
    } else {
      imagen.removeAttribute("src");
      imagen.alt = "";
      carta.querySelector(".nombre").textContent = "";
      carta.querySelector(".puntos-carta").textContent = "";
    }
  }
}


// REGLA B: INTERCAMBIO DE CARTAS
// Cada 4 jugadas exitosas se llama esta función: intercambia dos cartas
// distintas al azar en el arreglo lógico y guarda sus posiciones para resaltarlas.
function intercambiarCartas() {
  const a = Math.floor(Math.random() * tablero.length);
  let b = Math.floor(Math.random() * tablero.length);
  while (b === a) {
    b = Math.floor(Math.random() * tablero.length);
  }
  const temporal = tablero[a];
  tablero[a] = tablero[b];
  tablero[b] = temporal;
  ultimoIntercambio = [a, b];
}


// REGLA D: INVERSIÓN DE LA VICTORIA
// Decide quién va ganando: antes de la mitad gana quien tenga más puntos,
// después de la mitad gana quien tenga menos.
function quienVaGanando() {
  const p1 = jugadores[0].puntos;
  const p2 = jugadores[1].puntos;

  if (p1 === p2) {
    return "Empate";
  }

  let lider;
  if (modoInvertido) {
    lider = p1 < p2 ? jugadores[0] : jugadores[1];
  } else {
    lider = p1 > p2 ? jugadores[0] : jugadores[1];
  }
  return lider.nombre;
}


// REGLA C: TURNO CONGELADO
// Pasa el turno al otro jugador. Si ese jugador está congelado,
// pierde su turno y el fondo rojo se quita.
function cambiarTurno() {
  let siguiente = 1 - turnoActual;
  let aviso = "";

  if (jugadorCongelado === siguiente) {
    aviso = ` ${jugadores[siguiente].nombre} estaba congelado y pierde su turno.`;
    jugadorCongelado = -1;
    document.body.classList.remove("ronda-roja");
    siguiente = turnoActual;
  }

  turnoActual = siguiente;
  return aviso;
}

// Termina la partida, quita el fondo rojo y muestra el resultado final.
function terminarJuego() {
  juegoTerminado = true;
  document.body.classList.remove("ronda-roja");
  const ganador = quienVaGanando();
  const resultado = ganador === "Empate" ? "¡Empate!" : `¡Gana ${ganador}!`;
  mostrarMensaje(`Fin del juego. ${resultado}`);
}


// ESTRUCTURAS DE CONTROL Y CONDICIONES
// Función principal: se ejecuta al hacer clic en una carta y decide con if / else
// qué pasa. Aquí se aplican las reglas B, C y D.
function destaparCarta(indice) {
  if (juegoTerminado) {
    return;
  }
  if (tablero[indice].destapada) {
    return;
  }

  ultimoIntercambio = [];

  const carta = tablero[indice];
  const monstruo = carta.monstruo;
  const jugador = jugadores[turnoActual];
  let texto = "";

  carta.destapada = true;
  cartasDestapadas++;

  // Sonido del volteo: respeta el botón de silencio de la música.
  sonidoVoltear.muted = musica.muted;
  sonidoVoltear.currentTime = 0;
  sonidoVoltear.play();

  // Regla C: el monstruo de hielo no suma puntos, congela y pone el fondo rojo.
  // Si no congela, suma puntos y cuenta como jugada exitosa.
  if (monstruo.congela) {
    jugadorCongelado = turnoActual;
    document.body.classList.add("ronda-roja");
    texto = `${jugador.nombre} destapó a ${monstruo.nombre} y queda congelado en su próximo turno.`;
  } else {
    jugador.puntos += monstruo.puntos;
    jugadasExitosas++;
    texto = `${jugador.nombre} destapó a ${monstruo.nombre} y gana ${monstruo.puntos} punto(s).`;

    // Regla B: cada 4 jugadas exitosas se intercambian dos cartas.
    if (jugadasExitosas % 4 === 0) {
      intercambiarCartas();
      texto += " ¡Dos cartas se intercambiaron de lugar!";
    }
  }

  // Regla D: al llegar a la mitad del tablero se invierte la victoria.
  if (!modoInvertido && cartasDestapadas === tablero.length / 2) {
    modoInvertido = true;
    texto += " ¡MITAD DEL TABLERO! Ahora gana quien tenga MENOS puntos.";
  }

  actualizarCartas();

  // Si ya están todas destapadas, termina la partida.
  if (cartasDestapadas === tablero.length) {
    actualizarPanel();
    terminarJuego();
    return;
  }

  texto += cambiarTurno();
  actualizarPanel();
  mostrarMensaje(`${texto} Turno de ${jugadores[turnoActual].nombre}. Va ganando: ${quienVaGanando()}.`);
}

// Reinicia todas las variables y arranca una partida nueva.
function reiniciarJuego() {
  turnoActual = 0;
  jugadasExitosas = 0;
  cartasDestapadas = 0;
  jugadorCongelado = -1;
  modoInvertido = false;
  juegoTerminado = false;
  ultimoIntercambio = [];
  jugadores[0].puntos = 0;
  jugadores[1].puntos = 0;
  document.body.classList.remove("ronda-roja");

  crearTablero();
  crearCartasDOM();
  actualizarCartas();
  actualizarPanel();
  mostrarMensaje(`Empieza ${jugadores[0].nombre}. Ahora gana quien tenga MÁS puntos.`);
}


// EVENTOS DEL NAVEGADOR
// Se cambia el título de la pestaña y se guardan referencias a los
// elementos de audio y a la ventana de instrucciones.
// La música se activa o se apaga con la propiedad muted.
document.title = TITULO;

const musica = document.getElementById("musica");
const sonidoVoltear = document.getElementById("sonidoVoltear");
const btnMusica = document.getElementById("btnMusica");
const ventanaInstrucciones = document.getElementById("instrucciones");
musica.volume = 0.4;

// Evento click del botón Jugar: cierra la bienvenida y activa la música.
document.getElementById("btnJugar").addEventListener("click", () => {
  document.getElementById("bienvenida").classList.add("oculta");
  musica.muted = false;
  musica.play();
  btnMusica.textContent = "🔊";
});

// Evento click del botón de música: silencia o activa el sonido.
btnMusica.addEventListener("click", () => {
  musica.muted = !musica.muted;
  btnMusica.textContent = musica.muted ? "🔇" : "🔊";
});

// Evento click del botón Reiniciar: empieza una partida nueva.
document.getElementById("btnReiniciar").addEventListener("click", reiniciarJuego);

// Eventos click para abrir y cerrar la ventana de instrucciones.
document.getElementById("btnInstrucciones").addEventListener("click", () => {
  ventanaInstrucciones.classList.remove("oculta");
});

document.getElementById("btnCerrar").addEventListener("click", () => {
  ventanaInstrucciones.classList.add("oculta");
});

// Clic en el fondo oscuro (fuera de la tarjeta) también cierra la ventana.
ventanaInstrucciones.addEventListener("click", (evento) => {
  if (evento.target === ventanaInstrucciones) {
    ventanaInstrucciones.classList.add("oculta");
  }
});

// Evento keydown: la tecla Escape cierra la ventana de instrucciones.
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    ventanaInstrucciones.classList.add("oculta");
  }
});

// Crea la primera partida al cargar la página.
reiniciarJuego();