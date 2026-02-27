
console.log(">>> calcular promedio global ejecutado <<<");

console.log("TR:", document.querySelectorAll("#miTabla tr").length);
console.log("TD inputs:", document.querySelectorAll("#miTabla td input").length);
console.log("ALL inputs:", document.querySelectorAll("#miTabla input").length);




let certificadoFinal = null; // Variable global para almacenar el certificado final

document.getElementById('btnResultados').addEventListener('click', calcularResultados);

function calcularResultados() {

  try {
    const puntos = obtenerPuntosDesdeTablaNueva();

    const { errorAbs, errorPct } = calcularErroresGlobales(puntos);
    const tolerancia = document.getElementById("tolerancia").value;
    const pasa = Math.abs(errorPct) <= tolerancia;

    document.getElementById("salidaResultados").innerHTML = 
    `
         <p>Error abs: ${errorAbs.toFixed(2)} Nm</p>
         <p>Error %: ${errorPct.toFixed(2)} %</p>
         <p>Resultado: ${pasa ? "CUMPLE" : "NO CUMPLE"}</p>
      `;
      
      
      
  }catch (err) {
    alert(err.message);
  }
  
}

  function obtenerPuntosDesdeTablaNueva() {
    const nominales = [1,2,3].map(i => {
      const v = parseFloat(document.querySelector(`#head${i} input`)?.value);
        return Number.isFinite(v) ? v : NaN;
    });

    if (nominales.some(n => !Number.isFinite(n))) {
      throw new Error("Nominales incompletos");
    }

    // puntos: 3 puntos, cada uno con 5 mediciones
    puntos = nominales.map(n => ({ nominal: n, mediciones: [] }));

    const filas = document.querySelectorAll("#miTabla tbody tr");

      filas.forEach(tr => {
        const tds = tr.querySelectorAll("td input");
        if (tds.length < 3) return;

        tds.forEach((inp, idx) => {
          const med = parseFloat(inp.value);
          if (Number.isFinite(med)) puntos[idx].mediciones.push(med);
        });
      });

      return puntos;
  } 

  function calcularErroresGlobales(puntos) {

    let sumaErrores = 0;
    let sumaErroresPct = 0;
    let total = 0;

      puntos.forEach(punto => {

        const nominal = punto.nominal;

        punto.mediciones.forEach(medido => {

          const error = medido - nominal;   // con signo
          sumaErrores += error;

          const errorPct = (error / nominal) * 100;
          sumaErroresPct += errorPct;

          total++;
        });

      });

      if (total === 0) {
        throw new Error("No hay mediciones válidas");
      }

        const mediaErrorAbs = sumaErrores / total;       // Nm
        const mediaErrorPct = sumaErroresPct / total;    // %

        return {
          errorAbs: mediaErrorAbs,
          errorPct: mediaErrorPct
        };
  }
      

    // ====== 4) GUARDAR en certificadoFinal para DB ======
    

  

      
      // 2) Mostrar botón Guardar
    document.getElementById("btnGuardar").style.display = "inline-block";
 
     


    document.getElementById("btnGuardar").addEventListener("click", async () => {

      const certificadoFinal = buildCertificadoFinal();

            
        const dataUrl = document.getElementById('firmaBase64').value;

          alert("Firma lista ✅");

        console.log("Payload a enviar", certificadoFinal);
    

    function buildCertificadoFinal() {
      const el = (id) => document.getElementById(id);

      // Debug: te avisa si un id no existe
      const must = (id) => {
        const node = el(id);
        if (!node) console.warn("Falta elemento con id:", id);
          return node;
      };

      // 1) Obtener puntos primero
          const puntos = obtenerPuntosDesdeTablaNueva();

        // 2) Calcular errores UNA sola vez
          const { errorAbs, errorPct } = calcularErroresGlobales(puntos);

      // 3) Tolerancia y resultado
          const tolerancia = Number(must("tolerancia")?.value ?? 4);
          const pasa = Math.abs(errorPct) <= tolerancia;
      // 4) Armar el objeto final
      return {
        numero: null,
        fecha: new Date().toISOString(),

        marca: must("marca")?.value?.trim() ?? "",
        nroSerie: must("serie")?.value?.trim() ?? "",

        rangoMin: Number(must("rangoMin")?.value),
        rangoMax: Number(must("rangoMax")?.value),

        cliente: must("cliente")?.value?.trim() ?? "",

        tolerancia,
        temperatura: Number(must("tempC")?.value ?? ""),
        humedad: Number(must("humedad")?.value ?? ""),

        tecnico: must("tecnico")?.value?.trim() ?? "",

        // y acá agregás resultados y puntos
        // 4) Armar el objeto final
        puntos,
        errorGeneralAbsNm: Number(errorAbs.toFixed(2)),
        errorGeneralPct: Number(errorPct.toFixed(2)),
        resultadoFinal: pasa ? "CUMPLE" : "NO CUMPLE",

        firmaTecnico: must("firmaBase64")?.value ?? ""
      };
    }
    
    

  try {
    const res = await fetch("http://localhost:8081/calibraciones/calibracion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certificadoFinal)
    });

    const data = await res.json();
    console.log('datos recibidos del server', data);

    if (!res.ok) throw new Error(data.error || "Error al guardar");

    // Si tu backend devuelve numero, lo mostramos
    alert(`Guardado OK ✅\nNro Certificado: ${data.numero || "(sin número)"}`);
    certificadoFinal.numero = data.numero;
    console.log('certificado numero', certificadoFinal.numero);
    
   localStorage.setItem("certificado_para_pdf", JSON.stringify(certificadoFinal)
    );

    // opcional: ocultar el botón para evitar doble guardado
    document.getElementById("btnGuardar").style.display = "none";

  } catch (err) {
    console.error(err);
    alert("No se pudo guardar. Revisá consola/servidor.");
  }

  document.getElementById("btnPdf").style.display = "inline-block"; // Mostrar el botón para generar PDF después de guardar

  document.getElementById("btnPdf").addEventListener("click", () => {
    
    console.log("certFinal:", certificadoFinal);
    /*
    if (!certificadoFinal.numero) {
      alert("Primero guardá el certificado para obtener el número.");
      return;
    }
  
    window.open("../vistas/preview.html");
   */
  });

});


  