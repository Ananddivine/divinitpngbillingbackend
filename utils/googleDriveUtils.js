//utilils/googledriveutilils.js
const { google } = require('googleapis');
const fs = require('fs');

// Set up Google Drive API client
const authenticate = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_DRIVE_CREDENTIALS_PATH, // Path to your service account credentials file
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return auth.getClient();
};

// Upload file to Google Drive and set the sharing permissions
const moveFileToDrive = async (filePath, fileName) => {
  const authClient = await authenticate();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileMetadata = {
    name: fileName,
  };

  const media = {
    mimeType: 'application/octet-stream',
    body: fs.createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // File uploaded successfully, now make it public
    const fileId = response.data.id;
    
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',  // This allows anyone to view the file
      },
    });

    console.log('File uploaded to Google Drive:', response.data.webViewLink);
    return response.data.webViewLink; // Return the file's Google Drive web view link
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw new Error('Google Drive upload failed');
  }
};

module.exports = { moveFileToDrive };
