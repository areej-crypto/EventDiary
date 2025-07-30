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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input
} from 'reactstrap';

const API = 'http://127.0.0.1:8080';

const Report = () => {
  const { user } = useSelector(state => state.user);
  const [reports, setReports] = useState([]);
  const [flags, setFlags] = useState([]);
  const [activeSection, setActiveSection] = useState('reports'); // 'reports' or 'moderations'
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const isAdmin = user?.role === 'admin';
  const lightBlue = '#bbdefb';
  const textColor = '#0d47a1';

  useEffect(() => {
    if (!user) return;

    if (activeSection === 'moderations') {
      // Admin sees every flagged post, users only get their own
      const url = isAdmin
        ? `${API}/moderations`
        : `${API}/moderations?userEmail=${encodeURIComponent(user.email)}`;

      axios.get(url)
        .then(res => setFlags(res.data))
        .catch(err => console.error('Error fetching flagged content:', err));
    } else {
      // Event history: admin sees all, users only their own
      axios.get(`${API}/events`)
        .then(res => {
          let data = res.data.filter(ev => ['approved','rejected'].includes(ev.status));
          if (!isAdmin) {
            data = data.filter(ev => ev.organizerEmail === user.email);
          }
          setReports(data);
        })
        .catch(err => console.error('Error fetching reports:', err));
    }
  }, [user, isAdmin, activeSection]);

  const openModal = item => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };

  const visibleReports = reports.filter(ev =>
    filter === 'all' ? true : ev.status === filter
  );

  const badgeColor = status =>
    status === 'approved' ? 'success' :
    status === 'rejected'  ? 'danger'  :
                             'warning';

  return (
    <div className="report-page">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2>
              {isAdmin
                ? (activeSection === 'reports' ? 'All Events Report' : 'Flagged Posts')
                : (activeSection === 'reports' ? 'My Event History' : 'Post Alerts')}
            </h2>
          </Col>
        </Row>

        <Row className="mb-3">
          {/* Sidebar */}
          <Col md={2} className="left-sidebar">
            <Nav vertical pills>
              <NavItem>
                <NavLink
                  className={activeSection === 'reports' ? 'active' : ''}
                  onClick={() => setActiveSection('reports')}
                  style={activeSection === 'reports' ? { backgroundColor: lightBlue, color: textColor } : {}}
                >
                  {isAdmin ? 'Event Reports' : 'My History'}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeSection === 'moderations' ? 'active' : ''}
                  onClick={() => setActiveSection('moderations')}
                  style={activeSection === 'moderations' ? { backgroundColor: lightBlue, color: textColor } : {}}
                >
                  Post Alerts
                </NavLink>
              </NavItem>
            </Nav>
          </Col>

          {/* Main Content */}
          <Col md={10}>
            {activeSection === 'reports' ? (
              <>
                  <FormGroup style={{ maxWidth: '200px' }}>
                    <Label for="statusFilter">Show</Label>
                    <Input
                      type="select"
                      id="statusFilter"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="approved">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Input>              

                  </FormGroup>

                {((!isAdmin && reports.length === 0) || (isAdmin && visibleReports.length === 0)) ? (
                  <p>No {filter !== 'all' ? filter : ''} records to display.</p>
                ) : (
                  <Row>
                    {visibleReports.map(ev => (
                      <Col md={4} key={ev._id} className="mb-3">
                        <Card onClick={() => openModal(ev)} style={{ cursor: 'pointer' }}>
                          <CardBody>
                            <h5>{ev.title}</h5>
                            <Badge color={badgeColor(ev.status)} pill>{ev.status}</Badge>
                            <p>
                              <small>
                                Submitted on {new Date(ev.submittedAt).toLocaleDateString()}{' '}
                                {new Date(ev.submittedAt).toLocaleTimeString()}
                              </small>
                            </p>
                            {isAdmin && (
                              <p>
                                <small>
                                  By {ev.organizerName} ({ev.organizerEmail})
                                </small>
                              </p>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            ) : (
              // Post Alerts tab
              flags.length === 0 ? (
                <p>No post moderation alerts.</p>
              ) : (
                flags.map(f => (
                                    <Card
                                      key={f._id}
                                      className="mb-3 report-card"
                                      onClick={() => openModal(f)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <CardBody>
                                        <h5>{f.postText ? `${f.postText.slice(0,50)}…` : 'Removed Post'}</h5>
                                        <Badge color="danger" pill>Deleted</Badge>
                                      <p>
                                          <small>Flagged on {new Date(f.createdAt).toLocaleString()}</small>
                                        </p>
                                        {/* show who triggered it */}
                                        <p>
                                          <small>User: {f.userEmail}</small>
                                        </p>
                                        <p className="mt-2">{f.message}</p>
                                      </CardBody>
                                    </Card>
                                  ))
              )
            )}
          </Col>
        </Row>

        {/* Detail Modal */}
        {selectedItem && (
          <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
            <ModalHeader toggle={closeModal}>
              {activeSection === 'reports'
                ? selectedItem.title
                : (selectedItem.postText || 'Removed Post')}
            </ModalHeader>
            <ModalBody>
              {activeSection === 'reports' ? (
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
                  <p><strong>User:</strong> {selectedItem.userEmail}</p>

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

export default Report;
