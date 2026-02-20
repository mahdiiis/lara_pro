/**
 * Utility functions for image processing
 */

/**
 * Compresses and resizes an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels
 * @param {number} options.maxHeight - Maximum height in pixels
 * @param {number} options.quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - A promise that resolves to a compressed image blob
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 250, // Even smaller dimensions
    maxHeight = 250, // Even smaller dimensions
    quality = 0.5, // Even lower quality for profile images
  } = options;

  return new Promise((resolve, reject) => {
    // Set a timeout for the compression operation
    const timeoutId = setTimeout(() => {
      reject(
        new Error("Image compression timed out. Please try a smaller image.")
      );
    }, 10000); // 10 seconds timeout

    // Check file type - only process images
    if (!file.type.startsWith("image/")) {
      clearTimeout(timeoutId);
      reject(new Error("The selected file is not an image."));
      return;
    }

    // Create a FileReader
    const reader = new FileReader();

    // Set up FileReader onload function
    reader.onload = function (event) {
      // Create an image object
      const img = new Image();

      img.onload = function () {
        try {
          // Create a canvas
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas with white background
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Get the data URL
          const dataUrl = canvas.toDataURL("image/jpeg", quality);

          // Create a Blob from dataURL
          const binaryString = atob(dataUrl.split(",")[1]);
          const length = binaryString.length;
          const bytes = new Uint8Array(length);

          for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: "image/jpeg" });

          // Create a File from the Blob
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          // Log compression results
          const originalSize = Math.round(file.size / 1024);
          const compressedSize = Math.round(compressedFile.size / 1024);
          const ratio = Math.round((compressedSize / originalSize) * 100);

          console.log(
            `Image compressed from ${originalSize}KB to ${compressedSize}KB (${ratio}% of original)`
          );

          // If compressed image is still too large, try again with more aggressive settings
          if (compressedSize > 500) {
            // 500KB limit
            console.warn(
              "Image still large after compression. Applying more aggressive compression..."
            );

            // More aggressive compression
            const aggressiveDataUrl = canvas.toDataURL("image/jpeg", 0.3);
            const aggressiveBinaryString = atob(
              aggressiveDataUrl.split(",")[1]
            );
            const aggressiveLength = aggressiveBinaryString.length;
            const aggressiveBytes = new Uint8Array(aggressiveLength);

            for (let i = 0; i < aggressiveLength; i++) {
              aggressiveBytes[i] = aggressiveBinaryString.charCodeAt(i);
            }

            const aggressiveBlob = new Blob([aggressiveBytes], {
              type: "image/jpeg",
            });
            const aggressiveFile = new File([aggressiveBlob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            const aggressiveSize = Math.round(aggressiveFile.size / 1024);
            console.log(
              `More aggressive compression applied: ${aggressiveSize}KB`
            );

            clearTimeout(timeoutId);
            resolve(aggressiveFile);
          } else {
            clearTimeout(timeoutId);
            resolve(compressedFile);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Error during image compression:", error);
          reject(error);
        }
      };

      // Handle image load error
      img.onerror = function () {
        clearTimeout(timeoutId);
        reject(new Error("Failed to load image for compression"));
      };

      // Load image
      img.src = event.target.result;
    };

    // Handle FileReader errors
    reader.onerror = function () {
      clearTimeout(timeoutId);
      reject(new Error("Failed to read file"));
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL to a Blob object
 * @param {string} dataURL - The data URL to convert
 * @returns {Blob} - The resulting Blob object
 */
export const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};
