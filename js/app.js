// =======================
// Utilidades
// =======================
const $ = (id) => document.getElementById(id);
 


function roundTo(value, decimals) {
  if (value === null || value === undefined || value === "" || Number.isNaN(value)) return "";
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function toNumber(val) {
  if (val === "" || val === null || val === undefined) return NaN;
  return Number(val);
}

function deviationPercent(measured, selected) {
  // ((m - s) / s) * 100
  if (!Number.isFinite(measured) || !Number.isFinite(selected) || selected === 0) return NaN;
  return ((measured - selected) / selected) * 100;
}

function average(nums) {
  const valid = nums.filter((n) => Number.isFinite(n));
  if (!valid.length) return NaN;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function maxAbs(nums) {
  const valid = nums.filter((n) => Number.isFinite(n));
  if (!valid.length) return NaN;
  return Math.max(...valid.map((n) => Math.abs(n)));
}

// =======================
// Estado
// =======================

let state = {
  points: [
    { selected: 6.8, readings: [6.8, 6.9, 6.8, 6.7, 6.7] },
    { selected: 20,  readings: [20, 19.7, 19.5, 19.5, 19.3] },
    { selected: 30,  readings: [29.5, 29.5, 29.2, 29.3, 30] },
  ]
};
/*
// =======================
// Render
// =======================
function renderPoints() {
  const wrap = $("pointsWrap");
  wrap.innerHTML = "";

  const unidad = $("unidad").value;
  const tol = toNumber($("tolerancia").value);

  state.points.forEach((p, idx) => {
    const nIter = toNumber($("nIter").value) || 5;

    // Ajustar lecturas al número de iteraciones
    if (p.readings.length < nIter) {
      while (p.readings.length < nIter) p.readings.push(NaN);
    } else if (p.readings.length > nIter) {
      p.readings = p.readings.slice(0, nIter);
    }

    const pointEl = document.createElement("div");
    pointEl.className = "point";

    // Cabezera
    const head = document.createElement("div");
    head.className = "point-head";

    const title = document.createElement("div");
    title.className = "point-title";
    title.innerHTML = `
      <span>Valor seleccionado</span>
      <input type="number" step="0.1" value="${p.selected}" data-idx="${idx}" data-role="selected" />
      <span>${unidad}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "point-actions";
    actions.innerHTML = `
      <span class="pill" id="pill-${idx}">—</span>
      <button class="btn btn-ghost" type="button" data-idx="${idx}" data-role="remove">Eliminar</button>
    `;

    head.appendChild(title);
    head.appendChild(actions);

    // Tabla
    const table = document.createElement("table");
    table.className = "table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th style="width:120px">Iteración</th>
        <th>Valor medido (${unidad})</th>
        <th style="width:200px">Rango de desviación (%)</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (let i = 0; i < nIter; i++) {
      const measured = toNumber(p.readings[i]);
      const dev = deviationPercent(measured, toNumber(p.selected));

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>
          <input type="number" step="0.1"
                 value="${Number.isFinite(measured) ? measured : ""}"
                 placeholder="—"
                 data-idx="${idx}"
                 data-i="${i}"
                 data-role="reading" />
        </td>
        <td>${Number.isFinite(dev) ? roundTo(dev, 3).toFixed(3) : ""}</td>
      `;
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    // Pie del punto: promedio + peor desviación
    const foot = document.createElement("div");
    foot.className = "point-foot";

    const avg = average(p.readings.map(toNumber));
    const devs = p.readings.map((r) => deviationPercent(toNumber(r), toNumber(p.selected)));
    const worst = maxAbs(devs);

    const avgText = Number.isFinite(avg) ? roundTo(avg, 2).toFixed(2) : "—";
    const worstText = Number.isFinite(worst) ? roundTo(worst, 3).toFixed(3) : "—";

    foot.innerHTML = `
      <div class="row" style="gap:14px; flex-wrap:wrap;">
        <span class="pill">Promedio: <b>${avgText}</b> ${unidad}</span>
        <span class="pill">Peor |desv|: <b>${worstText}</b> %</span>
        <span class="pill">Tolerancia: <b>±${Number.isFinite(tol) ? tol : "—"}</b> %</span>
      </div>
    `;

    // status pill
    const pill = () => document.getElementById(`pill-${idx}`);
    if (!Number.isFinite(worst) || !Number.isFinite(tol)) {
      pill().textContent = "Incompleto";
      pill().className = "pill warn";
    } else if (worst <= tol) {
      pill().textContent = "Cumple";
      pill().className = "pill good";
    } else {
      pill().textContent = "No cumple";
      pill().className = "pill bad";
    }

    // Armar
    pointEl.appendChild(head);
    pointEl.appendChild(table);
    pointEl.appendChild(foot);

    wrap.appendChild(pointEl);
  });

  renderGlobalStatus();
}
*/
function renderGlobalStatus() {
  const tol = toNumber($("tolerancia").value);
  const global = $("globalStatus");

  if (!Number.isFinite(tol) || !state.points.length) {
    global.textContent = "—";
    global.className = "pill";
    return;
  }

  let anyIncomplete = false;
  let anyFail = false;

  state.points.forEach((p) => {
    const devs = p.readings.map((r) => deviationPercent(toNumber(r), toNumber(p.selected)));
    const worst = maxAbs(devs);
    if (!Number.isFinite(worst)) anyIncomplete = true;
    else if (worst > tol) anyFail = true;
  });

  if (anyIncomplete) {
    global.textContent = "Incompleto";
    global.className = "pill warn";
  } else if (anyFail) {
    global.textContent = "NO CUMPLE";
    global.className = "pill bad";
  } else {
    global.textContent = "CUMPLE";
    global.className = "pill good";
  }
}

// =======================
// Eventos
// =======================
/*
function bindEvents() {
  // Re-render cuando cambian tolerancia, unidad o iteraciones
  ["tolerancia", "unidad", "nIter"].forEach((id) => {
    $(id).addEventListener("input", () => renderPoints());
    $(id).addEventListener("change", () => renderPoints());
  });

  // Delegación de eventos para inputs de puntos
  $("pointsWrap").addEventListener("input", (e) => {
    const role = e.target?.dataset?.role;
    const idx = Number(e.target?.dataset?.idx);

    if (!Number.isFinite(idx)) return;

    if (role === "selected") {
      const val = toNumber(e.target.value);
      state.points[idx].selected = Number.isFinite(val) ? val : state.points[idx].selected;
      renderPoints();
    }

    if (role === "reading") {
      const i = Number(e.target?.dataset?.i);
      const val = toNumber(e.target.value);
      state.points[idx].readings[i] = Number.isFinite(val) ? val : NaN;
      renderPoints();
    }
  });

  $("pointsWrap").addEventListener("click", (e) => {
    const role = e.target?.dataset?.role;
    const idx = Number(e.target?.dataset?.idx);

    if (role === "remove" && Number.isFinite(idx)) {
      state.points.splice(idx, 1);
      renderPoints();
    }
  });

  $("btnAddPoint").addEventListener("click", () => {
    state.points.push({ selected: 0, readings: [] });
    renderPoints();
  });

  $("btnReset").addEventListener("click", () => {
    // limpiar inputs arriba
    ["marca","codigo","rangoMin","rangoMax","serie","cliente","instrumentacion"].forEach(id => $(id).value = "");
    $("tolerancia").value = 4;
    $("unidad").value = "Nm";
    $("tempC").value = 30;
    $("humedad").value = 40;
    $("realizadoPor").value = "INGROUP SRL";

    // fecha hoy
    setTodayDate();

    // reset puntos ejemplo
    state.points = [
      { selected: 6.8, readings: [NaN, NaN, NaN, NaN, NaN] },
      { selected: 20,  readings: [NaN, NaN, NaN, NaN, NaN] },
      { selected: 30,  readings: [NaN, NaN, NaN, NaN, NaN] },
    ];
    $("nIter").value = 5;

    renderPoints();
  });

  $("btnExportJSON").addEventListener("click", () => {
    const data = buildDataObject();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cert-torquimetro-${data.condiciones?.fecha || "sin-fecha"}.json`;
    a.click();

    URL.revokeObjectURL(url);
  });

  $("btnSaveLocal").addEventListener("click", () => {
    const data = buildDataObject();
    localStorage.setItem("cert_torquimetro_draft", JSON.stringify(data));
    alert("Borrador guardado en el navegador ✅");
  });

  $("btnLoadLocal").addEventListener("click", () => {
    const raw = localStorage.getItem("cert_torquimetro_draft");
    if (!raw) return alert("No hay borrador guardado.");
    const data = JSON.parse(raw);
    applyDataObject(data);
    alert("Borrador cargado ✅");
  });

  $("btnPreview").addEventListener("click", () => {
    alert("Siguiente etapa: acá abrimos la vista A4 (layout) y luego generamos el PDF igual al certificado.");
  });
}
*/
function setTodayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  $("fecha").value = `${yyyy}-${mm}-${dd}`;
}

// =======================
// Datos: construir/aplicar
// =======================
function buildDataObject() {
  const unidad = $("unidad").value;
  const tol = toNumber($("tolerancia").value);

  return {
    marca: $("marca").value.trim(),
    codigo: $("codigo").value.trim(),
    rangoTorque: {
      min: toNumber($("rangoMin").value),
      max: toNumber($("rangoMax").value),
      unidad
    },
    nroSerie: $("serie").value.trim(),
    toleranciaPorc: tol,
    cliente: $("cliente").value.trim(),
    condiciones: {
      fecha: $("fecha").value,
      tempC: toNumber($("tempC").value),
      humedadPorc: toNumber($("humedad").value),
    },
    instrumentacion: $("instrumentacion").value.trim(),
    realizadoPor: $("realizadoPor").value.trim(),
    parametros: {
      iteraciones: toNumber($("nIter").value) || 5
    },
    puntos: state.points.map(p => ({
      seleccionado: toNumber(p.selected),
      lecturas: p.readings.map(toNumber),
      // resumen calculado
      resumen: (() => {
        const avg = average(p.readings.map(toNumber));
        const devs = p.readings.map(r => deviationPercent(toNumber(r), toNumber(p.selected)));
        const worst = maxAbs(devs);
        return {
          promedio: Number.isFinite(avg) ? roundTo(avg, 2) : null,
          peorAbsDesvPorc: Number.isFinite(worst) ? roundTo(worst, 3) : null,
          cumple: Number.isFinite(worst) && Number.isFinite(tol) ? worst <= tol : null
        };
      })()
    }))
  };
}

function applyDataObject(data) {
  $("marca").value = data.marca || "";
  $("codigo").value = data.codigo || "";
  $("rangoMin").value = Number.isFinite(data?.rangoTorque?.min) ? data.rangoTorque.min : "";
  $("rangoMax").value = Number.isFinite(data?.rangoTorque?.max) ? data.rangoTorque.max : "";
  $("unidad").value = data?.rangoTorque?.unidad || "Nm";
  $("serie").value = data.nroSerie || "";
  $("tolerancia").value = Number.isFinite(data.toleranciaPorc) ? data.toleranciaPorc : 4;
  $("cliente").value = data.cliente || "";
  $("fecha").value = data?.condiciones?.fecha || $("fecha").value;
  $("tempC").value = Number.isFinite(data?.condiciones?.tempC) ? data.condiciones.tempC : 30;
  $("humedad").value = Number.isFinite(data?.condiciones?.humedadPorc) ? data.condiciones.humedadPorc : 40;
  $("instrumentacion").value = data.instrumentacion || "";
  $("realizadoPor").value = data.realizadoPor || "INGROUP SRL";

  $("nIter").value = Number.isFinite(data?.parametros?.iteraciones) ? data.parametros.iteraciones : 5;

  if (Array.isArray(data.puntos)) {
    state.points = data.puntos.map(pt => ({
      selected: Number(pt.seleccionado) || 0,
      readings: Array.isArray(pt.lecturas) ? pt.lecturas : []
    }));
  }

  renderPoints();
}

document.getElementById('rangoMin').addEventListener('input', actualizarRangos);
document.getElementById('rangoMax').addEventListener('input', actualizarRangos);



function actualizarRangos() {

  const minRango = parseFloat(document.getElementById('rangoMin').value);
  const maxRango = parseFloat(document.getElementById('rangoMax').value);

  if (!Number.isFinite(minRango) || !Number.isFinite(maxRango)) {
    return; // si aún no están completos, no hacer nada
  }

  const step = (maxRango - minRango)/2;
document.querySelector('#head1 input').value = minRango.toFixed(2);
document.querySelector("#head2 input").value = step.toFixed(2);

document.querySelector("#head3 input").value = maxRango.toFixed(2);  


}

actualizarRangos();


// =======================
// Init
// =======================
function init() {
  setTodayDate();
 // bindEvents();
 // renderPoints();
}

init();
