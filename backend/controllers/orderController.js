import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Bundle from '../models/Bundle.js';
import sendEmail from '../utils/sendEmail.js';
import { orderApprovedTemplate, orderRejectedTemplate } from '../utils/emailTemplates.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    courseId,
    bundleId,
    courseTitle,
    paymentType,
    paymentMethod,
    phoneNumber,
    totalToPay,
    discountApplied = 0,
    finalPrice,
    paymentProof,
    isBundle = false,
  } = req.body;

  if (!courseId && !bundleId) {
    res.status(400).json({ message: 'No course or bundle selected' });
    return;
  }

  try {
    // Fetch complete user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch complete course or bundle data
    let course = null;
    let bundle = null;

    if (isBundle && bundleId) {
      bundle = await Bundle.findById(bundleId).populate('courses');
      if (!bundle) {
        return res.status(404).json({ message: 'Bundle not found' });
      }
    } else {
      course = await Course.findById(courseId).populate('instructor');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    const order = new Order({
      user: req.user._id,
      course: courseId,
      bundle: bundleId,
      isBundle: isBundle,
      bundleCourses: bundle ? bundle.courses.map(c => ({
        _id: c._id,
        title: c.title,
        thumbnail: c.thumbnail,
        level: c.level,
        slug: c.title?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      })) : [],

      // Complete user details
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },

      // Complete course/bundle details
      courseDetails: bundle ? {
        title: bundle.title,
        price: bundle.price,
        thumbnail: bundle.thumbnail,
        description: bundle.description,
      } : {
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
      courseTitle: bundle ? bundle.title : course.title,

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
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.isBundle && order.bundle) {
        // 📦 Handle Bundle Approval
        const bundle = await Bundle.findById(order.bundle).populate('courses');
        if (bundle) {
          for (const course of bundle.courses) {
            // Check if user already has access to this course
            const existingEnrollment = await Order.findOne({
              user: order.user,
              course: course._id,
              status: 'active'
            });

            if (!existingEnrollment) {
              // Create a individual course order (Enrollment)
              const newOrder = new Order({
                user: order.user,
                course: course._id,
                userDetails: order.userDetails,
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
                  curriculum: course.curriculum.map(curr => ({
                    title: curr.title,
                    lessons: curr.lessons.map(lesson => ({
                      title: lesson.title,
                      duration: lesson.duration,
                      videoUrl: lesson.videoUrl,
                    })),
                  })),
                },
                userName: order.userName,
                userEmail: order.userEmail,
                courseTitle: course.title,
                paymentType: 'Bundle Access',
                paymentMethod: order.paymentMethod,
                status: 'active', // Automatically active
                totalToPay: 0,
                finalPrice: 0,
              });
              await newOrder.save();
            }
          }
        }
      }

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
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ message: 'Server error while approving order' });
  }
};

// @desc    Free Course Enrollment
// @route   POST /api/orders/free-enroll
// @access  Private
const freeEnrollment = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the course is really free
    if (course.price !== 0) {
      return res.status(400).json({ message: 'This course is not free' });
    }

    // Check if already enrolled (active order)
    const existingOrder = await Order.findOne({
      user: req.user._id,
      course: courseId,
      status: 'active'
    });

    if (existingOrder) {
      return res.status(200).json(existingOrder); // Already enrolled
    }

    const user = await User.findById(req.user._id);

    const order = new Order({
      user: req.user._id,
      course: courseId,
      status: 'active', // Free courses are immediately active
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
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
        curriculum: course.curriculum.map(curr => ({
          title: curr.title,
          lessons: curr.lessons.map(lesson => ({
            title: lesson.title,
            duration: lesson.duration,
            videoUrl: lesson.videoUrl,
          })),
        })),
      },
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      courseTitle: course.title,
      paymentType: 'Free Enrollment',
      paymentMethod: 'None',
      totalToPay: 0,
      finalPrice: 0,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in free enrollment:', error);
    res.status(500).json({ message: 'Server error during free enrollment' });
  }
};

// @desc    Update order to rejected
// @route   PUT /api/orders/:id/reject
// @access  Private/Admin
const updateOrderToRejected = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ message: 'Server error while rejecting order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id
  }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'firstName lastName image').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
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
  freeEnrollment,
};


