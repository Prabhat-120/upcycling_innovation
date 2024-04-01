const router = require('express').Router();
const consumerController = require('../controllers/consumerController');
const reqFieldMiddleware= require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkConsumerAuth;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null, "uploads/");
    },
    filename:(req,file,cb)=>{
      cb(null,file.fieldname + '-' + Date.now() +path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});


router.post('/consumer/otpsend', reqFieldMiddleware, consumerController.sendotp);
router.post('/consumer/register', reqFieldMiddleware, upload.single('images'), consumerController.signup);
router.post('/consumer/login', reqFieldMiddleware, consumerController.signin);

router.post('/consumer/slfrp', reqFieldMiddleware, consumerController.sendLinkResetPassword);
router.post('/consumer/resetPassword/:id', reqFieldMiddleware, consumerController.resetPassword);

router.post('/consumer/changePassword', reqFieldMiddleware, auth, consumerController.changePassword);
router.get('/consumer/allProduct', auth, consumerController.getAllProducts);
router.post('/consumer/getService', auth, consumerController.getService);
router.get('/consumer/getAllService', auth, consumerController.getAllServices);


router.post('/consumer/nearestDesigner',auth, consumerController.getDesigner);

router.post('/consumer/order', reqFieldMiddleware, auth, consumerController.giveOrder);

router.get('/consumer/pendingOrder', auth, consumerController.processingOrder);
router.get('/consumer/previousOrder', auth, consumerController.previousOrder);

router.post('/consumer/contact', reqFieldMiddleware, auth, consumerController.contactUs);

module.exports = router;
