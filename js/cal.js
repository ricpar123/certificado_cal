
console.log(">>> calcular promedio global ejecutado <<<");

console.log("TR:", document.querySelectorAll("#miTabla tr").length);
console.log("TD inputs:", document.querySelectorAll("#miTabla td input").length);
console.log("ALL inputs:", document.querySelectorAll("#miTabla input").length);




let certificadoFinal = null; // Variable global para almacenar el certificado final
document.getElementById('btnResultados').addEventListener('click', calcularResultados);

function calcularResultados() {
  
  const puntos = [];

  const filas = document.querySelectorAll("#miTabla tr");

    filas.forEach((fila) => {
      const thInput = fila.querySelector("th input");
      if(!thInput) return;

      const nominal = parseFloat(thInput.value);
      if(!Number.isFinite(nominal) || nominal === 0) return;

      const inputMedidos = fila.querySelectorAll("td input");

      const mediciones = [];
        let sumaMed = 0;
        let countMed = 0;

      inputMedidos.forEach((inp) => {
        const v = parseFloat(inp.value);
        if (!Number.isFinite(v)) return;
        mediciones.push(v);
        sumaMed += v;
        countMed++;
      });
  
      if(countMed === 0) return;
      const promedio = sumaMed / countMed;

      const errorAbsPunto = promedio - nominal;
      const errorPctPunto = (errorAbsPunto / nominal) * 100;

      puntos.push({
        nominal,
        mediciones,
        promedio: Number(promedio.toFixed(2)),
        cumple: null
      });

    });
      // ====== 2) MEDIA ARITMÉTICA GLOBAL (con signo) ======
      let sumaGlobalError = 0;
      let sumaGlobalPct = 0;
      let totalMediciones = 0;

      document.querySelectorAll("#miTabla td input").forEach((input) => {
        const medido = parseFloat(input.value);
        if(!Number.isFinite(medido)) return;

        const fila = input.closest("tr");
        if(!fila) return;

        const nominal = parseFloat(fila.querySelector("th input")?.value);
          if (!Number.isFinite(nominal) || nominal === 0) return;

        const error = medido - nominal; // con signo
        sumaGlobalError += error;
        sumaGlobalPct += (error / nominal) * 100;
        totalMediciones++;
      });


      console.log('sumaGlobalError', sumaGlobalError);
      console.log('sumaGlobalPct', sumaGlobalPct);
      console.log('totalMediciones', totalMediciones);
  


    if (totalMediciones === 0) {
      alert("No hay mediciones válidas.");
      return;
    }

    const errorGeneralAbs = sumaGlobalError / totalMediciones;
    const errorGeneralPct = sumaGlobalPct / totalMediciones;

    const tol = parseFloat(document.getElementById("tolerancia")?.value) || 4;

    const pasa = Math.abs(errorGeneralPct) <= tol;

    if(!certificadoFinal) certificadoFinal = {};


    // ====== 4) GUARDAR en certificadoFinal para DB ======
    certificadoFinal = {
      numero: null,
      fecha: new Date().toISOString(),
    
      //Instrumento padron
      marca: document.getElementById("marca")?.value || "",
      modelo: document.getElementById("codigo")?.value || "",
      nroSerie: document.getElementById("serie")?.value || "",
      rangoMin: Number(document.getElementById("rangoMin")?.value),
      rangoMax: Number(document.getElementById("rangoMax")?.value),

      cliente: document.getElementById("cliente")?.value || "",
      tolerancia: document.getElementById("tolerancia")?.value || "4",
      temperatura: document.getElementById("tempC")?.value || "",
      humedad: document.getElementById("humedad")?.value || "",
      tecnico: document.getElementById("tecnico")?.value || "",
    
    
      // resultados finales

      puntos,    
      errorGeneralAbsNm: Number(errorGeneralAbs).toFixed(2),
      errorGeneralPct: Number(errorGeneralPct).toFixed(2),
      resultadoFinal: pasa ? "CUMPLE" : "NO CUMPLE",
    
    };

      const out = document.getElementById("salidaResultados");

      if (out) {
        out.innerHTML = `
        <p><b>Error abs. general (media):</b> ${errorGeneralAbs.toFixed(2)} Nm</p>
        <p><b>Error % general (media):</b> ${errorGeneralPct.toFixed(2)} %</p>
        <p><b>Resultado:</b>
          <span style="font-weight:800">${pasa ? "CUMPLE" : "NO CUMPLE"}</span>
          (Tol: ±${tol}%)
        </p>
        `;
      }


      // 2) Mostrar botón Guardar
    document.getElementById("btnGuardar").style.display = "inline-block";
  
     
}

document.getElementById("btnGuardar").addEventListener("click", async () => {
  if (!certificadoFinal) {
    alert("Primero calcule Resultados.");
    return;
  }
    
  const dataUrl = document.getElementById('firmaBase64').value;
  

 
  certificadoFinal.firmaTecnico = dataUrl;
  console.log('Firma guardada en certFinal', dataUrl);
  console.log('certFinal con firma', certificadoFinal);
  alert("Firma lista ✅");

  console.log("Enviando certificado al backend:", certificadoFinal);

  try {
    const res = await fetch("http://localhost:8081/calibraciones/calibracion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certificadoFinal)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al guardar");

    // Si tu backend devuelve numero, lo mostramos
    alert(`Guardado OK ✅\nNro Certificado: ${data.numero || "(sin número)"}`);
    certificadoFinal.numero = data.numero;
    
   localStorage.setItem("certificado_para_pdf", JSON.stringify(certificadoFinal)
    );

    // opcional: ocultar el botón para evitar doble guardado
    document.getElementById("btnGuardar").style.display = "none";

  } catch (err) {
    console.error(err);
    alert("No se pudo guardar. Revisá consola/servidor.");
  }

});

  document.getElementById("btnPdf").style.display = "inline-block"; // Mostrar el botón para generar PDF después de guardar

  document.getElementById("btnPdf").addEventListener("click", () => {
    if (!certificadoFinal?.numero) {
      alert("Primero guardá el certificado para obtener el número.");
      return;
    }
  
    window.open("../vistas/preview.html");
   
  });




   




