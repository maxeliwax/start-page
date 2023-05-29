import React, { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytesResumable,uploadString, listAll } from "firebase/storage";

import { storage } from "./firebase";

function FileUploader({ onFilesUpload }) {
  const [progress, setProgress] = useState(0);
  const [downloadURLs, setDownloadURLs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (downloadURLs.length > 0) {
      console.log("Files available:", downloadURLs);
    }
  }, [downloadURLs]);

  const fetchDownloadURLs = () => {
    const filesRef = ref(storage, "files");
    const listAllPromise = listAll(filesRef);

    listAllPromise
      .then((res) => {
        const promises = res.items.map((itemRef) => getDownloadURL(itemRef));
        Promise.all(promises)
          .then((urls) => {
            setDownloadURLs(urls);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formHandler = (e) => {
    e.preventDefault();
    const files = Array.from(e.target[0].files);
    uploadFiles(files);
  };

  const uploadFiles = (files) => {
    if (!files || files.length === 0) return;

    const uploadPromises = files.map((file) => {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = file.type.startsWith("text/")
        ? uploadString(storageRef, file)
        : uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(prog);
          },
          (error) => {
            console.log(error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        setDownloadURLs((prevURLs) => [...prevURLs, ...urls]);
        setUploadedFiles((prevFiles) => [...prevFiles, ...urls]);
        onFilesUpload(urls);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <form onSubmit={formHandler}>
        <input type="file" className="input" multiple />
        <button type="submit">Upload</button>
      </form>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <h2>Uploading: {progress}%</h2>
      {downloadURLs.length > 0 && (
        <div>
          <h3>Uploaded Pictures:</h3>
          <div className="image-gallery">
            {downloadURLs.map((url, index) => (
              <img key={index} src={url} alt={`Uploaded ${index}`} className="uploaded-image" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const handleFilesUpload = (uploadedFiles) => {
    // Handle the uploaded files here
    console.log("Uploaded files:", uploadedFiles);
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <FileUploader onFilesUpload={handleFilesUpload} />
      {/* Add your admin panel content and functionality here */}
    </div>
  );
}

export default AdminPanel;
