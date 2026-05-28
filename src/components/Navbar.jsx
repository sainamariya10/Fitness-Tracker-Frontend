import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>

       <div>
        <Link to="/dash" style={styles.link}>
         {/* 🌟 വലിയ Dashboard എന്നതിന് പകരം ത്രീ-ഡോട്ട് ബട്ടൺ */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          style={styles.threeDotBtn}>
          ⋮
        </button>
        </Link>
        </div>
      <h2 style={styles.logo}>Fitness Tracker</h2>

      <div style={styles.links}>
        <Link to="/home" style={styles.link}>
          Home
        </Link>
        <Link to="/admin" style={styles.link}>
          Admin
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#222",
  },

  threeDotBtn: {
    background: 'none',
    border: 'none',
    color: '#fffefe',
    fontSize: '35px', // മൂന്ന് കുത്തുകൾ വലുതായി കാണാൻ
    cursor: 'pointer',
    padding: '8px',
    outline: 'none',
    fontWeight: 'bold'
  },

  logo: {
    color: "white",
  },

  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
  },

};

export default Navbar;