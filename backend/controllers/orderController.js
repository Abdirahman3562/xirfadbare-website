import Order from '../models/Order.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import sendEmail from '../utils/sendEmail.js';
import { orderApprovedTemplate, orderRejectedTemplate } from '../utils/emailTemplates.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    courseId,
    courseTitle,
    paymentType,
    paymentMethod,
    phoneNumber,
    totalToPay,
    discountApplied = 0,
    finalPrice,
    paymentProof,
  } = req.body;

  if (!courseId) {
    res.status(400).json({ message: 'No course selected' });
    return;
  }

  try {
    // Fetch complete user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch complete course data with instructor information
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const order = new Order({
      user: req.user._id,
      course: courseId,

      // Complete user details
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },

      // Complete course details
      courseDetails: {
        title: course.title,
        type: course.type,
        description: course.description,
        technology: course.technology,
        price: course.price,
        accessType: course.accessType,
        thumbnail: course.thumbnail,
        level: course.level,
        enrolledCount: course.enrolledCount,
        instructor: course.instructor ? {
          name: course.instructor.name,
          instructorTitle: course.instructor.instructorTitle,
          image: course.instructor.image,
          description: course.instructor.description,
          contactEmail: course.instructor.contactEmail,
          contactPhone: course.instructor.contactPhone,
        } : null,
        learningOutcomes: course.learningOutcomes,
        discountCode: course.discountCode,
        discountPercentage: course.discountPercentage,
        isBestSeller: course.isBestSeller,
        curriculum: course.curriculum.map(curr => ({
          title: curr.title,
          lessons: curr.lessons.map(lesson => ({
            title: lesson.title,
            duration: lesson.duration,
            videoUrl: lesson.videoUrl,
          })),
        })),
      },

      // Legacy fields for backward compatibility
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      courseTitle: course.title,

      // Payment information
      paymentType,
      paymentMethod,
      phoneNumber,
      totalToPay,
      discountApplied,
      finalPrice: finalPrice || totalToPay,
      paymentProof,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to active (Approve)
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
const updateOrderToActive = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = 'active';
    const updatedOrder = await order.save();

    // Send Approval Email
    try {
      if (order.userDetails && order.userDetails.email) {
        await sendEmail({
          email: order.userDetails.email,
          subject: 'Enrollment Approved - Xirfadbare Academy',
          html: orderApprovedTemplate(order),
        });
      }
    } catch (error) {
      console.error('Failed to send approval email', error);
      // Continue without failing the request
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to rejected
// @route   PUT /api/orders/:id/reject
// @access  Private/Admin
const updateOrderToRejected = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = 'rejected';
    const updatedOrder = await order.save();

    // Send Rejection Email
    try {
      if (order.userDetails && order.userDetails.email) {
        await sendEmail({
          email: order.userDetails.email,
          subject: 'Order Update - Xirfadbare Academy',
          html: orderRejectedTemplate(order),
        });
      }
    } catch (error) {
      console.error('Failed to send rejection email', error);
      // Continue without failing the request
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id firstName lastName image').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderToActive,
  updateOrderToRejected,
  deleteOrder,
  getMyOrders,
  getOrders,
};


