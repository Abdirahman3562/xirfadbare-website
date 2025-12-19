import express from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getContacts)
  .post(createContact);

router.route('/:id')
  .get(protect, getContactById)
  .put(protect, updateContact)
  .delete(protect, deleteContact);

export default router;

