const cert = JSON.parse(localStorage.getItem("certificado_para_pdf"));

const min = cert.rangoMin;
const max = cert.rangoMax;
const rango = `${min} - ${max}`;



document.getElementById("marca").textContent = cert.marca;
document.getElementById("codigo").textContent = cert.modelo;
document.getElementById("rango").textContent = rango;
document.getElementById("serie").textContent = cert.nroSerie;
document.getElementById("tolerancia").textContent = cert.tolerancia;