function calcularResultados() {

  // ====== 1) ARMAR puntos[] DESDE LA TABLA ======
  const puntos = [];

  const filas = document.querySelectorAll("#miTabla tr");

  filas.forEach((fila) => {
    const thInput = fila.querySelector("th input");
    if (!thInput) return;

    const nominal = parseFloat(thInput.value);
    if (!Number.isFinite(nominal) || nominal === 0) return;

    const inputsMedidos = fila.querySelectorAll("td input");

    const mediciones = [];
    let sumaMed = 0;
    let countMed = 0;

    inputsMedidos.forEach((inp) => {
      const v = parseFloat(inp.value);
      if (!Number.isFinite(v)) return;
      mediciones.push(v);
      sumaMed += v;
      countMed++;
    });

    if (countMed === 0) return;

    const promedio = sumaMed / countMed;

    // error del punto (con signo) según promedio de mediciones
    const errorAbsPunto = promedio - nominal;
    const errorPctPunto = (errorAbsPunto / nominal) * 100;

    puntos.push({
      nominal,
      mediciones,
      promedio: Number(promedio.toFixed(2)),
      peorErrorPorc: Number(errorPctPunto.toFixed(2)), // si querés, renombramos a errorPct
      cumple: null // lo completamos luego si querés por punto
    });
  });

  // ====== 2) MEDIA ARITMÉTICA GLOBAL (con signo) ======
  let sumaGlobalError = 0;
  let sumaGlobalPct = 0;
  let totalMediciones = 0;

  document.querySelectorAll("#miTabla td input").forEach((input) => {
    const medido = parseFloat(input.value);
    if (!Number.isFinite(medido)) return;

    const fila = input.closest("tr");
    if (!fila) return;

    const nominal = parseFloat(fila.querySelector("th input")?.value);
    if (!Number.isFinite(nominal) || nominal === 0) return;

    const error = medido - nominal; // con signo
    sumaGlobalError += error;
    sumaGlobalPct += (error / nominal) * 100;
    totalMediciones++;
  });

  console.log("totalMediciones:", totalMediciones);

  if (totalMediciones === 0) {
    alert("No hay mediciones válidas.");
    return;
  }

  const errorGeneralAbs = sumaGlobalError / totalMediciones;
  const errorGeneralPct = sumaGlobalPct / totalMediciones;

  // ====== 3) CRITERIO CUMPLE / NO CUMPLE ======
  // Si tu tolerancia es ±4 (%), por ejemplo:
  const tol = parseFloat(document.getElementById("tolerancia")?.value) || 4;

  // Como pediste media con signo, para comparar con tolerancia normalmente se usa |%|
  const pasa = Math.abs(errorGeneralPct) <= tol;

  // ====== 4) GUARDAR en certificadoFinal para DB ======
  if (!window.certificadoFinal) window.certificadoFinal = {};

  window.certificadoFinal.puntos = puntos;
  window.certificadoFinal.errorGeneralAbsNm = Number(errorGeneralAbs.toFixed(3));
  window.certificadoFinal.errorGeneralPct = Number(errorGeneralPct.toFixed(3));
  window.certificadoFinal.resultadoFinal = pasa ? "CUMPLE" : "NO CUMPLE";
  window.certificadoFinal.tolerancia = tol;

  // Firma (del hidden input)
  window.certificadoFinal.firmaTecnico = document.getElementById("firmaBase64")?.value || "";

  // ====== 5) IMPRIMIR EN PANTALLA ======
  const out = document.getElementById("salidaResultados");

  if (out) {
    out.innerHTML = `
      <p><b>Error abs. general (media):</b> ${errorGeneralAbs.toFixed(3)} Nm</p>
      <p><b>Error % general (media):</b> ${errorGeneralPct.toFixed(3)} %</p>
      <p><b>Resultado:</b>
        <span style="font-weight:800">${pasa ? "CUMPLE" : "NO CUMPLE"}</span>
        (Tol: ±${tol}%)
      </p>
    `;
  }

  // mostrar botón Guardar
  const btnG = document.getElementById("btnGuardar");
  if (btnG) btnG.style.display = "inline-block";

  console.log("certificadoFinal listo:", window.certificadoFinal);
}
