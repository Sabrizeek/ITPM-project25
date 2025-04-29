import path from "path";
import fs from "fs";

// Ensure the upload directory exists
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export { ensureUploadDir };