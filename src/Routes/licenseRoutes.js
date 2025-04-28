import express from 'express';
import {
  getLicenses,
  createLicenses,
  deleteLicense
} from '../controllers/licenseController.js';

const router = express.Router();

router.get('/', getLicenses);
router.post('/', createLicenses);
router.delete('/:id', deleteLicense);

export default router;