const router = require('express').Router();
const consumerController = require('../controllers/consumerController');
const reqFieldMiddleware = require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkConsumerAuth;
const uploadFile = require('../middlewares/upload-file');


router.post('/consumer/otpsend', reqFieldMiddleware, consumerController.sendOTPToConsumer);
router.post('/consumer/register', uploadFile, consumerController.signup);
router.post('/consumer/login', reqFieldMiddleware, consumerController.signin);

router.post('/consumer/slfrp', reqFieldMiddleware, consumerController.sendLinkResetPassword);
router.post('/consumer/resetPassword/:id', reqFieldMiddleware, consumerController.resetPassword);

router.post('/consumer/changePassword', reqFieldMiddleware, auth, consumerController.changePassword);

router.get('/consumer/allProduct', auth, consumerController.getAllProducts);
router.get('/consumer/getAllService', auth, consumerController.getAllServices);
router.get('/consumer/search', auth, consumerController.searching);

//router.post('/consumer/getService', auth, consumerController.getService);

router.post('/consumer/nearestDesigner', auth, consumerController.getDesigner);

router.post('/consumer/order',  auth, uploadFile, consumerController.giveOrder);

router.get('/consumer/pendingOrder', auth, consumerController.processingOrder);
router.get('/consumer/previousOrder', auth, consumerController.previousOrder);

router.post('/consumer/contact', reqFieldMiddleware, auth, consumerController.contactUs);

module.exports = router;
