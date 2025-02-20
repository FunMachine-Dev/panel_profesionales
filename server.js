const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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



//Configuración de Multer para almacenar imágenes
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public', 'admin', 'img', 'upload-image'), // Ruta relativa desde server.js
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre de archivo con timestamp
  }
});

const upload = multer({ storage });

// Ruta para subir imágenes
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  res.json({ imageUrl: `admin/img/upload-image/${req.file.filename}` });
});


// Servir imágenes desde la carpeta correcta
app.use('/img', express.static(path.join(__dirname, 'public/admin/img')));


// Ruta para eliminar todas las imágenes en la carpeta
app.post('/delete-images', (req, res) => {
  const imageFolderPath = path.join(__dirname, 'public/admin/img/upload-image');
  console.log(imageFolderPath);
  fs.readdir(imageFolderPath, (err, files) => {
      if (err) {
          console.error("Error al leer la carpeta:", err);
          return res.status(500).send("Error al eliminar imágenes.");
      }

      // Eliminar cada archivo encontrado en la carpeta
      files.forEach(file => {
          fs.unlink(path.join(imageFolderPath, file), err => {
              if (err) console.error("Error al eliminar archivo:", err);
          });
      });

      res.send("Todas las imágenes han sido eliminadas.");
  });
});

