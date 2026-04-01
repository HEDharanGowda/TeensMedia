import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaPlusSquare,
  FaRegPlusSquare,
  FaHeart,
  FaRegHeart
} from 'react-icons/fa';
import './BottomNav.css';

const resolveAvatarSrc = (value) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  if (value.startsWith('data:')) return value;
  return `data:image/jpeg;base64,${value}`;
};

const BottomNav = ({ currentUser }) => {
  const avatarSrc = resolveAvatarSrc(currentUser?.profilePicture);

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <div className="bottom-nav__inner">
        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
          end
        >
          {({ isActive }) => (
            <span className="bottom-nav__icon-wrap">
              <FaHome size={24} />
            </span>
          )}
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          <span className="bottom-nav__icon-wrap">
            <FaSearch size={22} />
          </span>
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <span className="bottom-nav__icon-wrap">
              {isActive ? <FaPlusSquare size={24} /> : <FaRegPlusSquare size={24} />}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/activity"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <span className="bottom-nav__icon-wrap">
              {isActive ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`}
        >
          {({ isActive }) => (
            <span className={`bottom-nav__avatar ${isActive ? 'bottom-nav__avatar--active' : ''}`}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="bottom-nav__avatar-image" />
              ) : (
                <span>👤</span>
              )}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
