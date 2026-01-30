import express from 'express';
const router = express.Router();
import {
    getCertificateTemplates,
    getCertificateTemplateById,
    getCertificateTemplate,
    saveCertificateTemplate,
    deleteCertificateTemplate,
    updateTemplateStatus
} from '../controllers/certificateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/templates').get(protect, admin, getCertificateTemplates);

router.route('/template')
    .get(protect, admin, getCertificateTemplate)
    .post(protect, admin, saveCertificateTemplate);

router.route('/template/:id')
    .get(protect, getCertificateTemplateById)
    .delete(protect, admin, deleteCertificateTemplate);

router.route('/template/:id/status')
    .patch(protect, admin, updateTemplateStatus);

export default router;
