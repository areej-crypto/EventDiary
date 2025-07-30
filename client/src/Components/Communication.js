import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';

const API = 'http://127.0.0.1:8080';

const Communication = () => {
  const { user } = useSelector(state => state.user);
  const [events, setEvents] = useState([]);
  const [moderations, setModerations] = useState([]);
  const [activeSection, setActiveSection] = useState('events');
  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const lightBlue = '#bbdefb';
  const textColor = '#0d47a1';

  useEffect(() => {
    if (!user) return;

    if (activeSection === 'moderations') {
            // Fetch all alerts for this user, then locally drop the acknowledged ones
            axios
              .get(`${API}/moderations?userEmail=${encodeURIComponent(user.email)}`)
              .then(res => {
                const unacked = res.data.filter(m => !m.acknowledged);
                setModerations(unacked);
              })
              .catch(err => console.error('Error fetching moderations:', err));
          } else {
      axios.get(`${API}/events`)
        .then(res => {
          let mine = res.data.filter(ev => ev.organizerEmail === user.email);
          mine = mine.filter(ev =>
            ev.status === 'pending' ||
            (!ev.viewedByUser && ['approved','rejected'].includes(ev.status))
          );
          setEvents(mine);
        })
        .catch(err => console.error('Error fetching events:', err));
    }
  }, [user, activeSection]);

  const handleAcknowledgeEvent = async id => {
    try {
      await axios.put(`${API}/events/${id}/viewed`);
      setEvents(evts => evts.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error acknowledging event:', err);
    }
  };

  const handleAcknowledgeModeration = async id => {
    try {
      await axios.put(`${API}/moderations/${id}/acknowledge`);
      setModerations(ms => ms.filter(m => m._id !== id));
    } catch (err) {
      console.error('Error acknowledging moderation:', err);
    }
  };

  const openModal = item => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };

  const eventTabs = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' }
  ];

  const badgeColor = status =>
    status === 'approved' ? 'success' :
    status === 'rejected'  ? 'danger'  :
                             'warning';

  const filteredEvents = events.filter(ev => ev.status === activeTab);

  return (
    <div className="communication-page">
      <Container>
        <Row className="mb-4">
          <Col><h2>Communication Center</h2></Col>
        </Row>

        <Row className="mb-3">
          <Col md={2} className="left-sidebar">
            <Nav vertical pills>
              <NavItem>
                <NavLink
                  className={activeSection === 'events' ? 'active' : ''}
                  onClick={() => setActiveSection('events')}
                  style={activeSection === 'events' ? { backgroundColor: lightBlue, color: textColor } : {}}
                >Events</NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeSection === 'moderations' ? 'active' : ''}
                  onClick={() => setActiveSection('moderations')}
                  style={activeSection === 'moderations' ? { backgroundColor: lightBlue, color: textColor } : {}}
                >Post Alerts</NavLink>
              </NavItem>
            </Nav>
          </Col>

          <Col md={10}>
            {activeSection === 'events' ? (
              <>
                <Nav pills className="mb-3">
                  {eventTabs.map(t => (
                    <NavItem key={t.key}>
                      <NavLink
                        className={activeTab === t.key ? 'active' : ''}
                        onClick={() => setActiveTab(t.key)}
                        style={activeTab === t.key ? { backgroundColor: lightBlue, color: textColor } : {}}
                      >{t.label}</NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {!filteredEvents.length ? (
                  <p>No {eventTabs.find(t => t.key === activeTab).label.toLowerCase()} events.</p>
                ) : filteredEvents.map(ev => (
                  <Card key={ev._id} className="mb-3 communication-card">
                    <CardBody className="d-flex justify-content-between align-items-start">
                      <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => openModal(ev)}>
                        <h5>{ev.title}</h5>
                        <p className="mb-1">{ev.description}</p>
                        <small>{new Date(ev.submittedAt).toLocaleString()}</small>
                      </div>
                      <div className="text-end">
                        <Badge color={badgeColor(ev.status)} pill className="mb-2">
                          {ev.status}
                        </Badge>
                        <Button size="sm" onClick={() => handleAcknowledgeEvent(ev._id)}>
                          OK
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </>
            ) : (
              !moderations.length ? (
                <p>No post moderation alerts.</p>
              ) : moderations.map(n => (
                <Card key={n._id} className="mb-3 communication-card">
                  <CardBody className="d-flex justify-content-between align-items-start">
                    <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => openModal(n)}>
                      <h5>{n.postText ? `${n.postText.slice(0,50)}…` : 'Removed Post'}</h5>
                      <p className="mb-1">{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="text-end">
                      <Badge color="danger" pill className="mb-2">
                        Deleted
                      </Badge>
                      <Button size="sm" onClick={() => handleAcknowledgeModeration(n._id)}>
                        OK
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </Col>
        </Row>

        {selectedItem && (
          <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
            <ModalHeader toggle={closeModal}>
              {activeSection === 'events'
                ? selectedItem.title
                : (selectedItem.postText || 'Removed Post')}
            </ModalHeader>
            <ModalBody>
              {activeSection === 'events' ? (
                <>
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                  <p><strong>Type:</strong> {selectedItem.eventType}</p>
                  <p><strong>Location:</strong> {selectedItem.location}</p>
                  <p><strong>Hashtags:</strong> {selectedItem.hashtags}</p>
                  <p><strong>Time:</strong> {selectedItem.eventTime}</p>
                  <p><strong>Start:</strong> {new Date(selectedItem.startDate).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(selectedItem.endDate).toLocaleString()}</p>
                </>
              ) : (
                <>
                  <p><strong>Original:</strong> {selectedItem.postText}</p>
                  <p><strong>Reason:</strong> {selectedItem.message}</p>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={closeModal}>Close</Button>
            </ModalFooter>
          </Modal>
        )}
      </Container>
    </div>
  );
};

export default Communication;
