const fs = require('fs/promises');
const path = require('path');
const uuid = require('../utils/uuid');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Saves a base64 photo sent by the app and returns its public URL path
 * (e.g. "/uploads/abc.jpg"). Accepts raw base64 or a "data:image/...;base64," string.
 */
async function savePhoto(base64) {
  if (!base64) return null;

  let ext = 'jpg';
  let data = base64;
  const match = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i.exec(base64);
  if (match) {
    ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    data = match[2];
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length === 0) {
    const err = new Error('Photo could not be read'); err.status = 400; throw err;
  }
  if (buffer.length > MAX_BYTES) {
    const err = new Error('Photo is too large (max 5 MB)'); err.status = 413; throw err;
  }

  // Check the file really is an image (JPEG / PNG / WEBP signatures)
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng = buffer.slice(0, 4).toString('hex') === '89504e47';
  const isWebp = buffer.slice(8, 12).toString('ascii') === 'WEBP';
  if (!isJpeg && !isPng && !isWebp) {
    const err = new Error('Only JPEG, PNG or WEBP photos are allowed'); err.status = 400; throw err;
  }
  if (isPng) ext = 'png';
  if (isWebp) ext = 'webp';
  if (isJpeg) ext = 'jpg';

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${uuid()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

module.exports = { savePhoto, UPLOAD_DIR };
