const router = require('express').Router()
const designController = require('../controllers/desigControllers');
const reqFieldMiddleware= require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkDesignerAuth;

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
  
const upload = multer({
  storage: storage
});


router.post('/sendotp',reqFieldMiddleware, designController.sendotp)
router.post('/design/register', upload.single('profile_pic'), designController.signup);
router.post('/designer/login', reqFieldMiddleware, designController.signin);
router.post('/designer/slfrp',reqFieldMiddleware, designController.sendlinkresetPassword);
router.post('/designer/resetpass/:id',reqFieldMiddleware,designController.resetpassword);
router.post('/designer/changePass',reqFieldMiddleware, auth, designController.changePassword);

router.post('/designer/myprofile/addservices', reqFieldMiddleware, auth, designController.addServices);
router.post('/designer/myprofile/delservices', reqFieldMiddleware, auth, designController.deleteService);
router.get('/designer/myprofile/seeservices', auth, designController.getAllServices)

router.post('/designer/myprofile/addProducts', reqFieldMiddleware, auth, designController.addProduct);
router.post('/designer/myprofile/delProducts', reqFieldMiddleware, auth, designController.delProduct);
router.get('/designer/myprofile/seeProducts', auth, designController.getAllProduct);

router.post('/designer/myprofile/addSubService', reqFieldMiddleware, auth, designController.addSubService);
router.post('/designer/myprofile/delSubService', reqFieldMiddleware, auth, designController.delSubService);
router.get('/designer/myprofile/seeSubService', auth, designController.getAllSubService)

router.post('/designer/myprofile/updateBio', reqFieldMiddleware, auth, designController.updateBio);
router.get('/designer/latestOrder', auth, designController.latestOrder );
router.post('/designer/updateStatus',reqFieldMiddleware, auth, designController.updateOrderStatus);
router.get('/designer/previousOrder', auth, designController.previousOrder);

router.post('/designer/sendNotification',auth,designController.sendNotification);



module.exports = router;