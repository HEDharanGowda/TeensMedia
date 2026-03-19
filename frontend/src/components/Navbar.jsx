
import { Link } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="navbar"
    >
      <div className="navbar__inner">
        <motion.div whileHover={{ scale: 1.05 }} className="navbar__brand">
          TeenMedia
        </motion.div>

        <div className="navbar__actions">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="navbar__link" aria-label="Go to feed">
              <FaHome size={24} />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/create" className="navbar__link" aria-label="Create a post">
              <FaPlusCircle size={24} />
            </Link>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="navbar__logout"
            role="button"
            aria-label="Sign out"
          >
            <FaSignOutAlt size={24} />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;