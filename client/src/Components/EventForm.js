import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from '../Features/eventSlice';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { EventValidations } from '../Validations/EventValidations';

import { Button, FormGroup, Label, Input } from 'reactstrap';

const EventForm = ({ toggleForm }) => {
  const dispatch = useDispatch();
  const { isLoading, isError, errorMessage } = useSelector((state) => state.event);
  const { user } = useSelector((state) => state.user);

  const [image, setImage] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (jpg, png, etc.) only.');
      e.target.value = null;
      return;
    }
    setImage(file);
  };

  const initialValues = {
    title: '',
    description: '',
    eventType: '',
    location: '',
    hashtags: '',
    eventTime: '',
    startDate: '',
    endDate: '',
  };

  //  onSubmit uses the validated values from Formik
  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Build FormData
      const data = new FormData();
      data.append('title', values.title);
      data.append('description', values.description);
      data.append('eventType', values.eventType);
      data.append('location', values.location);
      data.append('hashtags', values.hashtags);
      data.append('eventTime', values.eventTime);
      data.append('startDate', values.startDate);
      data.append('endDate', values.endDate);

      // Add organizer info
      data.append('organizerName', user ? user.uname : 'Unknown');
      data.append('organizerEmail', user ? user.email : 'unknown@example.com');
      data.append('userPic', user && user.pic ? user.pic : '');
      data.append('submittedAt', new Date().toISOString());

      // If image is selected, append
      if (image) {
        data.append('image', image);
      }

      // Dispatch create event
      await dispatch(createEvent(data)).unwrap();
      alert('Submitted successfully');

      // Reset form + image
      resetForm();
      setImage(null);

      if (toggleForm) toggleForm();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={EventValidations}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <FormGroup>
            <Label for="title">Event Title</Label>
            <Field
              as={Input}
              type="text"
              id="title"
              name="title"
            />
            <ErrorMessage name="title" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="description">Event Description</Label>
            <Field
              as={Input}
              type="textarea"
              id="description"
              name="description"
              placeholder="Please include all event details (location, agenda, etc.)"
            />
            <ErrorMessage name="description" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="eventType">Event Type</Label>
            <Field
              as={Input}
              type="select"
              id="eventType"
              name="eventType"
            >
              <option value="">Select event type</option>
              <option value="Concerts">Concerts</option>
              <option value="Performing Arts">Performing Arts</option>
              <option value="Conferences">Conferences</option>
              <option value="Festivals">Festivals</option>
              <option value="Charity">Charity</option>
              <option value="Other">Other</option>
            </Field>
            <ErrorMessage name="eventType" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="location">Location</Label>
            <Field
              as={Input}
              type="select"
              id="location"
              name="location"
            >
              <option value="">Select location</option>
              <option value="Muscat">Muscat</option>
              <option value="Salalah">Salalah</option>
              <option value="Nizwa">Nizwa</option>
              <option value="Sohar">Sohar</option>
              <option value="Bahla">Bahla</option>
              <option value="Musandam">Musandam</option>
              <option value="Other">Other</option>
            </Field>
            <ErrorMessage name="location" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="hashtags">Hashtags</Label>
            <Field
              as={Input}
              type="text"
              id="hashtags"
              name="hashtags"
              placeholder="e.g. #music, #festival"
            />
            <ErrorMessage name="hashtags" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="eventTime">Event Time</Label>
            <Field
              as={Input}
              type="time"
              id="eventTime"
              name="eventTime"
            />
            <ErrorMessage name="eventTime" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="startDate">Start Date</Label>
            <Field
              as={Input}
              type="date"
              id="startDate"
              name="startDate"
            />
            <ErrorMessage name="startDate" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="endDate">End Date</Label>
            <Field
              as={Input}
              type="date"
              id="endDate"
              name="endDate"
            />
            <ErrorMessage name="endDate" component="div" className="text-danger" />
          </FormGroup>

          <FormGroup>
            <Label for="image">Upload Picture</Label>
            <Input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
          </FormGroup>

          <p style={{ color: 'red', fontWeight: 'bold' }}>
            *Please note that the admin will approve or decline your event request.
          </p>

          {isError && (
            <p style={{ color: 'red' }}>
              {typeof errorMessage === 'object' ? errorMessage.message : errorMessage}
            </p>
          )}

          <Button type="submit" color="primary" disabled={isSubmitting || isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
          <Button type="button" onClick={toggleForm} color="secondary" className="ms-2">
            Cancel
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default EventForm;
