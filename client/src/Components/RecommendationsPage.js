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
import { fetchRecommendations } from '../Features/recommendationsSlice';

export default function RecommendationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const { items: recs, loading, error } = useSelector(state => state.recommendations);

  useEffect(() => {
    if (user?.id) dispatch(fetchRecommendations(user.id));
  }, [dispatch, user?.id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center">Error loading recommendations: {error}</p>;
  }

  if (!recs.length) {
    return <p className="text-center">No recommendations yet</p>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Recommended for you</h2>
      <Row>
        {recs.map(r => {
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
          } = r;

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
                    {title}
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
