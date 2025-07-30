export const getImageUrl = (path) => {
    if (!path) return null;                             // no image field
    if (/^https?:\/\//i.test(path)) return path;        // already Cloudinary
    return `${process.env.REACT_APP_BACKEND_URL}/${path.replace(/\\/g, '/')}`;
  };
  