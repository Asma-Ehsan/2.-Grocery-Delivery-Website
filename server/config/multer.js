import multer from "multer";

// Configures Multer middleware to accept file uploads and temporarily save them on the server disk
export const upload = multer({ storage: multer.diskStorage({}) });

//Now we will use this multer to upload any image on cloudinary storage
