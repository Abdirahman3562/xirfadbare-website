import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllCourses, getFullCourseDetails } from '../api/courseService';
import { getTestimonials } from '../api/testimonialService';
import { getAllInstructors } from '../api/instructorService';
import { getAllBlogs } from '../api/blogService';
import { getAllAuthors } from '../api/authorService';
import { getFAQs } from '../api/faqService';

// Create the context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Data Provider Component
export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    courses: [],
    testimonials: [],
    instructors: [],
    blogs: [],
    authors: [],
    faqs: [],
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preload all data when app starts
  useEffect(() => {
    const preloadAllData = async () => {
      try {
        console.log('🚀 Starting data preload...');
        setLoading(true);
        setError(null);

        // Fetch all data in parallel for better performance
        const [
          coursesData,
          testimonialsData,
          instructorsData,
          blogsData,
          authorsData,
          faqsData,
        ] = await Promise.allSettled([
          loadCourses(),
          getTestimonials(),
          getAllInstructors(),
          getAllBlogs(),
          getAllAuthors(),
          getFAQs(),
        ]);

        // Process results and handle any failures gracefully
        const newData = {
          courses: coursesData.status === 'fulfilled' ? coursesData.value : [],
          testimonials: testimonialsData.status === 'fulfilled' ? testimonialsData.value : [],
          instructors: instructorsData.status === 'fulfilled' ? instructorsData.value : [],
          blogs: blogsData.status === 'fulfilled' ? blogsData.value : [],
          authors: authorsData.status === 'fulfilled' ? authorsData.value : [],
          faqs: faqsData.status === 'fulfilled' ? faqsData.value : [],
          categories: extractCategories(coursesData.status === 'fulfilled' ? coursesData.value : []),
        };

        setData(newData);
        console.log('✅ All data preloaded successfully:', {
          courses: newData.courses.length,
          testimonials: newData.testimonials.length,
          instructors: newData.instructors.length,
          blogs: newData.blogs.length,
          authors: newData.authors.length,
          faqs: newData.faqs.length,
          categories: newData.categories.length,
        });

      } catch (err) {
        console.error('❌ Error preloading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    preloadAllData();
  }, []);

  // Load courses with full details
  const loadCourses = async () => {
    try {
      const allCourses = await getAllCourses();

      // Load full details for all courses in parallel
      const fullCourses = await Promise.all(
        allCourses.map(async (course) => {
          try {
            const details = await getFullCourseDetails(course._id);
            return details ? { ...course, ...details } : course;
          } catch (error) {
            console.warn(`⚠️ Failed to load details for course ${course._id}:`, error);
            return course; // Return basic course data if details fail
          }
        })
      );

      return fullCourses;
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      return [];
    }
  };

  // Extract unique categories from courses
  const extractCategories = (courses) => {
    const categorySet = new Set();
    courses.forEach(course => {
      if (course.category) {
        categorySet.add(course.category);
      }
    });
    return Array.from(categorySet);
  };

  // Function to refresh specific data type
  const refreshData = async (dataType) => {
    try {
      let newData;

      switch (dataType) {
        case 'courses':
          newData = await loadCourses();
          setData(prev => ({
            ...prev,
            courses: newData,
            categories: extractCategories(newData)
          }));
          break;
        case 'testimonials':
          newData = await getTestimonials();
          setData(prev => ({ ...prev, testimonials: newData }));
          break;
        case 'instructors':
          newData = await getAllInstructors();
          setData(prev => ({ ...prev, instructors: newData }));
          break;
        case 'blogs':
          newData = await getAllBlogs();
          setData(prev => ({ ...prev, blogs: newData }));
          break;
        case 'authors':
          newData = await getAllAuthors();
          setData(prev => ({ ...prev, authors: newData }));
          break;
        case 'faqs':
          newData = await getFAQs();
          setData(prev => ({ ...prev, faqs: newData }));
          break;
        default:
          console.warn(`⚠️ Unknown data type: ${dataType}`);
      }

      console.log(`✅ Refreshed ${dataType} data`);
    } catch (error) {
      console.error(`❌ Error refreshing ${dataType}:`, error);
    }
  };

  // Context value
  const value = {
    // Data
    courses: data.courses,
    testimonials: data.testimonials,
    instructors: data.instructors,
    blogs: data.blogs,
    authors: data.authors,
    faqs: data.faqs,
    categories: data.categories,

    // State
    loading,
    error,

    // Actions
    refreshData,

    // Helper functions
    getCourseById: (id) => data.courses.find(course => course._id === id),
    getCourseBySlug: (slug) => data.courses.find(course =>
      course.title?.toLowerCase().replace(/\s+/g, '-') === slug
    ),
    getInstructorById: (id) => data.instructors.find(instructor => instructor._id === id),
    getInstructorBySlug: (slug) => data.instructors.find(instructor =>
      instructor.name?.toLowerCase().replace(/\s+/g, '-') === slug
    ),
    getBlogByTitle: (title) => data.blogs.find(blog =>
      blog.title?.toLowerCase().replace(/\s+/g, '-') === title
    ),
    getAuthorByUsername: (username) => data.authors.find(author =>
      author.username === username
    ),
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
