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
import { checkPermission } from '../middleware/permissionMiddleware.js';

router.route('/templates').get(protect, checkPermission('certificates.view'), getCertificateTemplates);

router.route('/template')
    .get(protect, checkPermission('certificates.view'), getCertificateTemplate)
    .post(protect, checkPermission('certificates.edit'), saveCertificateTemplate);

router.route('/template/:id')
    .get(protect, getCertificateTemplateById)
    .delete(protect, checkPermission('certificates.delete'), deleteCertificateTemplate);

router.route('/template/:id/status')
    .patch(protect, checkPermission('certificates.status'), updateTemplateStatus);

export default router;
