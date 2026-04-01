const axios = require('axios');

async function analyzeImageSafety(imageBase64) {
  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
      {
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'SAFE_SEARCH_DETECTION' }],
          },
        ],
      },
      { timeout: 10000 },
    );

    const annotation = response.data?.responses?.[0]?.safeSearchAnnotation;

    if (!annotation) {
      const err = new Error('Invalid response from Vision API');
      err.status = 502;
      throw err;
    }

    return {
      adult: annotation.adult,
      racy: annotation.racy,
    };
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || 'Vision API request failed';
    console.error('[visionService] SafeSearch call failed:', message);
    const err = new Error(`Moderation temporarily unavailable: ${message}`);
    err.status = 503;
    throw err;
  }
}

module.exports = {
  analyzeImageSafety,
};
