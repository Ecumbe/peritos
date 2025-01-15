// Leer el archivo de Excel "FLAGRANCIA.xlsx"
const xlsx = require('xlsx');
const workbook = xlsx.readFile('flagrancia.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

// Leer la columna "PERITO" del archivo Excel y eliminar duplicados
const peritos = [...new Set(data.map(row => row.PERITO))];

// Obtener el select de peritos
const peritoSelect = document.getElementById('perito-select');

// Agregar opciones al select de peritos
peritos.forEach(perito => {
  const option = document.createElement('option');
  option.value = perito;
  option.text = perito;
  peritoSelect.appendChild(option);
});

// Obtener el contenedor de números
const numerosContainer = document.getElementById('numeros-container');

// Variable para almacenar los números elegidos
let numerosElegidos = {};

// Variable para almacenar los números disponibles
let numerosDisponibles = Array.from({ length: 2000 }, (_, i) => i + 1);

// Evento para el select de peritos
peritoSelect.addEventListener('change', () => {
  const perito = peritoSelect.value;

  // Mostrar números disponibles
  numerosContainer.innerHTML = '';
  numerosDisponibles.forEach(numero => {
    const button = document.createElement('button');
    button.textContent = numero;
    button.classList.add('bg-blue-500', 'text-white', 'p-3', 'rounded-md', 'hover:bg-blue-600', 'transition-all', 'duration-300', 'transform', 'hover:scale-105');
    button.addEventListener('click', () => {
      // Agregar número elegido al objeto
      if (!numerosElegidos[perito]) {
        numerosElegidos[perito] = [];
      }
      numerosElegidos[perito].push(numero);

      // Eliminar número elegido de la lista de números disponibles
      numerosDisponibles = numerosDisponibles.filter(n => n !== numero);

      // Mostrar números elegidos
      mostrarNumerosElegidos();

      // Guardar números elegidos en el archivo de Excel
      guardarNumerosElegidos();
    });
    numerosContainer.appendChild(button);
  });
});

// Mostrar números elegidos
function mostrarNumerosElegidos() {
  const numerosElegidosTable = document.getElementById('numeros-elegidos-table');
  const numerosElegidosBody = document.getElementById('numeros-elegidos-body');

  numerosElegidosBody.innerHTML = '';

  Object.keys(numerosElegidos).forEach(perito => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-3">${perito}</td>
      <td class="border p-3">${numerosElegidos[perito].join(', ')}</td>
    `;
    numerosElegidosBody.appendChild(tr);
  });
}

// Guardar números elegidos en el archivo de Excel
function guardarNumerosElegidos() {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet([
    { PERITO: 'PERITO', NUMERO_ELEGIDO: 'NUMERO ELEGIDO' },
    ...Object.keys(numerosElegidos).map(perito => ({
      PERITO: perito,
      NUMERO_ELEGIDO: numerosElegidos[perito].join(', '),
    })),
  ]);

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Numeros Elegidos');
  xlsx.writeFile(workbook, 'numeros.xlsx');
}