let sumaGlobalError = 0;
let sumaGlobalPct = 0;
let totalMediciones = 0;

filas.forEach((fila) => {

  const th = fila.querySelector("th");
  if (!th) return;

  const nominal = parseFloat(th.textContent);
  if (!Number.isFinite(nominal)) return;

  const inputsMedidos = fila.querySelectorAll("td input");

  inputsMedidos.forEach((input) => {

    const medido = parseFloat(input.value);
    if (!Number.isFinite(medido)) return;

    const error = medido - nominal;      // 🔥 error con signo

    sumaGlobalError += error;
    sumaGlobalPct += (error / nominal) * 100;

    totalMediciones++;
  });

});

if (totalMediciones === 0) {
  alert("No hay mediciones válidas.");
  return;
}

const errorGeneralAbs = sumaGlobalError / totalMediciones;
const errorGeneralPct = sumaGlobalPct / totalMediciones;

// Mostrar resultados
maxAbsErrorNm = errorGeneralAbs.toFixed(3);
maxAbsPctError = errorGeneralPct.toFixed(3);