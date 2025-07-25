export default defineEventHandler(async (event) => {
  try {
    console.log('Simple test API called');
    
    return {
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Simple test error:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
});