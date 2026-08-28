const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

/**
 * Authenticate with Google Drive API using service account credentials.
 * @returns {Object} Google Drive instance.
 */
const authenticate = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_DRIVE_CREDENTIALS_PATH, // Path to credentials JSON file
    scopes: ["https://www.googleapis.com/auth/drive.file"], // Required scope
  });

  return auth.getClient();
};

/**
 * Upload a file to Google Drive.
 * @param {string} filePath - Local path to the file.
 * @param {string} fileName - Desired name for the file on Google Drive.
 * @returns {Object} Google Drive API response.
 */
const uploadFileToDrive = async (filePath, fileName) => {
    try {
      const auth = await authenticate();
      const drive = google.drive({ version: "v3", auth });
  
      const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };
  
      const media = {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(filePath),
      };
  
      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name, webViewLink, webContentLink",
      });
  
      return response.data;
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error.message);
      throw new Error("Failed to upload file to Google Drive");
    }
  };
  

module.exports = { uploadFileToDrive };
