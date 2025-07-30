import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaLightbulb,
  FaRocket,
  FaSearch,
  FaCameraRetro,
  FaHandshake,
  FaCommentDots,
} from "react-icons/fa";

const AboutUs = () => {
  const navigate = useNavigate();

  // Handler to redirect to the Register page
  const handleViewContentFeed = () => {
    navigate("/register");
  };

  return (
    <div className="aboutus-wrapper">
      <div className="aboutus-hero">
        <div className="hero-content">
          <h1>About Event Diary</h1>
          <p>Where every occasion finds its perfect stage.</p>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="aboutus-content">
        <section className="aboutus-section">
          <h2>Welcome to Event Diary</h2>
          <p>
            Event Diary is a platform designed to bring people together through
            memorable events, workshops, and celebrations. Whether you’re
            seeking a place to share your own experiences or discover something
            new, we’re here to help you make the most of life’s special moments.
          </p>
        </section>

        <section className="aboutus-section">
          <h2>Our Story</h2>
          <p>
            It all started with a simple idea: connecting communities by
            spotlighting the best local happenings. As avid event-goers, we
            found ourselves missing out on hidden gems because we didn’t know
            where to look. We wanted a space where people could both create and
            explore events in a way that felt effortless and exciting.
          </p>
          <p>
            What began as a passion project quickly grew into a vibrant
            community—one that now extends across multiple cities, from Muscat
            to Nizwa, Sohar, and beyond.
          </p>
        </section>

        <section className="aboutus-section mission-icons">
          <h2>Our Mission</h2>
          <div className="icons-grid">
            <div className="icon-card">
              <FaUsers className="icon-style" />
              <h3>Empower Organizers</h3>
              <p>
                We provide the tools and platform for creators to promote their
                ideas and reach new audiences.
              </p>
            </div>
            <div className="icon-card">
              <FaLightbulb className="icon-style" />
              <h3>Inspire Attendees</h3>
              <p>
                From concerts to conferences, we curate diverse events that
                spark curiosity and exploration.
              </p>
            </div>
            <div className="icon-card">
              <FaHandshake className="icon-style" />
              <h3>Foster Community</h3>
              <p>
                We celebrate local culture and build connections through
                engaging, inclusive gatherings.
              </p>
            </div>
          </div>
        </section>

        {/* Why Event Diary */}
        <section className="aboutus-section">
          <h2>Why Event Diary?</h2>
          <ul className="why-list">
            <li>
              <FaSearch className="why-icon" />
              <strong>Easy Discovery:</strong> Our user-friendly feed showcases
              events tailored to your interests.
            </li>
            <li>
              <FaCameraRetro className="why-icon" />
              <strong>Seamless Sharing:</strong> Post photos and updates in just
              a few clicks.
            </li>
            <li>
              <FaCommentDots className="why-icon" />
              <strong>Real Community:</strong> Connect with others through
              comments, likes, and reminders.
            </li>
            <li>
              <FaRocket className="why-icon" />
              <strong>Inspiration &amp; Ideas:</strong> Explore recommended and
              trending events to find new ways to celebrate.
            </li>
          </ul>
        </section>

        <section className="aboutus-section">
          <h2>Our Vision for the Future</h2>
          <p>
            We’re continually evolving Event Diary to make it the go-to platform
            for anyone seeking unforgettable experiences. Expect more ways to
            connect, new features for organizers, and an ever-growing list of
            events that reflect the richness and diversity of our communities.
          </p>
        </section>

        <section className="aboutus-section aboutus-quote">
          <p>
            <strong>Thank you for being a part of our story.</strong> We can’t
            wait to see the memories you create and share through Event Diary.
            Here’s to the celebrations—big and small—that bring us closer
            together!
          </p>
          <blockquote className="quote">
            “Celebrations are the punctuation marks that make life’s story worth
            reading.”
          </blockquote>
        </section>
      </div>

      {/* Calling Section */}
      <div className="aboutus-cta">
        <h2>Ready to Explore More?</h2>
        <p>
          Check out our Content Feed to discover the latest happenings or head
          to your Profile to share your own!
        </p>
        <button className="cta-button" onClick={handleViewContentFeed}>
          View Content Feed
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
