import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaMusic, FaBell, FaHeart, FaComment } from 'react-icons/fa';
import { FaMasksTheater } from 'react-icons/fa6';
import { MdBusinessCenter, MdOutlineFestival } from 'react-icons/md';
import { LuHandshake } from 'react-icons/lu';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  Row,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Collapse,
  Button
} from 'reactstrap';

import SharePost from './SharePost';
import { fetchPosts, likePost, commentPost, deleteComment } from '../Features/PostSlice';
import { saveReminder } from '../Features/reminderSlice';
import RemindersDisplay from './RemindersDisplay';
import EventForm from './EventForm';
import { getImageUrl } from '../utils/getImageUrl';
import recommendationReducer from '../Features/recommendationsSlice';
import { fetchTrending }       from '../Features/trendingSlice';
import { fetchEvents } from '../Features/eventSlice';



const API = 'http://127.0.0.1:8080';


const ContentFeed = () => {
  const [lang, setLang] = useState('en');
  const { user } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.post);
  const {
  items:     trending,
  loading:   trendingLoading,
  error:     trendingError
} = useSelector(state => state.trending);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  


  const [eventsMap, setEventsMap] = useState({});
  const [hiddenEvents, setHiddenEvents] = useState(new Set());

  // Location dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // State for selected location and event type
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');

  const location = useLocation();
  const jumpToEventId = location.state?.jumpToEventId;

 useEffect(() => {
  if (!jumpToEventId) return;            
  if (!posts.length) return;            

  const el = document.getElementById(`post-${jumpToEventId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [jumpToEventId, posts]);

  // Share Post toggle
  const [showSharePost, setShowSharePost] = useState(false);
  const handleSharePostToggle = () => {
    setShowSharePost(!showSharePost);
  };

  // Modal for organizing an event
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!modalOpen);

  // Locations to choose from
  const locations = ['Muscat', 'Salalah', 'Nizwa', 'Sohar', 'Bahla', 'Musandam'];

  // open comment section and new comment
  const [openCommentId, setOpenCommentId] = useState(null);
  const [newComment, setNewComment] = useState('');

  const [fontSize, setFontSize] = useState('16px');

  useEffect(() => {
    const saved = localStorage.getItem('profileFontSize');
    if (saved) setFontSize(saved);
  
    const onStorage = (e) => {
      if (e.key === 'profileFontSize') setFontSize(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  
  useEffect(() => {
        const saved = localStorage.getItem('profileLang');
        if (saved) setLang(saved);
       const onStorage = e => {
          if (e.key === 'profileLang') setLang(e.newValue);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
      }, []);

  //fetch events
const { events } = useSelector((state) => state.event);

  //  load the events into Redux
  useEffect(() => {
    dispatch(fetchEvents());
     dispatch(fetchPosts());
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchTrending());
  }, [dispatch]);


  // Whenever `events` changes (e.g. after an approval), rebuild your maps
  useEffect(() => {
    const statusMap = {};
    const hiddenSet = new Set();

    events.forEach(ev => {
      statusMap[ev._id] = ev.status;
      if (ev.hiddenFromManage) hiddenSet.add(ev._id);
    });

    setEventsMap(statusMap);
    setHiddenEvents(hiddenSet);
  }, [events]);

  //  fetch posts if user is logged in
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user'))
        : null;

        console.log("Recovered user from localStorage:", storedUser);

      if (!storedUser) {
        navigate('/login');
      } else {
        dispatch(fetchPosts());
      }
    } else {
      dispatch(fetchPosts());
    }
  }, [user, navigate, dispatch]);


  const handleLike = (postId) => {
    if (!user) return;
    dispatch(likePost({ postId, userId: user.id }));
  };

  const toggleCommentSection = (postId) => {
    setOpenCommentId((prev) => (prev === postId ? null : postId));
    setNewComment('');
  };

  const handleAddComment = (postId) => {
    if (!user) return;
    if (!newComment.trim()) return;
    dispatch(commentPost({ postId, userName: user.uname, userId: user.id, text: newComment.trim() }));
    setNewComment('');
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!user) return;
  
    // Confirm deletion 
    const confirmDelete = window.confirm(T[lang].deleteCommentConfirm);
  
    if (confirmDelete) {
      // If confirmed, delete the comment
      dispatch(deleteComment({ postId, commentId }));
    }
  };
  

  // Filter posts based on location, type, AND event approval
const filteredPosts = posts.filter(post => {
   // 1) location/type filters
   if (selectedLocation && post.location !== selectedLocation) return false;
   if (selectedEventType && post.eventType !== selectedEventType) return false;

   // 2) if this is an event post, only keep it if status === 'approved'
   if (post.eventId) {
        const status  = eventsMap[post.eventId];
        const hidden  = hiddenEvents.has(post.eventId);
    
        // drop if not approved OR explicitly hidden
        if (status !== 'approved' || hidden) {
          return false;
        }
      }
      return true;
    });

  // Sort so that event posts that have ended appear at the bottom
  const now = new Date();
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aExpired = a.eventType && new Date(a.endDate) < now;
    const bExpired = b.eventType && new Date(b.endDate) < now;
    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;
    return 0;
  });

  const T = {
        en: {
          browse: 'Browse Events in',
          clearLoc: 'Clear Location',
          recommended: 'Recommended for you',
          trending: 'Trending now',
          welcome: `Welcome ${user?.uname || 'Guest'}, here is your content feed:`,
          placeholder: "What's on your mind?",
          noMatch: 'No posts match your filters.',
          organize: 'Organize Event',
          selectLoc:            'Select Location',
          clearType:            'Clear Event Type',
          modalTitle:           'Organize an Event',
          deleteCommentConfirm: 'Are you sure you want to delete this comment?',
          like:            'Like',
          comment:         'Comment',
          add:             'Add',
          deleteCommentBtn:'Delete',
          events: {
            concerts:         'Concerts',
            performingArts:   'Performing Arts',
            conferences:      'Conferences',
            festivals:        'Festivals',
            charity:          'Charity',
          },
          uploadImage:  'Upload Image',
          editedAt:     'Edited at',
        },
        ar: {
          browse: 'تصفح الأحداث في',
          clearLoc: 'مسح الموقع',
          recommended: 'مقترح لك',
          trending: 'الرائج الآن',
          welcome: `مرحباً ${user?.uname || 'زائر'}، إليك المشاركات:`,
          placeholder: 'بماذا تفكر؟',
          noMatch: 'لا توجد مشاركات مطابقة لمرشحاتك.',
          organize: 'نظم حدث',
          selectLoc:            'اختر الموقع',
          clearType:            'مسح نوع الحدث',
          modalTitle:           'نظم حدثًا',
          deleteCommentConfirm: 'هل أنت متأكد أنك تريد حذف هذا التعليق؟',
          like:            'إعجاب',
    comment:         'تعليق',
    add:             'إضافة',
    deleteCommentBtn:'حذف',
    events: {
      concerts:         ' حفلات موسيقية',
      performingArts:   'الفنون الأدائية',
      conferences:      'مؤتمرات',
      festivals:        'مهرجانات',
      charity:          ' أعمال خيرية',
        },
      uploadImage:  'رفع صورة',
      editedAt:     'تم التعديل في',
      }
      };
    
      return (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{ fontSize, textAlign: lang === 'ar' ? 'right' : 'left' }}
        >
      {/* Navbar */}
      <div className="navbar-container">
        <Container>
          <Row className="align-items-center">
            <Col md={4} sm={12} className="d-flex align-items-center">
              <span className="navbar-left-text">{T[lang].browse} </span>
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="dropdown-container">
                <DropdownToggle caret className="dropdown-toggle">
                  {selectedLocation || T[lang].selectLoc}
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu">
                  {locations.map((loc, index) => (
                    <DropdownItem key={index} onClick={() => setSelectedLocation(loc)}>
                      {loc}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              {selectedLocation && (
                <Button
                  className="clear-filter-btn"
                  size="sm"
                  onClick={() => setSelectedLocation('')}
                >
                  {T[lang].clearLoc}
                </Button>
              )}
            </Col>

            <Col md={8} sm={12} className="d-flex justify-content-around mt-3 mt-md-0">
              <FaMusic
                className="icon"
                size={40}
                title={T[lang].events.concerts}
                onClick={() => setSelectedEventType('Concerts')}
                style={{ cursor: 'pointer' }}
              />
              <FaMasksTheater
                className="icon"
                size={40}
                title={T[lang].events.performingArts}
                onClick={() => setSelectedEventType('Performing Arts')}
                style={{ cursor: 'pointer' }}
              />
              <MdBusinessCenter
                className="icon"
                size={40}
                title={T[lang].events.conferences}
                onClick={() => setSelectedEventType('Conferences')}
                style={{ cursor: 'pointer' }}
              />
              <MdOutlineFestival
                className="icon"
                size={40}
                title={T[lang].events.festivals}
                onClick={() => setSelectedEventType('Festivals')}
                style={{ cursor: 'pointer' }}
              />
              <LuHandshake
                className="icon"
                size={40}
                title={T[lang].events.charity}
                onClick={() => setSelectedEventType('Charity')}
                style={{ cursor: 'pointer' }}
              />
              {selectedEventType && (
                <Button
                  className="clear-filter-btn"
                  size="sm"
                  onClick={() => setSelectedEventType('')}
                >
                {T[lang].clearType}
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container>
        <Row>
          {/* Left Sidebar */}
          <Col md={2} className="left-sidebar">
            <div className="sidebar-links">
              <button
                  className="sidebar-link btn btn-link p-0"
                  onClick={() => navigate('/recommendations')}
                >
                  {T[lang].recommended}
                </button>
              <button
              className="sidebar-link btn btn-link p-0"
              onClick={() => navigate('/trending')}
              >
              {T[lang].trending}
              </button>
            </div>
          </Col>

          {/* Right Column (Feed) */}
          <Col md={10}>
            <div className="content-feed-container">
              <div className="welcome-share-container">
              <p className="welcome-text">{T[lang].welcome}</p>
              <RemindersDisplay />
              
                <div
                  className="share-post-toggle"
                  onClick={handleSharePostToggle}
                  style={{ cursor: 'pointer' }}
                >
                  <Input
                    type="text"
                    placeholder={T[lang].placeholder}
                    readOnly
                    className="search-bar-style"
                  />
                </div>
              </div>
              {showSharePost && (
                <SharePost isOpen={showSharePost} toggle={handleSharePostToggle} />
              )}

              <div className="content">
                {sortedPosts && sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => {
                    const isExpired =
                      post.eventType && new Date(post.endDate) < now;

                    let eventTitle = '';
                    let eventDescription = '';
                    if (post.eventType && post.textContent) {
                      const lines = post.textContent.split('\n');
                      eventTitle = lines[0] || '';
                      eventDescription = lines.slice(1).join('\n') || '';
                    }
                    const locale = lang === 'ar' ? 'ar-EG' : undefined;

                    return (
                      <div
                        key={post._id}
                        id={`post-${post.eventId || post._id}`}
                        className="post-item"
                        style={{
                          pointerEvents: isExpired ? 'none' : 'auto',
                          opacity: isExpired ? 0.5 : 1
                        }}
                      >
                        <div className="post-header">
                          <div className="user-info">
                            <img
                              src={
                                post.userPic
                                  ? getImageUrl(post.userPic) : 'default-avatar.jpg' 
                              }
                              alt="User"
                              className="post-user-pic"
                            />
                            <div className="user-details">
                              <span className="post-user-name">
                                {user && post.userEmail === user.email
                                  ? user.uname
                                  : post.userName || 'Anonymous'}
                              </span>
                              {post.eventType && (
                                <span style={{ color: 'gray', marginRight: '5px' }}>
                                  {' '}
                                  Event Organizer
                                </span>
                              )}
                              <span className="post-date">
                              {post.editedAt
                                ? `${T[lang].editedAt} ${new Date(post.editedAt).toLocaleString(locale)}`
                                : new Date(post.createdAt).toLocaleString(locale)}
                            </span>
                            </div>
                          </div>
                        </div>

                        <div className="post-content">
                          {post.eventType ? (
                            <div className="event-info">
                              <h4>{eventTitle}</h4>
                              <div className="event-description">
                                {eventDescription}
                              </div>
                              <div className="event-meta">
                                <div>
                                  <p>
                                    <strong>Event Type</strong> {post.eventType}
                                  </p>
                                  <p>
                                    <strong>Location</strong> {post.location}
                                  </p>
                                  <p>
                                    <strong>Hashtags</strong> {post.hashtags}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Event Time</strong> {post.eventTime}
                                  </p>
                                  <p>
                                    <strong>Start Date</strong>{' '}
                                    {new Date(post.startDate).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <strong>End Date</strong>{' '}
                                    {new Date(post.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {isExpired && (
                                <div className="event-expired">
                                  Event Ended
                                </div>
                              )}
                            </div>
                          ) : (
                            // Normal post => just textContent
                            <p>{post.textContent}</p>
                          )}

                          {post.image && (
                            <div className="profile-post-container">
                              <img
                                src={getImageUrl(post.image)}
                                alt="Post"
                                className="profile-post-image"
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions: like, comment, reminder */}
                        <div
                          className="post-actions"
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleLike(post._id)}
                          >
                            <FaHeart
                              className="action-icon like-icon"
                              size={20}
                              title={T[lang].like}
                            />
                            <span style={{ marginLeft: '5px' }}>
                              {post.likes ? post.likes.length : 0}
                            </span>
                          </div>

                          {/* Comment icon */}
                          <div
                            style={{ cursor: 'pointer', marginLeft: '15px' }}
                            onClick={() => toggleCommentSection(post._id)}
                          >
                            <FaComment
                              className="action-icon comment-icon"
                              size={20}
                              title={T[lang].comment}
                            />
                            <span style={{ marginLeft: '5px' }}>
                              {post.comments ? post.comments.length : 0}
                            </span>
                          </div>

                          {/* Bell (reminder) for events */}
                          {post.eventType && (
                            <div
                              style={{ cursor: 'pointer', marginLeft: '15px' }}
                              onClick={() => {
                                if (new Date(post.startDate) > new Date()) {
                                  dispatch(saveReminder({
                                   userId:    user.id,
                                   eventId:   post.eventId,
                                   eventType: post.eventType,
                                   location:  post.location,
                                   startDate: post.startDate
                                 }));
                                }
                              }}
                            >
                              <FaBell
                                className="action-icon"
                                size={20}
                                title="Remind Me"
                                style={{
                                  opacity:
                                    new Date(post.startDate) > new Date() ? 1 : 0.5,
                                  pointerEvents:
                                    new Date(post.startDate) > new Date()
                                      ? 'auto'
                                      : 'none'
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Comments Collapse */}
                        <Collapse isOpen={openCommentId === post._id}>
                          <div
                            className="comments-dropdown p-3"
                            style={{
                              backgroundColor: '#f9f9f9',
                              borderRadius: '6px',
                              marginTop: '10px'
                            }}
                          >
                            {post.comments && post.comments.length > 0 ? (
                              post.comments.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="single-comment"
                                  style={{
                                    marginBottom: '5px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {user && c.userName === user.uname
                                        ? user.uname
                                        : c.userName}
                                      :
                                    </strong>{' '}
                                    {c.text}
                                  </div>
                                  {user && c.userName === user.uname && (
                                    <button
                                      className="btn-comment-delete"
                                      onClick={() =>
                                        handleDeleteComment(post._id, c._id)
                                      }
                                    >
                                      {T[lang].deleteCommentBtn}
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p>No comments yet.</p>
                            )}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: '10px'
                              }}
                            >
                              <Input
                                type="text"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="me-2"
                              />
                              <button
                                className="btn-comment-add"
                                onClick={() => handleAddComment(post._id)}
                              >
                                {T[lang].add}
                              </button>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    );
                  })
                ) : (
                  <p>No posts match your filters.</p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Organize Event Button & Modal */}
      <div className="organize-event-button" onClick={toggleModal}>
        <div className="plus-sign">+</div>
        <p>{T[lang].organize}</p>
      </div>
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>{T[lang].modalTitle}</ModalHeader>
        <ModalBody>
          <EventForm toggleForm={toggleModal} />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ContentFeed;
