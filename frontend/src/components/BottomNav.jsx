import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaPlusSquare,
  FaRegPlusSquare,
  FaHeart,
  FaRegHeart,
  FaUser,
  FaRegUser
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import './BottomNav.css';

const Motion = motion;

const resolveAvatarSrc = (value) => {
  if (!value) return null;
  return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
};

const BottomNav = ({ currentUser }) => {
  const avatarSrc = resolveAvatarSrc(currentUser?.profilePicture);

  return (
    <Motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bottom-nav"
    >
      <div className="bottom-nav__inner">
        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
          end
        >
          {({ isActive }) => (
            <Motion.div whileTap={{ scale: 0.9 }}>
              <FaHome size={24} />
            </Motion.div>
          )}
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          <Motion.div whileTap={{ scale: 0.9 }}>
            <FaSearch size={22} />
          </Motion.div>
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <Motion.div whileTap={{ scale: 0.9 }}>
              {isActive ? <FaPlusSquare size={24} /> : <FaRegPlusSquare size={24} />}
            </Motion.div>
          )}
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <Motion.div whileTap={{ scale: 0.9 }}>
              {isActive ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
            </Motion.div>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <Motion.div whileTap={{ scale: 0.9 }} className={`bottom-nav__avatar ${isActive ? 'bottom-nav__avatar--active' : ''}`}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="bottom-nav__avatar-image" />
              ) : (
                <span>👤</span>
              )}
            </Motion.div>
          )}
        </NavLink>
      </div>
    </Motion.nav>
  );
};

export default BottomNav;
