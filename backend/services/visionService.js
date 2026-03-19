const axios = require('axios');

async function analyzeImageSafety(imageBase64) {
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
    throw new Error('Invalid response from Vision API');
  }

  return {
    adult: annotation.adult,
    racy: annotation.racy,
  };
}

module.exports = {
  analyzeImageSafety,
};
