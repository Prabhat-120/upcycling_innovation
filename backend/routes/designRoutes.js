const router = require('express').Router()
const designController = require('../controllers/desigControllers');
const reqFieldMiddleware= require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkDesignerAuth;

const uploadFile = require('../middlewares/upload-file');

router.post('/sendotp',reqFieldMiddleware, designController.sendotp)
router.post('/designer/register',  designController.signup);
router.post('/designer/login', reqFieldMiddleware, designController.signin);

router.post('/designer/otpForForgetPassword', reqFieldMiddleware, designController.sendOtpForResetPass);
router.post('/designer/verifyOtp', reqFieldMiddleware, designController.verifyOtpResetPass);
router.post('/designer/resetpass',reqFieldMiddleware,designController.resetpassword);

//router.post('/designer/resetpass/:id',reqFieldMiddleware,designController.resetpassword);

router.get('/designer/getDesigner',auth,designController.getDesigner);
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
//router.post('/designer/getimage',)

router.get('/designer/getCategories',designController.getCategories);
router.get('/designer/getServices',designController.getService);
router.get('/designer/getSubServices',designController.getSubService);



module.exports = router;