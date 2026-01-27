import FAQ from '../models/FAQ.js';

// @desc    Get all active FAQs
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get FAQ by ID
// @route   GET /api/faqs/:id
// @access  Public
const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (faq) {
      res.json(faq);
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order, language } = req.body;

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      order: order || 0,
      language: language || 'so',
    });

    const createdFAQ = await faq.save();
    res.status(201).json(createdFAQ);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (faq) {
      res.json(faq);
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (faq) {
      res.json({ message: 'FAQ deleted successfully' });
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};



