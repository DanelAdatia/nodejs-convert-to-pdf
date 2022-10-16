const express = require("express");
const multer = require("multer");
const imgToPDF = require("image-to-pdf");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });
const app = express();
app.use(express.json());
const fs = require("fs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    res.download(`./pdfs/${Object.keys(req.query)[0]}.pdf`);
  } catch (err) {
    console.log(err);
  }
});

app.post("/", upload.single("images"), (req, res) => {
  try {
    const splitJpeg = req.file.filename.split(".", 1);
    const obj = JSON.parse(JSON.stringify(req?.body));
    const obj1 = JSON.parse(JSON.stringify(req?.file));

    if (obj1) {
      const pages = [
        fs.readFileSync(req.file.path), // Buffer
      ];

      imgToPDF(pages, imgToPDF.sizes.A4).pipe(
        fs.createWriteStream(`./pdfs/${splitJpeg[0]}.pdf`)
      );
      setTimeout(() => {
        fs.unlinkSync(`./pdfs/${splitJpeg[0]}.pdf`);
      }, 5000);
    }
    setTimeout(() => {
      fs.unlinkSync(req.file.path);
    }, 5000);

    res.status(200).json({
      status: "success found",
      data: "HEY",
      path: splitJpeg[0],
    });
  } catch (err) {
    console.log(err);
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log("App is running");
});
