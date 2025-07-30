import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input } from "reactstrap";
import { FaImage } from "react-icons/fa";
import { createPost, moderatePost } from "../Features/PostSlice";

const SharePost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [textContent, setTextContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const T = {
    en: {
      placeholder: "What's on your mind,",
      uploadImage: 'Upload Image',
      postButton: 'Post',
      offensiveAlert: 'Your post contains offensive content and has been removed.'
    },
    ar: {
      placeholder: 'بماذا تفكر،',
      uploadImage: 'رفع صورة',
      postButton: 'نشر',
      offensiveAlert: 'تحتوي مشاركتك على محتوى مسيء وتمت إزالته.'
    }
  };

  const [lang, setLang] = useState(localStorage.getItem('profileLang') || 'en');
  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'profileLang') setLang(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePostSubmit = async () => {
    if (!user || !user.id) {
      alert("You must be logged in to post.");
      return;
    }

    // Step 1: run moderation check
    let prediction = 0;
    try {
      prediction = await dispatch(
        moderatePost({ userEmail: user.email, post_text: textContent })
      ).unwrap();
    } catch (err) {
      console.warn('Moderation service failed, posting anyway:', err);
      // leave prediction = 0 so we still proceed
    }
  
    if (prediction === 1) {
      alert(T[lang].offensiveAlert);
      return;
    }
  

    // Step 2: if clean, proceed to create post
    const formData = new FormData();
    formData.append("userEmail", user.email);
    formData.append("userName", user.uname);
    formData.append("userPic", user.pic || "");
    formData.append("textContent", textContent);

    if (image) {
      formData.append("image", image);
    }

    dispatch(createPost(formData))
      .unwrap()
      .then(() => {
        setTextContent("");
        setImage(null);
        setImagePreview(null);
      })
      .catch((err) => console.error("Error creating post:", err));
  };

  return (
    <div className="share-post-container">
      <Input
        type="textarea"
        className="share-post-textarea"
        placeholder={`${T[lang].placeholder} ${user?.uname || ''}?`}
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
      />

      <div className="d-flex justify-content-between align-items-center mt-2">
        <Button
          color="secondary"
          className="upload-btn"
          onClick={() => document.getElementById("imageInput").click()}
        >
          <FaImage size={20} /> {T[lang].uploadImage}
        </Button>

        <Input
          id="imageInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" className="preview-image" />
          </div>
        )}
      </div>

      <Button
        color="primary"
        className="post-btn mt-3"
        onClick={handlePostSubmit}
        disabled={!textContent.trim()}
      >
        {T[lang].postButton}
      </Button>
    </div>
  );
};

export default SharePost;
