const multer = require('multer');
const path = require('path');
const uploadFile = (req, res, next) => {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads')
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    const upload_file = multer({
        storage: storage,
    }).single('profile_pic');

    upload_file(req, res, async (err) => {
        if (!req.file) {
            return res.status(401).send({
                error: { message: "Select image" }
            })
        } else if (err) {
            return res.status(403).send({
                error: { message: "Image not uploaded" }
            })
        } else {
            next()
        }
    });
}

module.exports = uploadFile;