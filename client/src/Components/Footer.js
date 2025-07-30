import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="footer-content">
          <Col md={4} className="footer-section">
            <h5>Event Diary</h5>
            <p className="footer-description">
              Your go-to platform for discovering and sharing memorable events, workshops, and celebrations.
            </p>
          </Col>
          <Col md={4} className="footer-section">
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><span>About Us</span></li>
              <li><span>Events</span></li>
              <li><span>Communication</span></li>
              <li><span>Report</span></li>
            </ul>
          </Col>
          <Col md={4} className="footer-section">
            <h5>Connect With Us</h5>
            <div className="social-links">
              <span aria-label="Facebook">
                <FaFacebook />
              </span>
              <span aria-label="Twitter">
                <FaTwitter />
              </span>
              <span aria-label="Instagram">
                <FaInstagram />
              </span>
              <span aria-label="LinkedIn">
                <FaLinkedin />
              </span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Event Diary. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
