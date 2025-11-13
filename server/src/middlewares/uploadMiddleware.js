import multer from 'multer';
import path from 'path';
import fs from 'fs';

const candidateUploadDir = 'uploads/candidates';
const studentUploadDir = 'uploads/students';

if (!fs.existsSync(candidateUploadDir)) {
  fs.mkdirSync(candidateUploadDir, { recursive: true });
}
if (!fs.existsSync(studentUploadDir)) {
  fs.mkdirSync(studentUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = candidateUploadDir;
    
    if (req.route && req.route.path.includes('student')) {
      uploadDir = studentUploadDir;
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: fileFilter
});

export default upload;