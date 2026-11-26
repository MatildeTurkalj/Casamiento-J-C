// Al recargar, volver siempre al inicio de la invitación
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
});
/* Cecilia Matus & José Antonio Fresco — invitación de boda */

const FECHA_BODA = new Date("2027-02-13T00:00:00");
const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Los IDs de cada unidad mantienen el contador HTML conectado con estos valores. */
function actualizarCuentaRegresiva() {
    const diferencia = FECHA_BODA.getTime() - Date.now();
    const valoresContador = diferencia <= 0
        ? {
            "contador-dias": "00",
            "contador-horas": "00",
            "contador-minutos": "00",
            "contador-segundos": "00"
        }
        : {
            "contador-dias": String(Math.floor(diferencia / 86400000)),
            "contador-horas": String(Math.floor(diferencia / 3600000) % 24).padStart(2, "0"),
            "contador-minutos": String(Math.floor(diferencia / 60000) % 60).padStart(2, "0"),
            "contador-segundos": String(Math.floor(diferencia / 1000) % 60).padStart(2, "0")
        };

    Object.entries(valoresContador).forEach(([idContador, valor]) => {
        const elementoContador = document.getElementById(idContador);
        if (elementoContador) elementoContador.textContent = valor;
    });
}

/* Revela cada bloque al entrar en pantalla y muestra todo si no hay IntersectionObserver. */
function prepararRevelaciones() {
    const elementos = document.querySelectorAll(
        ".seccion, .cronograma-evento, .tarjeta-evento, .opcion-regalo, .contenedor-dresscode"
    );

    if (!("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => elemento.classList.add("revelado"));
        return;
    }

    const observador = new IntersectionObserver((entradas, observer) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("revelado");
            observer.unobserve(entrada.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    elementos.forEach((elemento, indice) => {
        elemento.classList.add("revelacion");
        elemento.style.setProperty("--retraso-revelacion", `${Math.min(indice % 5, 4) * 90}ms`);
        observador.observe(elemento);
    });

    document.body.classList.add("animaciones-listas");
}

/* Mantiene el contenido inerte mientras el sobre actúa como diálogo de apertura. */
function prepararApertura() {
    const sello = document.getElementById("sello-apertura");
    const apertura = document.getElementById("apertura");
    const texto = document.getElementById("apertura-texto");
    const portada = document.getElementById("inicio");
    const comenzar = document.getElementById("comenzar-invitacion");

    if (!sello || !apertura || !texto || !portada || !comenzar) return;
    const sobre = apertura.querySelector(".sobre-antiguo");
    if (!sobre) return;

    const contenidoBloqueado = Array.from(
        document.querySelectorAll("#contenido-principal > *")
    ).filter((elemento) => elemento !== apertura);
    const pie = document.querySelector(".tana-footer");
    let etapa = "sobre-cerrado";

    const bloquearContenido = () => {
        contenidoBloqueado.forEach((elemento) => { elemento.inert = true; });
        if (pie) pie.inert = true;
    };

    const mostrarPortada = (animar = true) => {
        if (etapa === "portada") return;
        etapa = "portada";
        portada.inert = false;


        portada.classList.add("portada-emergente");

        if (!animar || movimientoReducido.matches) {
            portada.classList.add("portada-sin-animacion");
        }

        apertura.classList.add("apertura-retirando");
const retirarApertura = () => {
    apertura.hidden = true;
    comenzar.focus({ preventScroll: true });

    // Comienza a escribirse el nombre al entrar a la portada
    iniciarEscrituraNombres();
};

        if (animar && !movimientoReducido.matches) {
            window.setTimeout(retirarApertura, 680);
        } else {
            retirarApertura();
        }
    };

    bloquearContenido();

    sello.addEventListener("click", () => {
        if (etapa !== "sobre-cerrado") return;
        etapa = "abriendo-sobre";
        sello.disabled = true;
        sello.setAttribute("aria-pressed", "true");
        apertura.classList.add("sobre-abierto");
        texto.textContent = "La invitación está saliendo del sobre.";

        if (movimientoReducido.matches) {
            mostrarPortada(false);
            return;
        }

        window.setTimeout(() => mostrarPortada(true), 1050);
    });

    comenzar.addEventListener("click", () => {
        if (!document.body.classList.contains("intro-activa")) return;

        document.body.classList.remove("intro-activa");
        contenidoBloqueado.forEach((elemento) => { elemento.inert = false; });
        if (pie) pie.inert = false;
        portada.classList.remove("portada-emergente", "portada-sin-animacion");
        portada.hidden = true;
    });
}

/* Actualiza el audio y el estado accesible del botón según los eventos del reproductor. */
function prepararMusica() {
    const musica = document.getElementById("musica-boda");
    const boton = document.getElementById("boton-musica");
    if (!musica || !boton) return;

    musica.addEventListener("play", () => {
        boton.setAttribute("aria-pressed", "true");
        boton.querySelector(".icono-musica").textContent = "❚❚";
        boton.querySelector(".texto-musica").textContent = "Pausar música";
    });

    musica.addEventListener("pause", () => {
        boton.setAttribute("aria-pressed", "false");
        boton.querySelector(".icono-musica").textContent = "▶";
        boton.querySelector(".texto-musica").textContent = "Escuchar nuestra canción";
    });

    boton.addEventListener("click", async () => {
        if (!musica.paused) {
            musica.pause();
            return;
        }

        try {
            await musica.play();
        } catch (error) {
            if (musica.paused && error && error.name === "AbortError") return;
            console.error("No se pudo reproducir la canción de la invitación:", error);
            boton.querySelector(".texto-musica").textContent = "No se pudo reproducir";
            window.setTimeout(() => {
                if (musica.paused) boton.querySelector(".texto-musica").textContent = "Escuchar nuestra canción";
            }, 2400);
        }
    });
}

/* Genera decoración aleatoria, marcada como contenido oculto para tecnologías de asistencia. */
function crearElementosBosque() {
    if (movimientoReducido.matches || document.querySelector(".elementos-bosque")) return;

    const capa = document.createElement("div");
    capa.className = "elementos-bosque";
    capa.setAttribute("aria-hidden", "true");

    const grupos = [
        { clase: "luciernaga", cantidad: 15, duracion: 11 },
        { clase: "particula-dorada", cantidad: 12, duracion: 15 },
        { clase: "hoja-bosque", cantidad: 6, duracion: 17 },
        { clase: "petalo", cantidad: 5, duracion: 20 },
        { clase: "destello", cantidad: 5, duracion: 4 }
    ];

    grupos.forEach(({ clase, cantidad, duracion }) => {
        for (let indice = 0; indice < cantidad; indice += 1) {
            const elemento = document.createElement("span");
            elemento.className = clase;
            elemento.style.setProperty("--posicion-x", `${5 + Math.random() * 90}%`);
            elemento.style.setProperty("--posicion-y", `${8 + Math.random() * 82}%`);
            elemento.style.setProperty("--duracion-ambiente", `${duracion + Math.random() * duracion * 0.8}s`);
            elemento.style.setProperty("--demora-ambiente", `${Math.random() * -duracion}s`);
            elemento.style.setProperty("--deriva-x", `${Math.round(Math.random() * 90 - 45)}px`);
            elemento.style.setProperty("--deriva-y", `${Math.round(Math.random() * 70 - 35)}px`);
            capa.appendChild(elemento);
        }
    });

    document.body.appendChild(capa);
}

/* Activa el ambiente recién cuando la cuenta regresiva entra en el área visible. */
function prepararBosqueEncantado() {
    const inicioDelBosque = document.getElementById("cuenta-regresiva");
    if (!inicioDelBosque) return;

    let iniciado = false;
    const activarBosque = () => {
        if (iniciado) return;
        iniciado = true;
        document.body.classList.add("bosque-activo");
        crearElementosBosque();
    };

    if (!("IntersectionObserver" in window)) {
        const comprobarInicio = () => {
            const limites = inicioDelBosque.getBoundingClientRect();
            if (limites.top > window.innerHeight * 1.15 || limites.bottom < 0) return;
            activarBosque();
            window.removeEventListener("scroll", comprobarInicio);
        };

        window.addEventListener("scroll", comprobarInicio, { passive: true });
        comprobarInicio();
        return;
    }

    const observador = new IntersectionObserver((entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        activarBosque();
        observador.disconnect();
    }, { rootMargin: "15% 0px" });

    observador.observe(inicioDelBosque);
}

/* Agrupa las lecturas del puntero en un solo frame para mantener fluida la portada. */
function prepararParallaxDePortada() {
    if (movimientoReducido.matches || !window.matchMedia("(pointer: fine)").matches) return;

    const portada = document.querySelector(".portada");
    if (!portada) return;

    let cuadroPendiente = false;
    let coordenadas = { x: 0, y: 0 };

    portada.addEventListener("pointermove", (evento) => {
        coordenadas = {
            x: (evento.clientX / window.innerWidth - 0.5) * 8,
            y: (evento.clientY / window.innerHeight - 0.5) * 8
        };

        if (cuadroPendiente) return;
        cuadroPendiente = true;
        window.requestAnimationFrame(() => {
            portada.style.setProperty("--parallax-x", `${coordenadas.x}px`);
            portada.style.setProperty("--parallax-y", `${coordenadas.y}px`);
            cuadroPendiente = false;
        });
    });
}

/* El carrusel solo rota automáticamente cuando está visible, sin foco y sin movimiento reducido. */
function prepararCarrusel() {
    const fotografias = [
        "IMG/jc1.jpeg",
        "IMG/jc2.jpeg",
        "IMG/jc3.jpeg",
        "IMG/jc4.jpeg",
        "IMG/jc5.jpeg"
    ];
    const contenido = document.getElementById("carrusel-contenido");
    const carrusel = document.getElementById("carrusel");
    const contador = document.getElementById("carrusel-contador");
    const anterior = document.querySelector(".carrusel-anterior");
    const siguiente = document.querySelector(".carrusel-siguiente");
    const controles = [anterior, siguiente].filter(Boolean);
    if (!contenido || fotografias.length === 0) {
        controles.forEach((control) => {
            control.disabled = true;
            control.setAttribute("aria-disabled", "true");
            control.hidden = true;
        });
        return;
    }

    let fotoActual = 0;
    let temporizadorCambio;
    const mostrarFotografia = (conTransicion = false) => {
        window.clearTimeout(temporizadorCambio);
        const actualizarImagen = () => {
            const imagen = document.createElement("img");
            imagen.src = fotografias[fotoActual];
            imagen.alt = `Recuerdo ${fotoActual + 1} de Cecilia y José`;
            imagen.loading = "eager";
            contenido.replaceChildren(imagen);
            contenido.classList.remove("carrusel-cambiando");
            if (contador) contador.textContent = `Recuerdo ${fotoActual + 1} de ${fotografias.length}`;
        };

        if (!conTransicion || movimientoReducido.matches) {
            actualizarImagen();
            return;
        }

        contenido.classList.add("carrusel-cambiando");
        temporizadorCambio = window.setTimeout(actualizarImagen, 650);
    };

    const avanzar = (direccion) => {
        if (!fotografias.length) return;
        fotoActual = (fotoActual + direccion + fotografias.length) % fotografias.length;
        mostrarFotografia(true);
    };

    anterior.addEventListener("click", () => {
        avanzar(-1);
    });
    siguiente.addEventListener("click", () => {
        avanzar(1);
    });
    mostrarFotografia();

    if (!carrusel) return;
    let intervaloCambio;
    let carruselVisible = !("IntersectionObserver" in window);
    const actualizarRotacion = () => {
        const debeRotar = carruselVisible
            && !movimientoReducido.matches
            && !carrusel.contains(document.activeElement);

        if (debeRotar && !intervaloCambio) {
            intervaloCambio = window.setInterval(() => avanzar(1), 5000);
        } else if (!debeRotar && intervaloCambio) {
            window.clearInterval(intervaloCambio);
            intervaloCambio = undefined;
        }
    };

    carrusel.addEventListener("focusin", actualizarRotacion);
    carrusel.addEventListener("focusout", actualizarRotacion);

    if ("IntersectionObserver" in window) {
        const observador = new IntersectionObserver((entradas) => {
            carruselVisible = entradas.some((entrada) => entrada.isIntersecting);
            actualizarRotacion();
        });
        observador.observe(carrusel);
    }

    actualizarRotacion();
}

/* Usa la API moderna del portapapeles y conserva compatibilidad con navegadores antiguos. */
async function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
        return;
    }

    const campoTemporal = document.createElement("textarea");
    campoTemporal.value = texto;
    campoTemporal.setAttribute("readonly", "");
    campoTemporal.style.position = "fixed";
    campoTemporal.style.opacity = "0";
    document.body.appendChild(campoTemporal);
    campoTemporal.select();
    const copiado = document.execCommand("copy");
    campoTemporal.remove();
    if (!copiado) throw new Error("El navegador no permitió copiar al portapapeles.");
}

/* Copia el alias bancario y comunica el resultado en el mismo botón. */
function prepararCopiaDeAlias() {
    const boton = document.getElementById("copiar-alias");
    const alias = document.getElementById("alias-regalo");
    if (!boton || !alias) return;

    boton.addEventListener("click", async () => {
        try {
            await copiarTexto(alias.textContent.trim());
            boton.textContent = "¡Alias copiado!";
        } catch (error) {
            console.error("No se pudo copiar el alias:", error);
            boton.textContent = "No se pudo copiar";
        }

        window.setTimeout(() => {
            boton.textContent = "Copiar alias";
        }, 2200);
    });
}

/* Completa el año actual del crédito del footer. */
function prepararAno() {
    const anioActual = document.getElementById("anio-actual");
    if (anioActual) anioActual.textContent = String(new Date().getFullYear());
}

/* Añade un pulso visual breve a los controles interactivos. */
function prepararInteracciones() {
    const botones = document.querySelectorAll(
        ".boton-comenzar, .boton-principal, .boton-ubicacion, .boton-musica, .boton-copiar-alias"
    );

    botones.forEach((boton) => {
        boton.addEventListener("pointerdown", () => {
            boton.classList.remove("pulso-interaccion");
            window.requestAnimationFrame(() => boton.classList.add("pulso-interaccion"));
        });
        boton.addEventListener("animationend", () => boton.classList.remove("pulso-interaccion"));
    });
}

/* Inicializa cada componente una vez que el documento está disponible. */
function iniciarInvitacion() {
    actualizarCuentaRegresiva();
    window.setInterval(actualizarCuentaRegresiva, 1000);
    prepararAno();
    prepararApertura();
    prepararMusica();
    prepararCarrusel();
    prepararCopiaDeAlias();
    prepararRevelaciones();
    prepararBosqueEncantado();
    prepararParallaxDePortada();
    prepararInteracciones();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarInvitacion, { once: true });
} else {
    iniciarInvitacion();
}
const carrusel = document.querySelector("#carruselIglesia");

if (carrusel) {
    const imagenes = carrusel.querySelectorAll(".carrusel-arco-imagenes img");
    const indicadores = document.querySelectorAll(".indicadores-arco span");

    const anterior = carrusel.querySelector(".anterior");
    const siguiente = carrusel.querySelector(".siguiente");

    let indiceActual = 0;

    function mostrarImagen(indice) {
        imagenes[indiceActual].classList.remove("activa");
        indicadores[indiceActual].classList.remove("activo");

        indiceActual = (indice + imagenes.length) % imagenes.length;

        imagenes[indiceActual].classList.add("activa");
        indicadores[indiceActual].classList.add("activo");
    }

    anterior.addEventListener("click", () => {
        mostrarImagen(indiceActual - 1);
    });

    siguiente.addEventListener("click", () => {
        mostrarImagen(indiceActual + 1);
    });
}

document.querySelectorAll(".carrusel-arco").forEach(carrusel => {

    const imagenes = carrusel.querySelectorAll(".carrusel-arco-imagenes img");
    const contenedor = carrusel.parentElement;
    const indicadores = contenedor.querySelectorAll(".indicadores-arco span");

    const anterior = carrusel.querySelector(".anterior");
    const siguiente = carrusel.querySelector(".siguiente");

    let indiceActual = 0;

    function mostrarImagen(indice) {

        imagenes[indiceActual].classList.remove("activa");
        indicadores[indiceActual].classList.remove("activo");

        indiceActual = (indice + imagenes.length) % imagenes.length;

        imagenes[indiceActual].classList.add("activa");
        indicadores[indiceActual].classList.add("activo");
    }

    anterior.addEventListener("click", () => {
        mostrarImagen(indiceActual - 1);
    });

    siguiente.addEventListener("click", () => {
        mostrarImagen(indiceActual + 1);
    });

});

const hospedaje = document.querySelector("#hospedaje");

if (hospedaje) {
    const diapositivas = Array.from(hospedaje.querySelectorAll(".hospedaje-tarjeta"));
    const indicadores = Array.from(hospedaje.querySelectorAll(".hospedaje-indicador"));
    const anterior = hospedaje.querySelector(".hospedaje-anterior");
    const siguiente = hospedaje.querySelector(".hospedaje-siguiente");
    let indiceActual = 0;

    function mostrarHotel(indice) {
        indiceActual = (indice + diapositivas.length) % diapositivas.length;
        diapositivas.forEach((diapositiva, posicion) => {
            diapositiva.hidden = posicion !== indiceActual;
        });
        indicadores.forEach((indicador, posicion) => {
            const activo = posicion === indiceActual;
            indicador.classList.toggle("activo", activo);
            indicador.setAttribute("aria-current", String(activo));
        });
    }

    anterior.addEventListener("click", () => mostrarHotel(indiceActual - 1));
    siguiente.addEventListener("click", () => mostrarHotel(indiceActual + 1));
    indicadores.forEach((indicador, posicion) => {
        indicador.addEventListener("click", () => mostrarHotel(posicion));
    });
}
// ======================================
// ESCRITURA DE LOS NOMBRES EN PORTADA
// ======================================

function iniciarEscrituraNombres() {
    const titulo = document.getElementById("nombres-novios");

    if (!titulo) return;

    const texto = "José y Cecilia";
    let indice = 0;

    titulo.textContent = "";

    function escribir() {
        if (indice < texto.length) {
            titulo.textContent += texto.charAt(indice);
            indice++;

            setTimeout(escribir, 180);
        }
    }

    escribir();
}

// ======================================
// GALERÍA DE FOTOS SUPERPUESTAS
// ======================================

function iniciarGaleriaHistoria() {

    const galeria = document.getElementById("galeriaHistoria");

    if (!galeria) return;

    const fotos = Array.from(
        galeria.querySelectorAll(".historia-retrato")
    );

    const anterior = galeria.querySelector(".historia-flecha.anterior");
    const siguiente = galeria.querySelector(".historia-flecha.siguiente");
    const contador = document.getElementById("contadorHistoria");

    if (!fotos.length || !anterior || !siguiente) return;

    let fotoActual = 0;
    let intervaloAutomatico;
    let galeriaVisible = !("IntersectionObserver" in window);

    function mostrarFotos() {

        fotos.forEach((foto, indice) => {

            foto.classList.remove(
                "posicion-centro",
                "posicion-izquierda",
                "posicion-derecha",
                "posicion-oculta"
            );

            const total = fotos.length;

            const diferencia = (indice - fotoActual + total) % total;

            if (diferencia === 0) {
                foto.classList.add("posicion-centro");
            } 
            else if (diferencia === 1) {
                foto.classList.add("posicion-derecha");
            } 
            else if (diferencia === total - 1) {
                foto.classList.add("posicion-izquierda");
            } 
            else {
                foto.classList.add("posicion-oculta");
            }

        });

        if (contador) contador.textContent = `${fotoActual + 1} / ${fotos.length}`;
    }

    function avanzar(direccion) {
        fotoActual = (fotoActual + direccion + fotos.length) % fotos.length;
        mostrarFotos();
    }

    function actualizarAvanceAutomatico() {
        const debeAvanzar = galeriaVisible
            && !document.hidden
            && !movimientoReducido.matches
            && !galeria.contains(document.activeElement)
            && !galeria.matches(":hover");

        if (debeAvanzar && !intervaloAutomatico) {
            intervaloAutomatico = window.setInterval(() => avanzar(1), 5000);
        } else if (!debeAvanzar && intervaloAutomatico) {
            window.clearInterval(intervaloAutomatico);
            intervaloAutomatico = undefined;
        }
    }

    siguiente.addEventListener("click", () => {
        avanzar(1);
    });

    anterior.addEventListener("click", () => {
        avanzar(-1);
    });

    galeria.addEventListener("focusin", actualizarAvanceAutomatico);
    galeria.addEventListener("focusout", actualizarAvanceAutomatico);
    galeria.addEventListener("mouseenter", actualizarAvanceAutomatico);
    galeria.addEventListener("mouseleave", actualizarAvanceAutomatico);
    document.addEventListener("visibilitychange", actualizarAvanceAutomatico);
    movimientoReducido.addEventListener("change", actualizarAvanceAutomatico);

    if ("IntersectionObserver" in window) {
        const observador = new IntersectionObserver((entradas) => {
            galeriaVisible = entradas.some((entrada) => entrada.isIntersecting);
            actualizarAvanceAutomatico();
        });
        observador.observe(galeria);
    }

    mostrarFotos();
    actualizarAvanceAutomatico();
}

iniciarGaleriaHistoria();