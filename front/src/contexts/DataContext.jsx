import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllCourses, getFullCourseDetails } from '../api/courseService';
import { getTestimonials } from '../api/testimonialService';
import { getAllInstructors } from '../api/instructorService';
import { getAllBlogs } from '../api/blogService';
import { getAllAuthors } from '../api/authorService';
import { getFAQs } from '../api/faqService';
import { getAllBundles } from '../api/bundleService';
import { slugify } from '../utils/slugify';

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
    bundles: [],
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
        const results = await Promise.allSettled([
          loadCourses(),
          getTestimonials(),
          getAllInstructors(),
          getAllBlogs(),
          getAllAuthors(),
          getFAQs(),
          getAllBundles(),
        ]);

        const [
          coursesRes,
          testimonialsRes,
          instructorsRes,
          blogsRes,
          authorsRes,
          faqsRes,
          bundlesRes,
        ] = results;

        // Process results and handle any failures gracefully
        const newData = {
          courses: coursesRes.status === 'fulfilled' ? coursesRes.value : [],
          testimonials: testimonialsRes.status === 'fulfilled' ? testimonialsRes.value : [],
          instructors: instructorsRes.status === 'fulfilled' ? instructorsRes.value : [],
          blogs: blogsRes.status === 'fulfilled' ? blogsRes.value : [],
          authors: authorsRes.status === 'fulfilled' ? authorsRes.value : [],
          faqs: faqsRes.status === 'fulfilled' ? faqsRes.value : [],
          categories: extractCategories(coursesRes.status === 'fulfilled' ? coursesRes.value : []),
          bundles: bundlesRes.status === 'fulfilled' ? bundlesRes.value : [],
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
          setData(prev => ({ ...prev, faqs: newData }));
          break;
        case 'bundles':
          newData = await getAllBundles();
          setData(prev => ({ ...prev, bundles: newData }));
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
    bundles: data.bundles,

    // State
    loading,
    error,

    // Actions
    refreshData,

    // Helper functions
    getCourseById: (id) => data.courses.find(course => course._id === id),
    getCourseBySlug: (slug) => data.courses.find(course =>
      course.slug === slug ||
      slugify(course.title) === slug
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
