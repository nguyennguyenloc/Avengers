var multer  = require('multer');
var randomstring = require("randomstring");
const path        = require('path');
const fs          = require('fs');
const notify      = require(__path_config + 'notify'); 

let uploadFile = (field, folderDes = 'users', fileNameLength = 10, fileSizeMB = 10000000, fileExtension = '|docx|zip|pdf|jpeg|jpg|png|gif') => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, __path_uploads + folderDes + '/');
        },
        filename: (req, file, cb) => {
          cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname));
        }
    });

    const upload = multer({ 
        storage: storage,
        limits: {
          fileSize: fileSizeMB * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const fileTypes  = new RegExp(fileExtension);
          const extName    = fileTypes.test(path.extname(file.originalname).toLowerCase());
          const mimeType   = fileTypes.test(file.mimetype);
      
          if(mimeType && extName){ 
            return cb(null, true);
          } else {  
            cb(notify.ERROR_FILE_EXTENSION);
          }
        }
    }).single(field);

    return upload;
}

let removeFile = (folder, fileName) => {
  if(fileName != "" && fileName != undefined){
    let path = folder + fileName;
    if (fs.existsSync(path)) fs.unlink(path, (err) => {if (err) throw err;});
  }
}

module.exports = {
    upload: uploadFile,
    remove: removeFile
}