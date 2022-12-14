const express = require("express");
const multer = require("multer");
const imgToPDF = require("image-to-pdf");
const app = express();
const fs = require("fs");

const path = require("path");

console.log("Current directory:", __dirname);

app.use((req, res, next) => {
  //allow access from every, elminate CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.removeHeader("x-powered-by");
  //set the allowed HTTP methods to be requested
  res.setHeader("Access-Control-Allow-Methods", "POST");
  //headers clients can use in their requests
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  //allow request to continue and be handled by routes
  next();
});

const pathh = "upload";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.access(pathh, (error) => {
      // To check if the given directory
      // already exists or not
      if (error) {
        // If current directory does not exist
        // then create it
        fs.mkdir(pathh, (error) => {
          if (error) {
            cb(null, pathh);
          } else {
            cb(null, pathh);
          }
        });
      } else {
        cb(null, pathh);
      }
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    res.download(`${__dirname}/pdfs/${Object.keys(req.query)[0]}.pdf`);
  } catch (err) {
    console.log(err);
  }
});
app.get("/dashboard", (req, res) => {
  try {
    res.json("Welcome");
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
      fs.access(`${__dirname}/pdfs`, (error) => {
        if (error) {
          fs.mkdir(`${__dirname}/pdfs`, (error) => {
            if (error) {
              imgToPDF(pages, imgToPDF.sizes.A4).pipe(
                fs.createWriteStream(`${__dirname}/pdfs/${splitJpeg[0]}.pdf`)
              );
            } else {
              imgToPDF(pages, imgToPDF.sizes.A4).pipe(
                fs.createWriteStream(`${__dirname}/pdfs/${splitJpeg[0]}.pdf`)
              );
            }
          });
        } else {
          imgToPDF(pages, imgToPDF.sizes.A4).pipe(
            fs.createWriteStream(`${__dirname}/pdfs/${splitJpeg[0]}.pdf`)
          );
        }
      });

      setTimeout(() => {
        fs.unlinkSync(`${__dirname}/pdfs/${splitJpeg[0]}.pdf`);
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log("App is running");
});
module.exports = app;
