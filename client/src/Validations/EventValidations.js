import * as Yup from 'yup';

export const EventValidations = Yup.object({
  title: Yup.string()
    .required('Event title is required')
    .min(3, 'Event title must be at least 3 characters long'),

  description: Yup.string()
    .required('Event description is required')
    .min(10, 'Event description must be at least 10 characters long'),

  eventType: Yup.string().required('Event type is required'),
  location: Yup.string().required('Event location is required'),
  eventTime: Yup.string().required('Event time is required'),

  startDate: Yup.date()
    .required('Event start date is required')
    .min(new Date(Date.now()+5  * 24 * 60 * 60 * 1000), 'Start date should be 5 days from now'),

  endDate: Yup.date()
    .required('Event end date is required')
    .min(Yup.ref('startDate'), 'End date must be after the start date'),

  hashtags: Yup.string()
    .transform((value) => {
      const trimmed = (value || '').trim();
      return trimmed || '#default';
    })

    .test(
      'allStartWithHash',
      'All hashtags must start with "#" (e.g. #music, #festival)',
      function (value) {
        if (!value) return true; // If we ended up with an empty string, skip
        const parts = value.split(',');
        return parts.every((tag) => tag.trim().startsWith('#'));
      }
    )

    .required('Hashtags are required'),
});
