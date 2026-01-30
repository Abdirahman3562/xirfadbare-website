import CertificateTemplate from '../models/CertificateTemplate.js';

// @desc    Get all certificate templates
// @route   GET /api/certificates/templates
// @access  Private/Admin
const getCertificateTemplates = async (req, res) => {
    try {
        const templates = await CertificateTemplate.find({}).sort({ updatedAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get certificate template by ID
// @route   GET /api/certificates/template/:id
// @access  Private/Admin
const getCertificateTemplateById = async (req, res) => {
    try {
        const template = await CertificateTemplate.findById(req.params.id);
        if (template) {
            res.json(template);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get active certificate template
// @route   GET /api/certificates/template
// @access  Private/Admin
const getCertificateTemplate = async (req, res) => {
    try {
        const template = await CertificateTemplate.findOne({ isActive: true }).sort({ updatedAt: -1 });

        if (template) {
            res.json(template);
        } else {
            res.json({
                name: 'Default Template',
                backgroundUrl: '',
                layout: [],
                canvasWidth: 842,
                canvasHeight: 595
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save/Update certificate template
// @route   POST /api/certificates/template
// @access  Private/Admin
const saveCertificateTemplate = async (req, res) => {
    try {
        const { id, name, backgroundUrl, layout, canvasWidth, canvasHeight } = req.body;

        if (id) {
            const template = await CertificateTemplate.findById(id);
            if (template) {
                template.name = name || template.name;
                template.backgroundUrl = backgroundUrl || template.backgroundUrl;
                template.layout = layout || template.layout;
                template.canvasWidth = canvasWidth || template.canvasWidth;
                template.canvasHeight = canvasHeight || template.canvasHeight;
                const updatedTemplate = await template.save();
                return res.json(updatedTemplate);
            }
        }

        // Create new
        const newTemplate = new CertificateTemplate({
            name,
            backgroundUrl,
            layout,
            canvasWidth,
            canvasHeight
        });

        const createdTemplate = await newTemplate.save();
        res.status(201).json(createdTemplate);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete certificate template
// @route   DELETE /api/certificates/template/:id
// @access  Private/Admin
const deleteCertificateTemplate = async (req, res) => {
    try {
        const template = await CertificateTemplate.findById(req.params.id);
        if (template) {
            await template.deleteOne();
            res.json({ message: 'Template removed' });
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update template status
// @route   PATCH /api/certificates/template/:id/status
// @access  Private/Admin
const updateTemplateStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const template = await CertificateTemplate.findById(req.params.id);

        if (template) {
            // If activating, deactivate others
            if (isActive) {
                await CertificateTemplate.updateMany({ _id: { $ne: template._id } }, { isActive: false });
            }
            template.isActive = isActive;
            const updatedTemplate = await template.save();
            res.json(updatedTemplate);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    getCertificateTemplates,
    getCertificateTemplateById,
    getCertificateTemplate,
    saveCertificateTemplate,
    deleteCertificateTemplate,
    updateTemplateStatus
};
