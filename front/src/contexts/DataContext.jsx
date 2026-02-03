import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllCourses, getFullCourseDetails } from '../api/courseService';
import { getTestimonials } from '../api/testimonialService';
import { getAllInstructors } from '../api/instructorService';
import { getAllBlogs } from '../api/blogService';
import { getAllAuthors } from '../api/authorService';
import { getFAQs } from '../api/faqService';
import { getAllBundles } from '../api/bundleService';
import { slugify } from '../utils/slugify';
import { API_BASE_URL } from '../config';

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
  // Initialize state from localStorage if available
  const getInitialState = () => {
    const cached = localStorage.getItem('samafale_data_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log('📦 Data hydrated from cache');
        return {
          ...parsed,
          loading: false, // Don't block UI if we have cache
          hydrated: true
        };
      } catch (e) {
        console.error('❌ Failed to parse cache:', e);
      }
    }
    return {
      courses: [],
      testimonials: [],
      instructors: [],
      blogs: [],
      authors: [],
      faqs: [],
      categories: [],
      bundles: [],
      stats: { students: 0, instructors: 0 },
      settings: null,
      loading: true,
      hydrated: false
    };
  };

  const initialState = getInitialState();
  const [data, setData] = useState({
    courses: initialState.courses,
    testimonials: initialState.testimonials,
    instructors: initialState.instructors,
    blogs: initialState.blogs,
    authors: initialState.authors,
    faqs: initialState.faqs,
    categories: initialState.categories,
    bundles: initialState.bundles,
    stats: initialState.stats,
    settings: initialState.settings
  });

  const [loading, setLoading] = useState(initialState.loading);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Preload all data when app starts
  useEffect(() => {
    const preloadAllData = async () => {
      let loadingTimer = null;
      try {
        // Only set loading to true if we don't have hydrated data
        const isHydrated = initialState.hydrated;
        if (!isHydrated) setLoading(true);
        setSyncing(true); // Always set syncing to true during refresh

        // Add a small artificial delay ONLY if not hydrated (min 1.2s)
        const minLoadingPromise = isHydrated
          ? Promise.resolve()
          : new Promise(resolve => setTimeout(resolve, 1200));

        // Safety timeout to ensure loading doesn't hang more than 3s
        loadingTimer = setTimeout(() => setLoading(false), 3000);

        console.log('🚀 Starting background data sync...');
        setError(null);

        // Fetch all data in parallel
        const results = await Promise.allSettled([
          loadCourses(),
          getTestimonials(),
          getAllInstructors(),
          getAllBlogs(),
          getAllAuthors(),
          getFAQs(),
          getAllBundles(),
          fetch(`${API_BASE_URL}/stats`).then(res => res.json()),
          fetch(`${API_BASE_URL}/settings`).then(res => res.json()),
        ]);

        const [
          coursesRes,
          testimonialsRes,
          instructorsRes,
          blogsRes,
          authorsRes,
          faqsRes,
          bundlesRes,
          statsRes,
          settingsRes,
        ] = results;

        const newData = {
          courses: coursesRes.status === 'fulfilled' ? coursesRes.value : data.courses,
          testimonials: testimonialsRes.status === 'fulfilled' ? testimonialsRes.value : data.testimonials,
          instructors: instructorsRes.status === 'fulfilled' ? instructorsRes.value : data.instructors,
          blogs: blogsRes.status === 'fulfilled' ? blogsRes.value : data.blogs,
          authors: authorsRes.status === 'fulfilled' ? authorsRes.value : data.authors,
          faqs: faqsRes.status === 'fulfilled' ? faqsRes.value : data.faqs,
          bundles: bundlesRes.status === 'fulfilled' ? bundlesRes.value : data.bundles,
          stats: statsRes.status === 'fulfilled' ? statsRes.value : data.stats,
          settings: settingsRes.status === 'fulfilled' ? settingsRes.value : data.settings,
        };

        // Add categories
        newData.categories = extractCategories(newData.courses);

        setData(newData);

        // Save to cache
        localStorage.setItem('samafale_data_cache', JSON.stringify(newData));
        console.log('✅ Background sync complete and cached');

        // Wait for both data and our minimum loading time
        await minLoadingPromise;
      } catch (err) {
        console.error('❌ Error preloading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setSyncing(false); // Done syncing
        if (loadingTimer) clearTimeout(loadingTimer);
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
            return course;
          }
        })
      );

      return fullCourses;
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      return [];
    }
  };

  // Extract unique categories
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
      let newDataValue;

      switch (dataType) {
        case 'courses':
          newDataValue = await loadCourses();
          setData(prev => {
            const up = { ...prev, courses: newDataValue, categories: extractCategories(newDataValue) };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'testimonials':
          newDataValue = await getTestimonials();
          setData(prev => {
            const up = { ...prev, testimonials: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'instructors':
          newDataValue = await getAllInstructors();
          setData(prev => {
            const up = { ...prev, instructors: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'blogs':
          newDataValue = await getAllBlogs();
          setData(prev => {
            const up = { ...prev, blogs: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'authors':
          newDataValue = await getAllAuthors();
          setData(prev => {
            const up = { ...prev, authors: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'stats':
          newDataValue = await fetch(`${API_BASE_URL}/stats`).then(res => res.json());
          setData(prev => {
            const up = { ...prev, stats: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        case 'settings':
          newDataValue = await fetch(`${API_BASE_URL}/settings`).then(res => res.json());
          setData(prev => {
            const up = { ...prev, settings: newDataValue };
            localStorage.setItem('samafale_data_cache', JSON.stringify(up));
            return up;
          });
          break;
        default:
          console.warn(`⚠️ Unknown data type: ${dataType}`);
      }
    } catch (error) {
      console.error(`❌ Error refreshing ${dataType}:`, error);
    }
  };

  const value = {
    ...data,
    loading,
    syncing,
    error,
    refreshData,
    getCourseById: (id) => data.courses.find(course => course._id === id),
    getCourseBySlug: (slug) => data.courses.find(course =>
      course.slug === slug || slugify(course.title) === slug
    ),
    getInstructorById: (id) => data.instructors.find(instructor => instructor._id === id),
    getInstructorBySlug: (slug) => data.instructors.find(instructor =>
      instructor.slug === slug || slugify(instructor.name || '') === slug
    ),
    getBlogByTitle: (title) => data.blogs.find(blog =>
      slugify(blog.title || '') === title
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
