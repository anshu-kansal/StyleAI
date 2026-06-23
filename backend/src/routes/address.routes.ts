import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import * as AddressController from '../controllers/address.controller';

const router = Router();

// All address routes require authentication
router.use(authMiddleware);

router.get('/', AddressController.listAddresses);
router.get('/:id', AddressController.getAddressById);
router.post('/', validate({ body: createAddressSchema }), AddressController.createAddress);
router.put('/:id', validate({ body: updateAddressSchema }), AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);

export default router;
