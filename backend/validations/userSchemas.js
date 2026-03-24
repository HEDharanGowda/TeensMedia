const { z } = require('zod');

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const updateProfilePictureSchema = z.object({
  profilePicture: z
    .string()
    .min(1, 'Profile picture is required')
    .max(12 * 1024 * 1024, 'Profile picture data is too large')
    .regex(base64Regex, 'Profile picture must be a valid base64 string'),
});

module.exports = {
  updateProfilePictureSchema,
};
