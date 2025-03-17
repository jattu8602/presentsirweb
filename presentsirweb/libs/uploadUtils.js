import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} The upload result
 */
export async function uploadFile(fileBuffer, options = {}) {
  try {
    // Convert buffer to base64
    const base64File = `data:${
      options.fileType || 'image/jpeg'
    };base64,${fileBuffer.toString('base64')}`

    // Default options
    const defaultOptions = {
      folder: 'presentsir',
      resource_type: 'auto',
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      ...defaultOptions,
      ...options,
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
    }
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} The deletion result
 */
export async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)

    return {
      success: result.result === 'ok',
      result,
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - The public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} The transformed image URL
 */
export function getTransformedImageUrl(publicId, transformations = {}) {
  // Default transformations
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
  }

  // Combine default and custom transformations
  const options = {
    ...defaultTransformations,
    ...transformations,
  }

  return cloudinary.url(publicId, options)
}
