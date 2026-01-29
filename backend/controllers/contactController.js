import Contact from '../models/Contact.js';
import sendEmail from '../utils/sendEmail.js';


// @desc    Create a new contact message
// @route   POST /api/contacts
// @access  Public
const createContact = async (req, res) => {
  try {
    const { name, phone, email, about, message } = req.body;

    const contact = new Contact({
      name,
      phone,
      email,
      about,
      message,
    });

    const createdContact = await contact.save();
    res.status(201).json(createdContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Server error while creating contact message' });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          about: 1,
          message: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          'userDetails.image': 1,
          'userDetails._id': 1
        },
      },
    ]);
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error while fetching contact messages' });
  }
};

// @desc    Get single contact message by ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: 'Contact message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contacts/:id
// @access  Private/Admin
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
      contact.status = req.body.status || contact.status;
      const updatedContact = await contact.save();
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Contact message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (contact) {
      res.json({ message: 'Contact message removed' });
    } else {
      res.status(404).json({ message: 'Contact message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contacts/:id/reply
// @access  Private/Admin
const replyToContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    const { replyMessage, subject } = req.body;

    // Send email
    await sendEmail({
      email: contact.email,
      subject: subject || `Re: ${contact.about || 'Your inquiry'}`,
      message: replyMessage,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .header { background-color: #059669; color: #ffffff; padding: 32px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.025em; }
            .content { padding: 40px 32px; color: #374151; line-height: 1.6; }
            .message-box { background-color: #f3f4f6; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 4px; color: #4b5563; font-style: italic; }
            .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .button { display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Xirfad Bare Academy</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; font-weight: 600; color: #111827;">Dear ${contact.name},</p>
              
              <p>Thank you for reaching out to us. We have received your inquiry regarding:</p>
              
              <div class="message-box">
                "${contact.about || 'General Inquiry'}"
              </div>

              <p>${replyMessage}</p>

              <p style="margin-top: 32px;">If you have any further questions, please feel free to reply to this email.</p>

              <br>
              <p style="margin-bottom: 0;">Best regards,</p>
              <p style="font-weight: 700; color: #059669; margin-top: 4px;">The Xirfad Bare Support Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Xirfad Bare Academy. All rights reserved.</p>
              <p>Mogadishu, Somalia</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Update status to 'replied'
    contact.status = 'replied';
    await contact.save();

    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

export {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  replyToContact
};


