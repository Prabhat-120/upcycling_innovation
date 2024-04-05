const multer = require('multer');
const path = require('path');
const uploadFile = (req, res, next) => {
    
    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            cb(null, './uploads')
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
        }
    });

    const upload_file = multer({
        storage: storage,
    }).single('profile_pic');

    upload_file(req, res, async (err) => {
        // console.log(req.file);
        console.log("first")
        if (!req.file) {
            return res.status(403).send({
                error: { message: "Select image" }
            })
        } else if (err) {
            return res.status(403).send({
                error: { message: "Image not uploaded" }
            })

        } else {
            // console.log(process.env.BASE_URL);
            // req.body.imgUrl = { filepath_url: req.file.filename, url: process.env.BASE_URL + "/uploads/" + req.file.filename }
            next()
        }
    });
}

module.exports = uploadFile