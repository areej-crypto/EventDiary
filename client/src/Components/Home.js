import React, { useState } from 'react';
import { Container, Row, Col, Button, Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption } from 'reactstrap';
import { FaMusic } from "react-icons/fa"; // For Concerts
import { FaMasksTheater } from "react-icons/fa6"; // For Performing Arts
import { MdBusinessCenter } from "react-icons/md"; // For Conferences
import { MdOutlineFestival } from "react-icons/md"; // For Festivals
import { LuHandshake } from "react-icons/lu"; // For Charity
import eventBG from '../Images/eventBG.jpeg';
import eventBG1 from '../Images/eventBG1.jpg';
import eventBG2 from '../Images/eventBG2.jpg';
import eventBG3 from '../Images/eventBG3.jpg';
import eventBG4 from '../Images/eventBG4.jpg';
import eventBG5 from '../Images/eventBG5.jpg';
import eventBG6 from '../Images/eventBG6.jpg';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    { src: eventBG, altText: "Event 1", caption: "Don't Miss Out!" },
    { src: eventBG1, altText: "Event 2", caption: "Explore Vibrant Events!" },
    { src: eventBG2, altText: "Event 3", caption: "Join Us Today!" },
    { src: eventBG3, altText: "Event 4", caption: "Find Your Adventure!" },
    { src: eventBG4, altText: "Event 5", caption: "Be Part of Something Big!" },
    { src: eventBG5, altText: "Event 6", caption: "Create Memories!" },
    { src: eventBG6, altText: "Event 7", caption: "Come Together!" }
  ];

  const next = () => {
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  }

  const previous = () => {
    const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(prevIndex);
  }

  const goToIndex = (newIndex) => {
    setActiveIndex(newIndex);
  }

  return (
    <div>
      <div className="hero-section text-center" style={{ position: 'relative', height: '400px' }}>
        <Carousel activeIndex={activeIndex} next={next} previous={previous}>
          <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <img
                src={item.src}
                alt={item.altText}
                style={{
                  width: '100%',
                  height: '400px', 
                  objectFit: 'cover', 
                  zIndex: -1,
                }}
              />
              
              <CarouselCaption captionText={item.caption} captionHeader={item.caption} />
            </CarouselItem>
          ))}
          <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
          <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
        </Carousel>
        <div className="overlay">
          
          <h1>{items[activeIndex].caption}</h1>
          <p>Explore the vibrant events happening locally</p>
        </div>
      </div>

      {/* Links Section */}
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={2} sm={4} xs={6} className="text-center mb-4">
            <Button className="btn" outline href="/register">
              <FaMusic className="icon" size={30} />
              <br /> Concerts
            </Button>
          </Col>
          <Col md={2} sm={4} xs={6} className="text-center mb-4">
            <Button className="btn" outline href="/register">
              <FaMasksTheater className="icon" size={30} />
              <br /> Performing Arts
            </Button>
          </Col>
          <Col md={2} sm={4} xs={6} className="text-center mb-4">
            <Button className="btn" outline href="/register">
              <MdBusinessCenter className="icon" size={30} />
              <br /> Conferences
            </Button>
          </Col>
          <Col md={2} sm={4} xs={6} className="text-center mb-4">
            <Button className="btn" outline href="/register">
              <MdOutlineFestival className="icon" size={30} />
              <br /> Festivals
            </Button>
          </Col>
          <Col md={2} sm={4} xs={6} className="text-center mb-4">
            <Button className="btn" outline href="/register">
              <LuHandshake className="icon" size={30} />
              <br /> Charity
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
