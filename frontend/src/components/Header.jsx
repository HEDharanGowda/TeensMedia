import { Link } from 'react-router-dom';
import { FaRegHeart, FaRegPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Header.css';

const Motion = motion;

const Header = () => {
  return (
    <Motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="header"
    >
      <div className="header__inner">
        <Motion.div whileHover={{ scale: 1.02 }} className="header__brand">
          TeenMedia
        </Motion.div>

        <div className="header__actions">
          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <button className="header__icon-btn" aria-label="Notifications">
              <FaRegHeart size={22} />
            </button>
          </Motion.div>
          <Motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/messages" className="header__icon-btn" aria-label="Messages">
              <FaRegPaperPlane size={22} />
            </Link>
          </Motion.div>
        </div>
      </div>
    </Motion.header>
  );
};

export default Header;
