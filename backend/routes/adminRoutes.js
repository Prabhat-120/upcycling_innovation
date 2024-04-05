const router = require('express').Router();
const adminController = require('../controllers/adminController');

const uploadFile = require('../middlewares/upload-file');

router.post('/admin/sendotp',adminController.sendotp);
router.post('/admin/signup',uploadFile, adminController.signUp);
router.post('/admin/login',adminController.login);
  
router.get('/admin/getAllConsumer', adminController.getAllConsumer);
router.post('/admin/filterConsumerDate', adminController.filterConsumerWithDate);
router.post('/admin/filterConsumerName', adminController.filterConsumerWithName);

router.get('/admin/getAllDesigner', adminController.getAllDesigner);
router.post('/admin/filterDesignerDate', adminController.getDesignerWithDate);
router.post('/admin/filterDesignerName', adminController.getDesignerWithName);

router.post('/admin/filterOrderDate', adminController.totalorder);
router.post('/admin/getAllDesigner',adminController.addDesigner);

router.post('/admin/addCategory', upload.single('productPic'), adminController.addProduct);
router.post('/admin/editCategory/:id', upload.single('productPic'), adminController.editProduct);
router.post('/admin/delCategory/:id', adminController.delProduct);


router.get('/admin/checkConsumerStatus', adminController.checkConsumerStatus);
router.get('/admin/checkDeletedConsumer', adminController.checkDeletedConsumer);



module.exports = router;