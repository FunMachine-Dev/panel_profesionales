const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use('/content', express.static(path.join(__dirname, 'content')));


app.get("/", (req, res) => {
    res.send("Servidor de Genda Admin funcionando");
});

// Endpoint para actualizar el contenido de la web
app.post("/update-content", (req, res) => {
    const { section, content } = req.body;

    if (!section || !content) {
        return res.status(400).send("Sección y contenido son requeridos");
    }

    // Ruta del archivo donde se guardará el contenido
    const filePath = path.join(__dirname, "content", `${section}.json`);

    // Crea la carpeta "content" si no existe
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Guarda el contenido en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify({ content }, null, 2));

    res.status(200).send("Contenido actualizado correctamente");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
