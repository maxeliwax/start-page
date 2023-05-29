import React, { createContext, useState } from "react";

const FileContext = createContext();

export function FileProvider({ children }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const addUploadedFile = (file) => {
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
  };

  const removeUploadedFile = (file) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  return (
    <FileContext.Provider value={{ uploadedFiles, addUploadedFile, removeUploadedFile }}>
      {children}
    </FileContext.Provider>
  );
}

export default FileContext;
