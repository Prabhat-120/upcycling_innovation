const router = require('express').Router();
const adminController = require('../controllers/adminController');
const fieldrequire = require('../middlewares/requireField');
const auth = require('../middlewares/auth-middleware').checkAdminAuth;


const uploadFile = require('../middlewares/upload-file');

router.post('/admin/sendotp', fieldrequire, adminController.sendotp);
router.post('/admin/signup', uploadFile, adminController.signUp);
router.post('/admin/signin', fieldrequire, adminController.signin);

router.get('/admin/getAllConsumer', auth, adminController.getAllConsumer);
router.get('/admin/filterConsumer', auth, adminController.filterConsumerData);

// router.post('/admin/filterConsumerDate', fieldrequire, auth, adminController.filterConsumerWithDate);
// router.post('/admin/filterConsumerName', fieldrequire, auth, adminController.filterConsumerWithName);

router.get('/admin/getAllDesigner', auth, adminController.getAllDesigner);
router.get('/admin/filterDesigner', auth, adminController.filterDesignerData);

//  router.post('/admin/filterDesignerDate', fieldrequire, auth, adminController.getDesignerWithDate);
//  router.post('/admin/filterDesignerName', fieldrequire, auth, adminController.getDesignerWithName);

router.post('/admin/filterOrderDate', fieldrequire, auth, adminController.totalorder);
router.post('/admin/addDesigner', uploadFile, adminController.addDesigner);

router.post('/admin/addCategory', uploadFile, adminController.addProduct);
router.post('/admin/editCategory/:id', uploadFile, adminController.editProduct);
router.post('/admin/delCategory/:id', adminController.delProduct);

router.post('/admin/addServices', uploadFile, auth, adminController.addServices);
router.post('/admin/updateServices/:id',)

router.post('/admin/addSubservices', fieldrequire, auth, adminController.addSubService)


router.get('/admin/checkConsumerStatus', adminController.checkConsumerStatus);
router.get('/admin/checkDeletedConsumer', adminController.checkDeletedConsumer);



module.exports = router;