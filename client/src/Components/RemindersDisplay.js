import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { fetchReminders, deleteReminder } from '../Features/reminderSlice';


const RemindersDisplay = () => {
  const { user } = useSelector((state) => state.user);
  const reminders = useSelector((state) => state.reminder.reminders);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchReminders(user.id));
    }
  }, [dispatch, user]);

  // Inline CountdownTimer component defined within RemindersDisplay
  const CountdownTimer = ({ eventDate }) => {
    const calculateTimeLeft = () => {
      const difference = +new Date(eventDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 * 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }, [eventDate]);

    const timerComponents = [];
    Object.keys(timeLeft).forEach((interval) => {
      if (!timeLeft[interval]) return;
      timerComponents.push(
        <span key={interval}>
          {timeLeft[interval]} {interval}{' '}
        </span>
      );
    });

    return (
      <div className="reminder-timer">
        {timerComponents.length > 0 ? timerComponents : <span>Event has started!</span>}
      </div>
    );
  };

  if (reminders.length === 0) return null;

  return (
    <div className="reminders-display">
      <h3 className="reminders-title">Your Reminders</h3>
      <div className={`reminders-list ${reminders.length === 1 ? 'single-reminder' : ''}`}>
        {reminders.map((reminder) => (
          <div key={reminder._id} className="reminder-item">
            <div className="reminder-header">
              <div className="reminder-details">
                <div className="reminder-event-type">
                  {reminder.eventType || 'Event'}
                </div>
                <div className="reminder-location">
                  {reminder.location}
                </div>
                <div className="reminder-date">
                  {new Date(reminder.startDate).toLocaleDateString()} at {new Date(reminder.startDate).toLocaleTimeString()}
                </div>
                <CountdownTimer eventDate={reminder.startDate} />
              </div>
              <Button 
                color="danger" 
                size="sm" 
                className="reminder-button" 
                onClick={() => dispatch(deleteReminder(reminder._id))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemindersDisplay;
