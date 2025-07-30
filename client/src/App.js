import './App.css';
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Container, Row } from 'reactstrap';
import { FaArrowLeft } from 'react-icons/fa';

import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import ContentFeed from './Components/ContentFeed';
import ForgotPass from './Components/ForgotPass';
import ResetPass from './Components/ResetPass';
import AboutUs from './Components/AboutUs';
import Communication from './Components/Communication';
import Report from './Components/Report';
import AdminDash from './Components/AdminDash';
import Profile from './Components/Profile';
import Edit from './Components/Edit';
import RecommendationsPage from './Components/RecommendationsPage';
import TrendsPage from './Components/Trends';
// only show this on /edit-profile
const GlobalBackButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== "/edit-profile") return null;

  const lang = localStorage.getItem('profileLang') === 'ar' ? 'ar' : 'en';
  const label = lang === 'ar' ? 'رجوع' : 'Back';

  return (
    <button
      onClick={() => navigate("/profile")}
      className="global-back-button small"
      aria-label="Go back to profile"
    >
      <FaArrowLeft className="back-icon" /> {label}
    </button>
  );
};

function App() {
  return (
    <Container fluid>
      <Row><GlobalBackButton /></Row>
      <Row><Header /></Row>
      <Row>
        <Routes>
          <Route path="/"             element={<Home/>} />
          <Route path="/register"     element={<Register/>} />
          <Route path="/login"        element={<Login/>} />
          <Route path="/content-feed" element={<ContentFeed />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password"  element={<ResetPass />} />
          <Route path="/about-us"     element={<AboutUs />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/report"       element={<Report />} />
          <Route path="/admin-dashboard" element={<AdminDash />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="/edit-profile" element={<Edit />} />
           <Route path="/recommendations" element={<RecommendationsPage />} />
           <Route path="/trending" element={<TrendsPage />} />
        </Routes>
      </Row>
      <Row><Footer/></Row>
    </Container>
  );
}

export default App;
