const router = require('express').Router();
const adminController = require('../controllers/adminController');

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

router.post('/admin/sendotp',adminController.sendotp);
router.post('/admin/signup',upload.single('images'), adminController.signUp);
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