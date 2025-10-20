// ===================================================================
// CÓDIGO DE SIMULACIÓN DE LA TERMINAL
// ===================================================================

// 1. CLASE DEL GENERADOR PARA USO EN LA SIMULACIÓN
class GeneradorParaSimulacion {
    constructor(x0, a, c, m) {
        this.x = x0; this.a = a; this.c = c; this.m = m;
    }
    generarUniforme() {
        this.x = (this.a * this.x + this.c) % this.m;
        return this.x / this.m;
    }
}

// 2. FUNCIONES PARA GENERAR VARIABLES ALEATORIAS
function generarTiempoEntreArribos(generador, lambdaBusesPorHora) {
    const lambdaBusesPorMinuto = lambdaBusesPorHora / 60.0;
    const u = generador.generarUniforme();
    return -Math.log(1 - u) / lambdaBusesPorMinuto;
}

function generarTiempoServicio(generador, media, desvio) {
    const u1 = generador.generarUniforme();
    const u2 = generador.generarUniforme();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(1, media + desvio * z); // Evita tiempos negativos o cero
}

// 3. MOTOR DE SIMULACIÓN PRINCIPAL
function iniciarSimulacion() {
    console.log("🚀 INICIANDO SIMULACIÓN DE LA TERMINAL...");

    // --- OBTENER PARÁMETROS DEL HTML ---
    const x0 = parseInt(document.getElementById("x0").value);
    const a = parseInt(document.getElementById("a").value);
    const c = parseInt(document.getElementById("c").value);
    const m = parseInt(document.getElementById("m").value);
    
    const tasaLlegadaLambda = parseFloat(document.getElementById("tasaLlegada").value);
    const tiempoMedioServicio = parseFloat(document.getElementById("tiempoServicio").value);
    const desvioServicio = parseFloat(document.getElementById("desvioServicio").value);
    const cantidadAndenes = parseInt(document.getElementById("numAndenes").value);
    const tiempoSimulacionHoras = parseInt(document.getElementById("horasSimulacion").value);

    // --- INICIALIZACIÓN ---
    const generador = new GeneradorParaSimulacion(x0, a, c, m);
    const tiempoSimulacionMinutos = tiempoSimulacionHoras * 60;
    let reloj = 0.0;
    let andenesOcupados = 0;
    const colaEspera = [];
    const tiemposDeEsperaEnCola = [];
    let totalBusesAtendidos = 0;
    const llegadasPorHora = new Array(tiempoSimulacionHoras).fill(0);
    const eventos = [];

    // Programar la primera llegada
    const primeraLlegada = generarTiempoEntreArribos(generador, tasaLlegadaLambda);
    eventos.push({ tiempo: primeraLlegada, tipo: 'LLEGADA' });

    // --- BUCLE PRINCIPAL DE SIMULACIÓN ---
    while (reloj < tiempoSimulacionMinutos && eventos.length > 0) {
        eventos.sort((a, b) => a.tiempo - b.tiempo);
        const eventoActual = eventos.shift();
        reloj = eventoActual.tiempo;
        if (reloj > tiempoSimulacionMinutos) break;

        if (eventoActual.tipo === 'LLEGADA') {
            const horaActual = Math.floor(reloj / 60);
            if (horaActual < tiempoSimulacionHoras) {
                llegadasPorHora[horaActual]++;
            }
            const tiempoProxLlegada = reloj + generarTiempoEntreArribos(generador, tasaLlegadaLambda);
            eventos.push({ tiempo: tiempoProxLlegada, tipo: 'LLEGADA' });

            if (andenesOcupados < cantidadAndenes) {
                andenesOcupados++;
                tiemposDeEsperaEnCola.push(0);
                const tiempoServicio = generarTiempoServicio(generador, tiempoMedioServicio, desvioServicio);
                eventos.push({ tiempo: reloj + tiempoServicio, tipo: 'PARTIDA' });
            } else {
                colaEspera.push(reloj);
            }
        } else if (eventoActual.tipo === 'PARTIDA') {
            totalBusesAtendidos++;
            andenesOcupados--;
            if (colaEspera.length > 0) {
                andenesOcupados++;
                const tiempoLlegadaACola = colaEspera.shift();
                tiemposDeEsperaEnCola.push(reloj - tiempoLlegadaACola);
                const tiempoServicio = generarTiempoServicio(generador, tiempoMedioServicio, desvioServicio);
                eventos.push({ tiempo: reloj + tiempoServicio, tipo: 'PARTIDA' });
            }
        }
    }

    // --- MOSTRAR TABLA DE RESULTADOS ---
    const resultadosDiv = document.getElementById("resultadosSimulacion");
    resultadosDiv.innerHTML = "<h2>Resultados de la Simulación</h2>";
    
    const esperaPromedio = tiemposDeEsperaEnCola.reduce((a, b) => a + b, 0) / tiemposDeEsperaEnCola.length || 0;
    const esperaMaxima = tiemposDeEsperaEnCola.length ? Math.max(...tiemposDeEsperaEnCola) : 0;
    const llegadasMedia = llegadasPorHora.reduce((a, b) => a + b, 0) / llegadasPorHora.length;
    let llegadasVarianza = 0;
    if (llegadasPorHora.length > 1) {
        llegadasVarianza = llegadasPorHora.map(x => (x - llegadasMedia) ** 2).reduce((a, b) => a + b, 0) / (llegadasPorHora.length - 1);
    }
    
    resultadosDiv.innerHTML += `
        <p><strong>Total de buses atendidos:</strong> ${totalBusesAtendidos}</p>
        <p><strong>Tiempo promedio de espera en cola:</strong> ${esperaPromedio.toFixed(2)} minutos</p>
        <p><strong>Tiempo máximo de espera en cola:</strong> ${esperaMaxima.toFixed(2)} minutos</p>
        <hr>
        <h4>Validación Hipótesis de Poisson</h4>
        <p><strong>Media de llegadas por hora (observada):</strong> ${llegadasMedia.toFixed(4)}</p>
        <p><strong>Varianza de llegadas por hora (observada):</strong> ${llegadasVarianza.toFixed(4)}</p>
    `;
}