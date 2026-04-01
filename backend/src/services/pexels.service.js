import { createClient } from 'pexels';

/**
 * Pexels API Service
 * Fetches high-quality, royalty-free videos for the platform
 * 
 * Get your free API key: https://www.pexels.com/api/
 * Add to .env: PEXELS_API_KEY=your_key_here
 */

let pexelsClient = null;

export const initPexelsClient = () => {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  PEXELS_API_KEY not found in .env. Using fallback URLs.');
    return null;
  }
  
  if (!pexelsClient) {
    pexelsClient = createClient(apiKey);
    console.log('✅ Pexels API client initialized');
  }
  
  return pexelsClient;
};

/**
 * Fetch videos by search query
 * @param {string} query - Search term (e.g., "nature", "cooking", "city")
 * @param {number} perPage - Number of videos to fetch (default: 5)
 * @returns {Promise<Array>} Array of video objects with URLs
 */
export const fetchVideosByQuery = async (query, perPage = 5) => {
  const client = initPexelsClient();
  
  if (!client) {
    return []; // Return empty if no API key
  }
  
  try {
    const response = await client.videos.search({
      query,
      per_page: perPage,
      orientation: 'portrait' // Vertical videos for Reels
    });
    
    if (!response || !response.videos || response.videos.length === 0) {
      console.warn(`⚠️  No videos found for query: "${query}"`);
      return [];
    }
    
    // Extract direct video URLs (prefer HD quality)
    return response.videos.map(video => {
      // Get the best quality video file (prefer HD)
      const videoFile = video.video_files.find(file => 
        file.quality === 'hd' && file.width <= 1920
      ) || video.video_files[0];
      
      return {
        url: videoFile.link,
        width: videoFile.width,
        height: videoFile.height,
        duration: video.duration,
        thumbnail: video.image,
        photographer: video.user.name,
        pexelsUrl: video.url
      };
    });
  } catch (error) {
    console.error(`❌ Error fetching Pexels videos for "${query}":`, error.message);
    return [];
  }
};

/**
 * Category-specific video queries
 */
export const VIDEO_QUERIES = {
  Comedy: 'funny moments',
  Gaming: 'gaming setup',
  Traveling: 'travel destination',
  Education: 'student studying',
  Lifestyle: 'daily routine',
  Food: 'cooking food',
  Nature: 'nature landscape',
  Tech: 'technology',
  Animals: 'cute animals',
  Fitness: 'workout gym'
};

export default {
  initPexelsClient,
  fetchVideosByQuery,
  VIDEO_QUERIES
};
