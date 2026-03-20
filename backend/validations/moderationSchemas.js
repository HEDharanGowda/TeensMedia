const { z } = require('zod');

const checkContentSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  caption: z.string().max(500, 'Caption too long').optional(),
});

module.exports = {
  checkContentSchema,
};
