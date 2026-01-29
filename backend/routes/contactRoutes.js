import express from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  replyToContact
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, checkPermission('contacts.view'), getContacts)
  .post(createContact);

router.route('/:id')
  .get(protect, checkPermission('contacts.view'), getContactById)
  .put(protect, checkPermission('contacts.reply'), updateContact)
  .delete(protect, checkPermission('contacts.delete'), deleteContact);

router.route('/:id/reply').post(protect, checkPermission('contacts.reply'), replyToContact);

export default router;

