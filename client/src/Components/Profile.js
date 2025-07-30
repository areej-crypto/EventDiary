import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { getImageUrl } from '../utils/getImageUrl';
import { fetchEvents } from '../Features/eventSlice';
import { Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';

const API = "http://127.0.0.1:8080";

// Translation for English and Arabic
const translations = {
  en: {
    settings:      'Settings',
    fontSize:      'Font Size',
    language:      'Language',
    editProfile:   'Edit Profile',
    userPosts:     'User Posts',
    noPosts:       'No posts yet.',
    editedAt:   'Edited at',
    edit:       'Edit',
    delete:     'Delete',
    confirmDelete: 'Are you sure you want to delete this post?',
    save:          'Save',
    cancel:        'Cancel',
  },
  ar: {
    settings:      'الإعدادات',
    fontSize:      'حجم الخط',
    language:      'اللغة',
    editProfile:   'تعديل الملف الشخصي',
    userPosts:     'منشوراتي',
    noPosts:       'لا توجد منشورات بعد.',
    editedAt:   'تم التعديل في',
    edit:       'تعديل',
    delete:     'حذف',
    confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا المنشور؟',
    save:          'حفظ',
    cancel:        'إلغاء',
  }
};

const fontSizeOptions = [
  { label: 'Small', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' }
];
const sizeLabels = {
  en: { small: 'Small',  medium: 'Medium', large: 'Large'  },
  ar: { small: 'صغير', medium: 'متوسط', large: 'كبير' }
};

const Profile = () => {
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [fontSize, setFontSize] = useState('16px');
  const [language, setLanguage] = useState('en');

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedEventType, setEditedEventType] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedHashtags, setEditedHashtags] = useState('');
  const [editedEventTime, setEditedEventTime] = useState('');
  const [editedStartDate, setEditedStartDate] = useState('');
  const [editedEndDate, setEditedEndDate] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const savedSize = localStorage.getItem('profileFontSize');
    if (savedSize) setFontSize(savedSize);
    const savedLang = localStorage.getItem('profileLang');
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleFontSizeChange = e => {
    const size = e.target.value;
    setFontSize(size);
    localStorage.setItem('profileFontSize', size);
  };

  const handleLanguageChange = e => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('profileLang', lang);
    window.dispatchEvent(new Event('languagechange'));
  };

  

  // Redirect if not logged in
  useEffect(() => {
    let cur = user;
    if (!cur) {
      const s = localStorage.getItem('user');
      if (s) cur = JSON.parse(s);
      else {
        navigate('/login');
        return;
      }
    }
  }, [user, navigate]);

  // Fetch user posts & only approved events
  useEffect(() => {
    const cur = user || JSON.parse(localStorage.getItem('user'));
    if (!cur) return;

    (async () => {
      try {
        const [postsRes, eventsRes] = await Promise.all([
          axios.get(`${API}/posts`),
          axios.get(`${API}/events`)
        ]);
        const statusMap = {};
        eventsRes.data.forEach(ev => statusMap[ev._id] = ev.status);

      // build a set of hidden event IDs
const hiddenEvents = new Set(
  eventsRes.data
    .filter(ev => ev.hiddenFromManage)
    .map(ev => ev._id)
);

const ups = postsRes.data.filter(p => {
  if (p.userEmail !== cur.email) return false;
  if (!p.eventId) return true;
  // only show if approved AND not hidden
  return statusMap[p.eventId] === 'approved'
      && !hiddenEvents.has(p.eventId);
});

        setPosts(ups);
      } catch (err) {
        console.error('Error fetching posts/events:', err);
      }
    })();
  }, [user]);

  const handleDelete = async (post) => {
    const msg = translations[language].confirmDelete;
    if (!window.confirm(msg)) return;
  
    try {
      if (post.eventId) {
        // hide the event from Manage Events
        await axios.put(
          `${API}/admin/events/${post.eventId}`,
          { hiddenFromManage: true }
        );
      } else {
        // delete a normal post
        await axios.delete(`${API}/posts/${post._id}`);
      }
    
          // remove from this user's feed immediately
          setPosts(ps => ps.filter(p => p._id !== post._id));
        } catch (err) {
          console.error('Delete failed', err);
          alert('Could not delete. Please try again.');
        }
      };

  const startEditing = post => {
    setEditingPostId(post._id);
    if (post.eventId) {
      const [firstLine, ...rest] = (post.textContent || '').split('\n');
      setEditedTitle(firstLine);
      setEditedDescription(rest.join('\n'));
      setEditedEventType(post.eventType);
      setEditedLocation(post.location);
      setEditedHashtags(post.hashtags);
      setEditedEventTime(post.eventTime);
      setEditedStartDate(post.startDate?.split('T')[0] || '');
      setEditedEndDate(post.endDate?.split('T')[0] || '');
      setEditedText('');
    } else {
      setEditedText(post.textContent || '');
    }
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedText('');
    setEditedTitle('');
    setEditedDescription('');
  };

  const saveEditing = async postId => {
    try {
      const p = posts.find(x => x._id === postId);
      if (!p) return;
      let updatedPost;
      if (p.eventId) {
        const postRes = await axios.put(
          `${API}/posts/${postId}`,
          { textContent: `${editedTitle}\n${editedDescription}` }
        );
        updatedPost = postRes.data;
        await axios.put(
          `${API}/events/${p.eventId}`,
          {
            title:        editedTitle,
            description:  editedDescription,
            eventType:    editedEventType,
            location:     editedLocation,
            hashtags:     editedHashtags,
            eventTime:    editedEventTime,
            startDate:    editedStartDate,
            endDate:      editedEndDate,
            editedByUser: true,
            status:       'pending'
          }
        );
        await dispatch(fetchEvents()); 
        alert('Your edits have been sent for admin review.');
        setPosts(ps => ps.filter(x => x._id !== postId));

      } else {
        const postRes = await axios.put(
          `${API}/posts/${postId}`,
          { textContent: editedText }
        );
        updatedPost = postRes.data;
      }
      setPosts(ps => ps.map(x => x._id === postId ? updatedPost : x));
      cancelEditing();
    } catch (err) {
      console.error('Error saving edits:', err.response || err);
      alert('Error saving edits. Check console.');
    }
  };

  const cur = user || JSON.parse(localStorage.getItem('user'));
  if (!cur) return <p>Loading...</p>;

  const t = translations[language] || translations.en;

  const sizeOptions = [
  { key: '14px', labelKey: 'small' },
  { key: '16px', labelKey: 'medium' },
  { key: '18px', labelKey: 'large' },
];

const locale = language === 'ar' ? 'ar-EG' : undefined;

  return (
    <div className="profile-page" style={{ fontSize }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="left-side">
        <div className="user-profile-card">
          <img
            src={cur.pic ? getImageUrl(cur.pic) : 'https://via.placeholder.com/120'}
            alt="Profile"
            className="profile-pic"
          />
          <h2 className="username">{cur.uname}</h2>
          <button onClick={() => navigate('/edit-profile')} className="edit-btn">
          {t.editProfile}   
          </button>
          {/* Settings Section */}
          <div className="settings" style={{ marginTop: '1rem', textAlign: language === 'ar' ? 'right' : 'left'}}>
            <h4>{t.settings}</h4>
            <FormGroup>
  <Label for="fontSizeSelect">{t.fontSize}</Label>
  <Input
    id="fontSizeSelect"
    type="select"
    value={fontSize}
    onChange={handleFontSizeChange}
  >
    {sizeOptions.map(opt => (
      <option key={opt.key} value={opt.key}>
        {sizeLabels[language][opt.labelKey]}
      </option>
    ))}
  </Input>
</FormGroup>

            <FormGroup>
              <Label for="languageSelect">{t.language}</Label>
              <Input
                id="languageSelect"
                type="select"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </Input>
            </FormGroup>
          </div>
        </div>
      </div>
      <div className="right-side">
        <h3>{t.userPosts}</h3>
        {!posts.length
          ? <p>{t.noPosts}.</p>
          : posts.map(post => {
              const isEvent = !!post.eventId;
              const isEditing = editingPostId === post._id;
              const [displayTitle, ...rest] = (post.textContent || '').split('\n');
              const displayDesc = rest.join('\n');

              return (
                <div key={post._id} className="profile-post">
                  <div className="post-header">
                    <div className="user-info">
                      <img
                        src={post.userPic ? getImageUrl(post.userPic) : 'default-avatar.jpg'}
                        alt=""
                        className="post-user-pic"
                      />
                      <div className="user-details">
                        <span className="post-user-name">
                          {post.userEmail === cur.email ? cur.uname : (post.userName || 'Anonymous')}
                        </span>
                        {isEvent && <span style={{ color: 'gray', marginLeft: '5px' }}>Event Organizer</span>}
                        <span className="post-date">
                          {post.editedAt
                            ? `${t.editedAt} ${new Date(post.editedAt).toLocaleString(locale)}`
                            : new Date(post.createdAt).toLocaleString(locale)
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    isEvent ? (
                      <Row form className="g-3">
                        <Col md={12}>
                          <FormGroup>
                            <Label for="editTitle">Event Title</Label>
                            <Input
                              id="editTitle"
                              type="text"
                              value={editedTitle}
                              onChange={e => setEditedTitle(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={12}>
                          <FormGroup>
                            <Label for="editDescription">Description</Label>
                            <Input
                              id="editDescription"
                              type="textarea"
                              rows="3"
                              value={editedDescription}
                              onChange={e => setEditedDescription(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="editEventType">Event Type</Label>
                            <Input
                              id="editEventType"
                              type="select"
                              value={editedEventType}
                              onChange={e => setEditedEventType(e.target.value)}
                            >
                              <option value="">Select type</option>
                              <option>Concerts</option>
                              <option>Performing Arts</option>
                              <option>Conferences</option>
                              <option>Festivals</option>
                              <option>Charity</option>
                              <option>Other</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="editLocation">Location</Label>
                            <Input
                              id="editLocation"
                              type="select"
                              value={editedLocation}
                              onChange={e => setEditedLocation(e.target.value)}
                            >
                              <option value="">Select location</option>
                              <option>Muscat</option>
                              <option>Salalah</option>
                              <option>Nizwa</option>
                              <option>Sohar</option>
                              <option>Bahla</option>
                              <option>Musandam</option>
                              <option>Other</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="editHashtags">Hashtags</Label>
                            <Input
                              id="editHashtags"
                              type="text"
                              placeholder="#music, #festival"
                              value={editedHashtags}
                              onChange={e => setEditedHashtags(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="editEventTime">Event Time</Label>
                            <Input
                              id="editEventTime"
                              type="time"
                              value={editedEventTime}
                              onChange={e => setEditedEventTime(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="editStartDate">Start Date</Label>
                            <Input
                              id="editStartDate"
                              type="date"
                              value={editedStartDate}
                              onChange={e => setEditedStartDate(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label for="editEndDate">End Date</Label>
                            <Input
                              id="editEndDate"
                              type="date"
                              value={editedEndDate}
                              onChange={e => setEditedEndDate(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={12} className="d-flex justify-content-end">
                          <Button color="primary" onClick={() => saveEditing(post._id)} className="me-2">
                            {t.save}
                          </Button>
                          <Button color="secondary" onClick={cancelEditing}>
                            {t.cancel}
                          </Button>
                        </Col>
                      </Row>
                    ) : (
                      <>
                        <textarea
                          value={editedText}
                          onChange={e => setEditedText(e.target.value)}
                          rows={4}
                          style={{ width: '100%', marginBottom: '.5rem' }}
                        />
                        <div className="post-actions">
                          <Button color="primary" onClick={() => saveEditing(post._id)} className="me-2">
                            {t.save}
                          </Button>
                          <Button color="secondary" onClick={cancelEditing}>
                            {t.cancel}
                          </Button>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="post-content">
                      {isEvent ? (
                        post.editedByUser ? (
                          <div style={{
                            border: '1px solid #f0ad4e',
                            background: '#fcf8e3',
                            padding: '.75rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                          }}>
                            <strong>Your edits are pending admin review.</strong>
                          </div>
                        ) : (
                          <div className="event-info">
                            <h4>{displayTitle}</h4>
                            <div className="event-description">
                              {displayDesc}
                            </div>
                            <div className="event-meta">
                              <div>
                                <p><strong>Event Type</strong> {post.eventType}</p>
                                <p><strong>Location</strong> {post.location}</p>
                                <p><strong>Hashtags</strong> {post.hashtags}</p>
                              </div>
                              <div>
                                <p><strong>Event Time</strong> {post.eventTime}</p>
                                <p><strong>Start Date</strong> {new Date(post.startDate).toLocaleDateString()}</p>
                                <p><strong>End Date</strong> {new Date(post.endDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {new Date(post.endDate) < new Date() && (
                              <div className="event-expired">
                                Event Ended
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <p>{post.textContent}</p>
                      )}

                      {post.image && (
                        <div className="profile-post-container">
                          <img src={getImageUrl(post.image)} alt="" className="profile-post-image" />
                        </div>
                      )}
                    </div>
                  )}

                  {!isEditing && (!isEvent || !post.editedByUser) && (
                    <div className="post-actions">
                      <FaEdit onClick={() => startEditing(post)} title={t.edit} className="action-icon" />
                      <FaTrash onClick={() => handleDelete(post)} title={t.delete} className="action-icon" />
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>
    </div>
  );
};

export default Profile;
