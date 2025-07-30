import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardText,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import axios from 'axios';
import { fetchEvents } from '../Features/eventSlice';
import { fetchPosts } from '../Features/PostSlice';
import { getImageUrl } from '../utils/getImageUrl';

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [manageSection, setManageSection] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMoreEvent, setViewMoreEvent] = useState(null);
  const [viewMoreModalOpen, setViewMoreModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [originalModalOpen, setOriginalModalOpen] = useState(false);
  const [originalEventData, setOriginalEventData] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false); 

  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
  if (manageSection === 'edited') {
    dispatch(fetchEvents());
  }
}, [manageSection, dispatch]);


  // Modal handlers
 const openEditModal = (event) => {
   setSelectedEvent(event);
   setModalOpen(true);
 };
 const closeEditModal = () => {
   setSelectedEvent(null);
   setModalOpen(false);
 };

 // Messages “View Details” modal
 const openDetailModal = (event) => {
   setSelectedEvent(event);
   setDetailModalOpen(true);
 };
 const closeDetailModal = () => {
   setSelectedEvent(null);
   setDetailModalOpen(false);
 };
  const openViewMoreModal = (event) => {
    setViewMoreEvent(event);
    setViewMoreModalOpen(true);
  };
  const closeViewMoreModal = () => {
    setViewMoreEvent(null);
    setViewMoreModalOpen(false);
  };
  const openOriginalModal = (event) => {
    setOriginalEventData(event.originalData);
    setOriginalModalOpen(true);
  };
  const closeOriginalModal = () => {
    setOriginalEventData(null);
    setOriginalModalOpen(false);
  };

const updateEvent = async (eventId, status) => {
      setActionLoading(true);
try {
      //  auto-creates the post when approved
      await axios.put(
        `http://127.0.0.1:8080/events/${eventId}/status`,
        { status }
      );
    } catch (err) {
      console.error('Failed to change event status:', err);
      alert('Couldn’t change event status — please try again.');
      setActionLoading(false);
      return;
    }

    // Refresh both slices so ContentFeed immediately sees the new “approved” status
    await dispatch(fetchEvents());
    await dispatch(fetchPosts());
    closeDetailModal();
    alert('Event updated successfully!');
    setActionLoading(false);
  };

const acceptEvent = (event) => updateEvent(event._id, 'approved');

const rejectEvent = (event) => updateEvent(event._id, 'rejected');

const handleDelete = async (event) => {
  if (
    !window.confirm(
      `Are you sure you want to reject & remove "${event.title}" from the content feed?`
    )
  ) return;

  setActionLoading(true);
  try {
    // Reject the event
    await axios.put(
      `http://127.0.0.1:8080/events/${event._id}/status`,
      { status: 'rejected' }
    );

    // Delete the post
    await axios.delete(
      `http://127.0.0.1:8080/posts/event/${event._id}`
    );

    //  Hide this event from Manage Events (so it won't reappear under Edited)
    await axios.put(
      `http://127.0.0.1:8080/admin/events/${event._id}`,
      { hiddenFromManage: true }
    );

    //  Refresh both slices
    await dispatch(fetchEvents());
    await dispatch(fetchPosts());

    // Flip you back to "all" so the tab switches away
    setManageSection('all');

    alert(`"${event.title}" has been rejected and hidden from Manage.`);

  } catch (err) {
    console.error('Error rejecting & hiding:', err);
    alert('Could not delete. Please try again.');
  } finally {
    setActionLoading(false);
  }
};


const handleKeep = async (evt) => {
  if (!window.confirm(`Accept these edits to "${evt.title}"?`)) return;
  setActionLoading(true);

  try {
    // Update the existing Event new post creation
    await axios.put(
      `http://127.0.0.1:8080/admin/events/${evt._id}`,
      {
        editedByUser: false,
        status: 'approved'
      }
    );

    await dispatch(fetchEvents());
    await dispatch(fetchPosts());

    // Immediately flip back to "all" so it vanishes from your Edited list
    setManageSection('all');

    // THEN let the admin know
    alert(`"${evt.title}" has been approved and is live.`);
  } catch (err) {
    console.error('Error keeping edited event:', err);
    alert('Couldn’t accept edits—please try again.');
  } finally {
    setActionLoading(false);
  }
};


  // **pending** messages only
  const renderMessages = () => {
    const pending = events.filter((e) => e.status === 'pending' && !e.editedByUser);
    return (
      <Row className="justify-content-center">
        {pending.length > 0 ? (
          pending.map((event, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <Card className="admin-card hover-effect">
                {event.image && (
                  <img
                    src={getImageUrl(event.image)}
                    alt="Event"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      marginBottom: '0.5rem',
                    }}
                  />
                )}
                <CardBody>
                  <CardText className="text-center">
                    <strong>{event.title}</strong>
                  </CardText>
                  <CardText className="text-center">
                    Organizer: {event.organizerName}
                  </CardText>
                  <CardText className="text-center">
                    Submitted: {new Date(event.submittedAt).toLocaleString()}
                  </CardText>
                  <div className="d-flex justify-content-around mt-2">
                    <Button
                      color="info"
                      size="sm"
                      onClick={() => openDetailModal(event)}                    >
                      View Details
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      onClick={() => acceptEvent(event)}
                    >
                      Accept
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => rejectEvent(event)}
                    >
                      Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p>No pending events.</p>
          </Col>
        )}
      </Row>
    );
  };

  const renderManageEvents = () => {
    const allApproved = events.filter(
      (e) => e.status === 'approved' && !e.hiddenFromManage
    );
    const editedByUsers = events.filter(
      (e) => e.editedByUser && !e.hiddenFromManage
    );
    const dataToShow = manageSection === 'all' ? allApproved : editedByUsers;

    return (
      <>
        <h3 className="text-center mb-4">Manage Events (Approved Only)</h3>
        <div className="text-center mb-3">
          <Button
            color={manageSection === 'all' ? 'primary' : 'secondary'}
            onClick={() => setManageSection('all')}
            style={{ marginRight: '1rem' }}
          >
            View All Events
          </Button>
          <Button
            color={manageSection === 'edited' ? 'primary' : 'secondary'}
            onClick={() => setManageSection('edited')}
          >
            Events Edited By Users
          </Button>
        </div>

        {dataToShow.length === 0 ? (
          <p className="text-center">No events to display.</p>
        ) : (
          <Table striped responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
             <tbody>
        {dataToShow.map(evt => (
          <tr key={evt._id}>
            <td>{evt.title}</td>
            <td>{evt.location}</td>
            <td>{new Date(evt.startDate).toLocaleDateString()}</td>
            <td>{new Date(evt.endDate).toLocaleDateString()}</td>
            <td>
              <Button
                color="info"
                size="sm"
                style={{ marginRight: '0.5rem' }}
                onClick={() => openViewMoreModal(evt)}
              >
                View More         
                     </Button>

              {manageSection === 'all' && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => openEditModal(evt)}
                >
                  Edit
                </Button>
              )}

              {manageSection === 'edited' && (
  <Button
    color="secondary"
    size="sm"
    style={{ marginRight: '0.5rem' }}
    onClick={() => openOriginalModal(evt)}
  >
    Show Original
  </Button>
)}


              {manageSection === 'edited' && (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    style={{ marginRight: '0.5rem' }}
                    onClick={() => handleDelete(evt)}
                  >
                    Delete
                  </Button>
                 <Button
                    color="success"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleKeep(evt)}
                  >
                    Keep
                  </Button>

                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
          </Table>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Row className="justify-content-center">
              <Col md={4} className="mb-4">
                <Card className="admin-card hover-effect">
                  <CardBody>
                    <CardText className="text-center">
                      Manage User's Events
                    </CardText>
                    <div className="card-icon">
                      <span role="img" aria-label="gear">
                        ⚙️
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="admin-card hover-effect">
                  <CardBody>
                    <CardText className="text-center">Monitor Posts</CardText>
                    <div className="card-icon">
                      <span role="img" aria-label="gear">
                        ⚙️
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md={4} className="mb-4">
                <Card className="admin-card hover-effect">
                  <CardBody>
                    <CardText className="text-center">Message Requests</CardText>
                    <div className="card-icon">
                      <span role="img" aria-label="gear">
                        ⚙️
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        );
      case 'manageEvents':
        return renderManageEvents();
      case 'monitorPosts':
        return (
          <div className="text-center">
            <h3>Monitor Posts</h3>
            <p>Post monitoring functionality goes here.</p>
          </div>
        );
      case 'messages':
        return (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Button color="primary" size="sm">
                Pending Requests
              </Button>
            </div>
            {renderMessages()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2 className="logo">Event Diary</h2>
        <ul className="menu">
          <li onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li onClick={() => setActiveTab('manageEvents')}>Manage Events</li>
          <li onClick={() => setActiveTab('monitorPosts')}>Monitor Posts</li>
          <li onClick={() => setActiveTab('messages')}>Messages</li>
        </ul>
      </div>

      <div className="main-content">
        <h3 className="welcome-text">Welcome Admin!</h3>
        <Container>{renderContent()}</Container>
      </div>

<Modal isOpen={modalOpen} toggle={closeEditModal}>
  <ModalHeader toggle={closeEditModal}>Edit Event</ModalHeader>
  <ModalBody>
    <Form onSubmit={e => {
        e.preventDefault();
        setActionLoading(true);
        const newTags = e.target.hashtags.value
          .split(',').map(t => t.trim()).filter(Boolean);
        axios.put(
          `http://127.0.0.1:8080/admin/events/${selectedEvent._id}`,
          { hashtags: newTags }
        )
        .then(() =>
          axios.put(
            `http://127.0.0.1:8080/posts/event/${selectedEvent._id}`,
            { hashtags: newTags }
          )
        )
        .then(() => {
          dispatch(fetchEvents());
          dispatch(fetchPosts());
          closeEditModal();
          alert('Hashtags updated and live immediately!');
        })
        .catch(() => alert('Couldn’t update hashtags—please try again.'))
        .finally(() => setActionLoading(false));
      }}>
      <FormGroup>
        <Label>User Email</Label>
        <Input defaultValue={selectedEvent?.organizerEmail} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Organizer Name</Label>
        <Input defaultValue={selectedEvent?.organizerName} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Title</Label>
        <Input defaultValue={selectedEvent?.title} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Description</Label>
        <Input
          type="textarea"
          defaultValue={selectedEvent?.description}
          disabled
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </FormGroup>
      <FormGroup>
        <Label>Type</Label>
        <Input defaultValue={selectedEvent?.eventType} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Location</Label>
        <Input defaultValue={selectedEvent?.location} disabled />
      </FormGroup>
      <FormGroup>
        <Label for="hashtags">Hashtags</Label>
        <Input
          id="hashtags"
          name="hashtags"
          defaultValue={selectedEvent?.hashtags.join(', ')}
        />
      </FormGroup>
      <FormGroup>
        <Label>Event Time</Label>
        <Input defaultValue={selectedEvent?.eventTime} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Start Date</Label>
        <Input
          type="date"
          defaultValue={selectedEvent?.startDate?.slice(0, 10)}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>End Date</Label>
        <Input
          type="date"
          defaultValue={selectedEvent?.endDate?.slice(0, 10)}
          disabled
        />
      </FormGroup>
      {selectedEvent?.image && (
        <FormGroup>
          <Label>Image</Label>
          <img
            src={getImageUrl(selectedEvent.image)}
            alt="Event"
            style={{ width: '100%', marginTop: '.5rem' }}
          />
        </FormGroup>
      )}
      <ModalFooter>
        <Button color="primary" type="submit" disabled={actionLoading}>
          {actionLoading ? 'Saving…' : 'Save Changes'}
        </Button>{' '}
        <Button color="secondary" onClick={closeEditModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Form>
  </ModalBody>
</Modal>

<Modal isOpen={detailModalOpen} toggle={closeDetailModal}>
  <ModalHeader toggle={closeDetailModal}>
    {selectedEvent?.title}
  </ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <Label>User Email</Label>
        <Input defaultValue={selectedEvent?.organizerEmail} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Organizer Name</Label>
        <Input defaultValue={selectedEvent?.organizerName} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Title</Label>
        <Input defaultValue={selectedEvent?.title} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Description</Label>
        <Input
          type="textarea"
          defaultValue={selectedEvent?.description}
          disabled
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </FormGroup>
      <FormGroup>
        <Label>Type</Label>
        <Input defaultValue={selectedEvent?.eventType} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Location</Label>
        <Input defaultValue={selectedEvent?.location} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Hashtags</Label>
        <Input
          defaultValue={selectedEvent?.hashtags.join(', ')}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Event Time</Label>
        <Input defaultValue={selectedEvent?.eventTime} disabled />
      </FormGroup>
      <FormGroup>
        <Label>Start Date</Label>
        <Input
          type="date"
          defaultValue={selectedEvent?.startDate?.slice(0, 10)}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>End Date</Label>
        <Input
          type="date"
          defaultValue={selectedEvent?.endDate?.slice(0, 10)}
          disabled
        />
      </FormGroup>
      {selectedEvent?.image && (
        <FormGroup>
          <Label>Image</Label>
          <img
            src={getImageUrl(selectedEvent.image)}
            alt="Event"
            style={{ width: '100%', marginTop: '.5rem' }}
          />
        </FormGroup>
      )}
    </Form>
  </ModalBody>
  <ModalFooter>
    <Button color="success" onClick={() => acceptEvent(selectedEvent)}>
      Accept
    </Button>{' '}
    <Button color="danger" onClick={() => rejectEvent(selectedEvent)}>
      Reject
    </Button>{' '}
    <Button color="secondary" onClick={closeDetailModal}>
      Close
    </Button>
  </ModalFooter>
</Modal>





<Modal isOpen={viewMoreModalOpen} toggle={closeViewMoreModal}>
  <ModalHeader toggle={closeViewMoreModal}>
    {viewMoreEvent?.title}
  </ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <Label>User Email</Label>
        <Input
          defaultValue={viewMoreEvent?.organizerEmail}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Organizer Name</Label>
        <Input
          defaultValue={viewMoreEvent?.organizerName}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Title</Label>
        <Input
          defaultValue={viewMoreEvent?.title}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Description</Label>
        <Input
          type="textarea"
          defaultValue={viewMoreEvent?.description}
          disabled
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </FormGroup>
      <FormGroup>
        <Label>Type</Label>
        <Input
          defaultValue={viewMoreEvent?.eventType}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Location</Label>
        <Input
          defaultValue={viewMoreEvent?.location}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Hashtags</Label>
        <Input
          defaultValue={viewMoreEvent?.hashtags.join(', ')}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Event Time</Label>
        <Input
          defaultValue={viewMoreEvent?.eventTime}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>Start Date</Label>
        <Input
          type="date"
          defaultValue={viewMoreEvent?.startDate?.slice(0,10)}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>End Date</Label>
        <Input
          type="date"
          defaultValue={viewMoreEvent?.endDate?.slice(0,10)}
          disabled
        />
      </FormGroup>
      {viewMoreEvent?.image && (
        <FormGroup>
          <Label>Image</Label>
          <img
            src={getImageUrl(viewMoreEvent.image)}
            alt="Event"
            style={{ width: '100%', marginTop: '.5rem' }}
          />
        </FormGroup>
      )}
    </Form>
  </ModalBody>
  <ModalFooter>
   <Button color="secondary" onClick={closeViewMoreModal}>
      Close
    </Button>
  </ModalFooter>
</Modal>



<Modal isOpen={originalModalOpen} toggle={closeOriginalModal}>
  <ModalHeader toggle={closeOriginalModal}>
    Original Data
  </ModalHeader>
  <ModalBody>
    <p><strong>Title:</strong> {originalEventData?.title}</p>
    <p><strong>Description:</strong> {originalEventData?.description}</p>
    <p><strong>Type:</strong> {originalEventData?.eventType}</p>
    <p><strong>Location:</strong> {originalEventData?.location}</p>
    <p><strong>Hashtags:</strong> {(originalEventData?.hashtags || []).join(', ')}</p>
    <p><strong>Event Time:</strong> {originalEventData?.eventTime}</p>
    <p>
      <strong>Start Date:</strong>{' '}
      {originalEventData?.startDate
        ? new Date(originalEventData.startDate).toLocaleDateString()
        : ''}
    </p>
    <p>
      <strong>End Date:</strong>{' '}
      {originalEventData?.endDate
        ? new Date(originalEventData.endDate).toLocaleDateString()
        : ''}
    </p>
    {originalEventData?.image && (
      <img
        src={getImageUrl(originalEventData.image)}
        alt="Original event"
        style={{ width: '100%', marginTop: '1rem' }}
      />
    )}
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" onClick={closeOriginalModal}>
      Close
    </Button>
  </ModalFooter>
</Modal>





    </div>
  );
};

export default AdminDash;
