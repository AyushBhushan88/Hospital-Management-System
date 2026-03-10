import { Router } from 'express';
import { 
  addMedicine, 
  getInventory, 
  createSale 
} from '../controllers/pharmacy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/inventory', authorize(['PHARMACIST', 'ADMIN', 'DOCTOR']), getInventory);
router.post('/medicine', authorize(['PHARMACIST', 'ADMIN']), addMedicine);
router.post('/sale', authorize(['PHARMACIST', 'ADMIN']), createSale);

export default router;
