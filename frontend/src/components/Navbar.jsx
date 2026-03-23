
import { Link } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaSignOutAlt, FaUser, FaComment } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Navbar.css';

const Motion = motion;

const Navbar = ({ onLogout }) => {
  return (
    <Motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="navbar"
    >
      <div className="navbar__inner">
        <Motion.div whileHover={{ scale: 1.05 }} className="navbar__brand">
          TeenMedia
        </Motion.div>

        <div className="navbar__actions">
          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="navbar__link" aria-label="Go to feed">
              <FaHome size={24} />
            </Link>
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/create" className="navbar__link" aria-label="Create a post">
              <FaPlusCircle size={24} />
            </Link>
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/messages" className="navbar__link" aria-label="Messages">
              <FaComment size={24} />
            </Link>
          </Motion.div>

          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/profile" className="navbar__link" aria-label="View profile">
              <FaUser size={24} />
            </Link>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="navbar__logout"
            role="button"
            aria-label="Sign out"
          >
            <FaSignOutAlt size={24} />
          </Motion.div>
        </div>
      </div>
    </Motion.nav>
  );
};

export default Navbar;