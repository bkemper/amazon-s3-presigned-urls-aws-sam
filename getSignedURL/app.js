/*
  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION })
const s3 = new AWS.S3()

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300

// Main Lambda entry point
exports.handler = async (event) => {
  return await getUploadURLs(event);
};

const getUploadURLs = async function (event) {
  const { documents } = JSON.parse(event.body);
  const presignedDocuments = [];

  for (let i = 0; i < documents.length; i++) {
    const Key = `VLTesting/${documents[i].filename}`;
    const s3Params = {
      Bucket: process.env.UploadBucket,
      Key,
      Expires: URL_EXPIRATION_SECONDS,
      ContentType: documents[i].filetype,

      // This ACL makes the uploaded object publicly readable. You must also uncomment
      // the extra permission for the Lambda function in the SAM template.

      // ACL: 'public-read'
    };

    console.log("Params: ", s3Params);
    const presignedUrl = await s3.getSignedUrlPromise("putObject", s3Params);

    presignedDocuments.push({
      id: Key,
      filename: documents[i].filename,
      filetype: documents[i].filetype,
      presignedUrl,
    });
  }

  return JSON.stringify({
    presignedDocuments,
  });
};