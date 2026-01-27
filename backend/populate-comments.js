import mongoose from 'mongoose';
import Comment from './models/Comment.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleComments = [
  {
    blogId: "507f1f77bcf86cd799439011", // Replace with actual blog ID
    content: "This is a great article! Very informative and well-written.",
    author: {
      name: "Ahmed Mohamed",
      email: "ahmed@example.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    blogId: "507f1f77bcf86cd799439011", // Replace with actual blog ID
    content: "I completely agree with your points. The examples you provided really helped me understand the concept better.",
    author: {
      name: "Fatima Ali",
      email: "fatima@example.com",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg"
    }
  },
  {
    blogId: "507f1f77bcf86cd799439011", // Replace with actual blog ID
    content: "Could you elaborate more on the third point? I'm interested in learning more about that specific aspect.",
    author: {
      name: "Omar Hassan",
      email: "omar@example.com",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  }
];

async function populateComments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to MongoDB');

    // Clear existing comments
    await Comment.deleteMany({});
    console.log('🗑️ Cleared existing comments');

    // Insert sample comments
    const insertedComments = await Comment.insertMany(sampleComments);
    console.log(`✅ Inserted ${insertedComments.length} sample comments`);

    // Create some replies for demonstration
    if (insertedComments.length >= 2) {
      const replies = [
        {
          blogId: insertedComments[0].blogId,
          content: "Thank you! I'm glad you found it helpful.",
          author: {
            name: "Author Reply",
            email: "author@example.com",
            avatar: "https://randomuser.me/api/portraits/men/12.jpg"
          },
          parentId: insertedComments[0]._id
        },
        {
          blogId: insertedComments[2].blogId,
          content: "Sure! The third point refers to the implementation details. I'll write a follow-up article about it.",
          author: {
            name: "Author Reply",
            email: "author@example.com",
            avatar: "https://randomuser.me/api/portraits/men/12.jpg"
          },
          parentId: insertedComments[2]._id
        }
      ];

      const insertedReplies = await Comment.insertMany(replies);
      console.log(`✅ Inserted ${insertedReplies.length} sample replies`);
    }

    console.log('🎉 Comments population completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log('- 3 top-level comments');
    console.log('- 2 replies');
    console.log('- All comments include author information and timestamps');

  } catch (error) {
    console.error('❌ Error populating comments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the population script
populateComments();


