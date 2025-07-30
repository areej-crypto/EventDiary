import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Button,
  Spinner
} from 'reactstrap';
import { fetchTrending } from '../Features/trendingSlice';

const  TrendsPage=()=>{
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: trends, loading, error } = useSelector(state => state.trending);

  useEffect(() => {
    dispatch(fetchTrending());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

if (error) {
  const msg =
    typeof error === 'string'
      ? error
      : error.error || JSON.stringify(error);

  return (
    <p className="text-danger text-center">
      Error loading trending: {msg}
    </p>
  );
}


  if (!trends.length) {
    return <p className="text-center">No trending events yet</p>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Trending Events</h2>
      <Row>
        {trends.map((ev, index) => {
          const {
            _id,
            image,
            title,
            eventType,
            startDate,
            endDate,
            location,
            description,
            hashtags
          } = ev;

          const tags = Array.isArray(hashtags)
            ? hashtags
            : typeof hashtags === 'string'
              ? hashtags.split(/\s*,\s*/).filter(Boolean)
              : [];

          return (
            <Col key={_id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                {image && <CardImg top width="100%" src={image} alt={title} />}
                <CardBody className="d-flex flex-column">
                  <CardTitle tag="h5" className="mb-2">
                    {index + 1}. {title}
                  </CardTitle>
                  <CardText tag="small" className="text-muted mb-3">
                    {eventType}
                  </CardText>
                  <CardText className="flex-grow-1 text-truncate mb-3">
                    {description}
                  </CardText>

                  {tags.length > 0 && (
                    <div className="mb-3">
                      {tags.map(tag => (
                        <Badge color="secondary" pill className="me-1" key={tag}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>When:</strong>{' '}
                      {new Date(startDate).toLocaleString()} –{' '}
                      {new Date(endDate).toLocaleString()}
                    </p>
                    <p className="mb-0">
                      <strong>Where:</strong> {location}
                    </p>
                  </div>

                  <Button
                    color="primary"
                    size="sm"
                    onClick={() =>
                      navigate('/content-feed', { state: { jumpToEventId: _id } })
                    }
                  >
                    View in Feed
                  </Button>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
export default TrendsPage;