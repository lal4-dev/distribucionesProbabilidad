let chart; // Variable global para reutilizar el gráfico

// Generador congruencial mixto
function lcg(x0, a, c, m, n) {
  let numeros = [];
  let x = x0;
  for (let i = 0; i < n; i++) {
    x = (a * x + c) % m;
    numeros.push(x / m); // Normalizado [0,1)
  }
  return numeros;
}

// Función principal para mostrar tabla y gráfico del generador
function generar() {
  // Obtener parámetros desde los inputs
  const x0 = parseInt(document.getElementById("x0").value);
  const a = parseInt(document.getElementById("a").value);
  const c = parseInt(document.getElementById("c").value);
  const m = parseInt(document.getElementById("m").value);
  const n = parseInt(document.getElementById("n").value);

  // Generar números
  const numeros = lcg(x0, a, c, m, n);

  // Preparar datos para Chart.js
  const datos = numeros.map((valor, i) => ({ x: i, y: valor }));

  // Destruir gráfico previo si existe
  if (chart) {
    chart.destroy();
  }

  // Crear gráfico de dispersión
  const ctx = document.getElementById("grafico").getContext("2d");
  chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Números pseudoaleatorios",
        data: datos,
        backgroundColor: "green"
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Iteración" } },
        y: { title: { display: true, text: "Valor (Ui)" }, min: 0, max: 1 }
      }
    }
  });

  const tbody = document.getElementById("tabla").querySelector("tbody");
  tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

  numeros.forEach((valor, i) => {
    const fila = document.createElement("tr");
    const colIter = document.createElement("td");
    colIter.textContent = i + 1; // número de iteración
    const colValor = document.createElement("td");
    colValor.textContent = valor.toFixed(4); // 4 decimales
    fila.appendChild(colIter);
    fila.appendChild(colValor);
    tbody.appendChild(fila);
  });
}

// Genera un estado inicial al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  generar();
});