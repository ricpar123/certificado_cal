
console.log('pdf.js ya cargado');

const raw = sessionStorage.getItem("cert_pdf");

if(!raw) {
  alert("No hay certificado cargado");
} else {
  const cert = JSON.parse(raw);
  console.log("Cert recibido", cert);


const min = cert.rangoMin;
const max = cert.rangoMax;
const rango = `${min} - ${max}`;


document.getElementById("numero").textContent = cert.numero;
document.getElementById("marca").textContent = cert.marca;
document.getElementById("rango").textContent = rango;
document.getElementById("serie").textContent = cert.nroSerie;
document.getElementById("cliente").textContent = cert.cliente;
document.getElementById("padron").textContent = cert.padron;



const fechaOrig = new Date(cert.fecha);
const fechaFormat = fechaOrig.toLocaleDateString("es-ES");
console.log('fecha format', fechaFormat);
document.getElementById("fecha").textContent = fechaFormat;

const tbodyPuntos = document.querySelector("#tablaPuntos tbody");

cert.puntos.forEach(p => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${p.nominal}</td>
    <td>${p.mediciones[0] ?? ""}</td>
    <td>${p.mediciones[1] ?? ""}</td>
    <td>${p.mediciones[2] ?? ""}</td>
    <td>${p.mediciones[3] ?? ""}</td>
    <td>${p.mediciones[4] ?? ""}</td>
  `;
  tbodyPuntos.appendChild(tr);
});

document.getElementById("eabs").textContent = cert.errorGeneralAbsNm;
document.getElementById("epct").textContent = cert.errorGeneralPct;
document.getElementById("resultado").textContent = cert.resultadoFinal;
document.getElementById("firmaImg").src = cert.firmaTecnico;
document.getElementById("tecnico").textContent = cert.tecnico;
document.getElementById("tolerancia").textContent = cert.tolerancia;



window.print(); 



}



  





