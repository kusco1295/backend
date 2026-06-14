const fs = require('fs');
const os = require('os');
const path = require('path');

const getUploadDir = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const dir = isProduction
    ? path.join(os.tmpdir(), 'kusco-uploads')
    : path.join(__dirname, '..', 'uploads');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
};

module.exports = { getUploadDir };
