let data = [];
const RESULTS_LIMIT = 100000;  // Limitar a 10 resultados visibles

// Función para convertir el número de Excel en fecha
function excelDateToJSDate(serial) {
  const tempDate = new Date(1899, 11, 30); // Excel usa 1899-12-30 como fecha base
  tempDate.setDate(tempDate.getDate() + serial);
  return tempDate;
}

window.onload = () => {
  fetch('./flagrancia.xlsx')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Procesar las filas para convertir las fechas
      data = data.map(row => {
        return {
          NUM: row[0],
          IF: row[1],
          GRADO: row[2],
          PERITO: row[3],
          DELITO: row[4],
          DETENIDO: row[5],
          FISCAL: row[6],
          FISCALIA: row[7],
          F_INGRESO: row[8] ? excelDateToJSDate(row[8]) : null, // Convertir F_INGRESO
          CUMPLIMIENTO: row[9],
          F_CUMPLIMIENTO: row[10] ? excelDateToJSDate(row[10]) : null, // Convertir F_CUMPLIMIENTO
          N_OFICIO: row[11]
        };
      });

      alert('Archivo cargado con éxito');
    })
    .catch(error => {
      alert('Error al cargar el archivo');
    });
};

const searchButton = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const peritoSearchButton = document.getElementById('perito-search-btn');
const peritoSearchInput = document.getElementById('perito-search-input');
const cumplimientoSelect = document.getElementById('cumplimiento-select');
const resultsTable = document.getElementById('results-table');
const resultsBody = document.getElementById('results-body');
const peritoResultsBody = document.getElementById('perito-results-body');

// Función para la búsqueda por IF o DETENIDO
searchButton.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase();
  if (query.trim() === '') {
    alert('Por favor, ingrese un término de búsqueda');
    return;
  }

  const filteredData = data.filter(row => {
    const ifMatch = row.IF?.toString().includes(query);
    const detenidoMatch = row.DETENIDO?.toLowerCase().includes(query);
    return ifMatch || detenidoMatch;
  });

  displayResults(filteredData);
});

// Función para la búsqueda por PERITO
peritoSearchButton.addEventListener('click', () => {
  const peritoQuery = peritoSearchInput.value.toLowerCase();
  const cumplimientoFilter = cumplimientoSelect.value;
  if (peritoQuery.trim() === '') {
    alert('Por favor, ingrese un término de búsqueda para el perito');
    return;
  }

  const filteredData = data.filter(row => {
    const peritoMatch = row.PERITO?.toLowerCase().includes(peritoQuery);
    const cumplimientoMatch = cumplimientoFilter === '' || row.CUMPLIMIENTO === cumplimientoFilter;
    return peritoMatch && cumplimientoMatch;
  });

  displayPeritoResults(filteredData);
});

// Función para mostrar los resultados de la búsqueda
function displayResults(filteredData) {
  resultsBody.innerHTML = '';

  if (filteredData.length > 0) {
    filteredData.slice(0, RESULTS_LIMIT).forEach(row => {
      const tr = document.createElement('tr');
      Object.keys(row).forEach(key => {
        const td = document.createElement('td');
        td.textContent = row[key] instanceof Date ? row[key].toLocaleDateString() : row[key] || '';
        td.classList.add('border', 'p-3');
        tr.appendChild(td);
      });
      resultsBody.appendChild(tr);
    });

    resultsTable.classList.remove('hidden');
  } else {
    resultsTable.classList.add('hidden');
    alert('No se encontraron resultados');
  }
}

// Función para mostrar los resultados por PERITO
function displayPeritoResults(filteredData) {
  peritoResultsBody.innerHTML = '';

  if (filteredData.length > 0) {
    filteredData.slice(0, RESULTS_LIMIT).forEach(row => {
      const tr = document.createElement('tr');
      Object.keys(row).forEach(key => {
        const td = document.createElement('td');
        td.textContent = row[key] instanceof Date ? row[key].toLocaleDateString() : row[key] || '';
        td.classList.add('border', 'p-3');
        tr.appendChild(td);
      });
      peritoResultsBody.appendChild(tr);
    });

    document.getElementById('perito-results-table').classList.remove('hidden');
  } else {
    document.getElementById('perito-results-table').classList.add('hidden');
    alert('No se encontraron resultados');
  }
}

// Nueva función para contar y mostrar los resultados por CUMPLIMIENTO y FECHA
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const cumplimientoResultsTable = document.getElementById('cumplimiento-results-table');
const cumplimientoResultsBody = document.getElementById('cumplimiento-results-body');

const filterByDate = () => {
  const dateFrom = new Date(dateFromInput.value);
  const dateTo = new Date(dateToInput.value);

  if (!dateFrom || !dateTo) {
    alert('Por favor, ingrese las fechas correctamente.');
    return;
  }

  // Filtrar datos dentro del rango de fechas
  const filteredData = data.filter(row => {
    const fIngreso = row.F_INGRESO;
    return fIngreso && fIngreso >= dateFrom && fIngreso <= dateTo;
  });

  // Realizar el conteo de cumplimiento, incluyendo GRADO
  const peritoCounts = filteredData.reduce((acc, row) => {
    const perito = row.PERITO;
    const grado = row.GRADO;
    const cumplimiento = row.CUMPLIMIENTO;

    if (!acc[perito]) {
      acc[perito] = { GRADO: grado, SI: 0, NO: 0 };
    }
    if (cumplimiento === 'SI') {
      acc[perito].SI += 1;
    } else if (cumplimiento === 'NO') {
      acc[perito].NO += 1;
    }
    return acc;
  }, {});

  displayCumplimientoResults(peritoCounts);
};

const displayCumplimientoResults = (peritoCounts) => {
  cumplimientoResultsBody.innerHTML = '';
  let totalResults = 0;

  // Ordenar por GRADO
  const sortedPeritoCounts = Object.keys(peritoCounts)
    .sort((a, b) => peritoCounts[a].GRADO.localeCompare(peritoCounts[b].GRADO))
    .reduce((acc, key) => {
      acc[key] = peritoCounts[key];
      return acc;
    }, {});

  for (let perito in sortedPeritoCounts) {
    const { GRADO, SI, NO } = sortedPeritoCounts[perito];
    const total = SI + NO;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-3">${GRADO}</td>
      <td class="border p-3">${perito}</td>
      <td class="border p-3">${SI}</td>
      <td class="border p-3">${NO}</td>
      <td class="border p-3">${total}</td>
    `;

    cumplimientoResultsBody.appendChild(tr);
    totalResults += total;
  }

  if (totalResults > 0) {
    cumplimientoResultsTable.classList.remove('hidden');
  } else {
    cumplimientoResultsTable.classList.add('hidden');
    alert('No se encontraron resultados');
  }
};

// Evento para el botón de búsqueda de fechas
document.getElementById('cumplimiento-search-btn').addEventListener('click', filterByDate);
