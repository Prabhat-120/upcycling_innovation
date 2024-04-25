const router = require('express').Router();
const adminController = require('../controllers/adminController');
const fieldrequire = require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkAdminAuth;


const uploadFile = require('../middlewares/upload-file');

router.post('/admin/sendotp', fieldrequire, adminController.sendotp);
router.post('/admin/signup', uploadFile, adminController.signUp);
router.post('/admin/signin', fieldrequire, adminController.signin);

router.get('/admin/filterConsumer', auth, adminController.filterConsumerData);
router.get('/admin/filterDesigner', auth, adminController.filterDesignerData);

router.get('/admin/filterOrderDate', auth, adminController.totalorder);
router.post('/admin/addDesigner', uploadFile, adminController.addDesigner);

router.post('/admin/addCategory', uploadFile, adminController.addProduct);
router.post('/admin/editCategory/:id', uploadFile, adminController.editProduct);
router.post('/admin/delCategory/:id', adminController.delProduct);

router.post('/admin/addServices', uploadFile, auth, adminController.addServices);
router.post('/admin/updateServices/:id',)

router.post('/admin/addSubservices', fieldrequire, auth, adminController.addSubService)


router.get('/admin/checkConsumerStatus', auth, adminController.checkConsumerStatus);
router.get('/admin/checkDesignerStatus', auth, adminController.checkDesignerStatus);

router.get('/admin/checkDeletedConsumer', auth, adminController.checkDeletedConsumer);
router.get('/admin/checkDeletedDesigner', auth, adminController.checkDeletedDesigner);



module.exports = router;