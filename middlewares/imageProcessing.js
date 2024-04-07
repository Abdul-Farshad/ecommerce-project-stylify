const sharp = require("sharp");

const processImage = async (req, res, next) => {
  try {
    // Check if there are any files to process
    if (req.file) {
      // Single file upload
      await processSingleFile(req.file);
    } else if (req.files && req.files.length > 0) {
      // Process each file
      await Promise.all(
        req.files.map(async (file) => {
          console.log("file received", file);
          file.path = file.path.replace(/\\/g, "/");
          const imagePath = file.path.replace(/^.*public\//, "");
          const destinationPath = file.destination.replace("./public", "");
          const croppedImagePath = `${destinationPath}/cropped-${file.filename}`;
          await sharp(file.path)
            .resize({ width: 800, height: 1100 })
            .toFile(`./public${croppedImagePath}`);
          file.path = croppedImagePath;
        }),
      );
    }
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Image processing error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const processSingleFile = async (file) => {
  file.path = file.path.replace(/\\/g, "/");
  const imagePath = file.path.replace(/^.*public\//, "");
  const destinationPath = file.destination.replace("./public", "");
  const croppedImagePath = `${destinationPath}/cropped-${file.filename}`;
  await sharp(file.path)
    .resize({ width: 800, height: 1100 })
    .toFile(`./public${croppedImagePath}`);
  file.path = croppedImagePath;
};

module.exports = processImage;
