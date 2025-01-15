const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Para servir los archivos estáticos

// Ruta para obtener los datos del archivo CSV
app.get('/api/get-numeros', (req, res) => {
    const filePath = path.join(__dirname, 'numeros.csv');

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const rows = data.split('\n').map(row => {
            const [perito, numero] = row.split(',');
            return { perito, numero };
        });
        res.json(rows);
    } else {
        res.json([]);
    }
});

// Ruta para guardar los datos en el archivo CSV
app.post('/api/save-numeros', (req, res) => {
    const filePath = path.join(__dirname, 'numeros.csv');
    const newData = req.body;

    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'perito', title: 'Perito' },
            { id: 'numero', title: 'Numero' }
        ],
        append: true // Para agregar a los datos existentes
    });

    // Guardar los nuevos datos
    csvWriter.writeRecords(newData)
        .then(() => {
            res.status(200).json({ message: 'Datos guardados correctamente' });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error al guardar los datos', error });
        });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});