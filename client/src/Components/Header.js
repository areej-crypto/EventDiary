import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import logo from '../Images/eventLogo.png';
import { performLogout } from '../Features/UserSlice';
import { TiMessages } from 'react-icons/ti';
import { FaRegUser } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { MdLogout } from 'react-icons/md';

const T = {
  en: {
    aboutUs:       'About Us',
    register:      'Register',
    login:         'Login',
    profile:       'Profile',
    communication: 'Communication',
    report:        'Report',
    logout:        'Logout',
  },
  ar: {
    aboutUs:       'من نحن',
    register:      'تسجيل',
    login:         'تسجيل الدخول',
    profile:       'الملف الشخصي',
    communication: 'الرسائل',
    report:        'التقارير',
    logout:        'تسجيل الخروج',
  }
};

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [lang, setLang] = useState(localStorage.getItem('profileLang') || 'en');
  const location = useLocation();

  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'profileLang') setLang(e.newValue || 'en');
    };
    const onLangChange = () => setLang(localStorage.getItem('profileLang') || 'en');
    window.addEventListener('storage', onStorage);
    window.addEventListener('languagechange', onLangChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('languagechange', onLangChange);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(performLogout()).unwrap();
    navigate('/');
  };

  const logoLink = user
    ? (user.role === 'admin' ? '/admin-dashboard' : '/content-feed')
    : '/';

  const reportLink = '/report';

  const publicRoutes = ['/', '/about-us', '/register', '/login'];
  const isAdmin = user?.role === 'admin';

  return (
    <Navbar className="navbar-custom" light expand="md">
      <NavbarBrand tag={Link} to={logoLink}>
        <img src={logo} alt="Event Diary Logo" className="navbar-logo" />
      </NavbarBrand>

      {publicRoutes.includes(location.pathname) ? (
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink tag={Link} to="/about-us">{T[lang].aboutUs}</NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/register">{T[lang].register}</NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/login">{T[lang].login}</NavLink>
          </NavItem>
        </Nav>
      ) : user ? (
        <Nav className="ml-auto" navbar>
          {!isAdmin && (
            <>
              <NavItem>
                <NavLink tag={Link} to="/profile">
                  <FaRegUser className="icon" /> {T[lang].profile}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/communication">
                  <TiMessages className="icon" /> {T[lang].communication}
                </NavLink>
              </NavItem>
            </>
          )}
          <NavItem>
            <NavLink tag={Link} to={reportLink}>
              <IoNotificationsOutline className="icon" /> {T[lang].report}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <MdLogout className="icon" /> {T[lang].logout}
            </NavLink>
          </NavItem>
        </Nav>
      ) : null}
    </Navbar>
  );
};

export default Header;
