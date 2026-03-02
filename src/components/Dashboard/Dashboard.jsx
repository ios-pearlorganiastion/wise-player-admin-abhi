import React from 'react';
import { Container, Row, Col, Badge, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiStar, FiActivity } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const subscriptions = [
    { id: 1, user: "Rahul Kumar", item: "Mirzapur S3", price: "₹499", status: "Paid", date: "Oct 12", img: "https://m.media-amazon.com/images/M/MV5BN2NlNGYwYTgtOTYxOS00YjVlLTliMDgtOTZkM2I3YzE1Y2E4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg" },
    { id: 2, user: "Amit Shah", item: "Jawan Movie", price: "₹199", status: "Pending", date: "Oct 10", img: "https://m.media-amazon.com/images/M/MV5BNDJjNWFlYzMtODljTA00YzE5LTgzYmEtZDhjY2RmN2EwN2M2XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg" },
    { id: 3, user: "Sania Mirza", item: "Netflix Premium", price: "₹799", status: "Paid", date: "Oct 08", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A7e_J9_GfXz3N6mYvX7uD8Kx2_B9qXhF-A&s" },
    { id: 4, user: "Vijay Dev", item: "Animal Movie", price: "₹250", status: "Paid", date: "Oct 05", img: "https://m.media-amazon.com/images/M/MV5BNGViM2M4NmUtMmNkNy00MTQ5LTk5MDYtNmNhODAzODkwOTJlXkEyXkFqcGdeQXVyMTY1NjAyMzcx._V1_.jpg" },
  ];

  const stats = [
    { title: "Total Users", value: "1,250", icon: <FiUsers />, color: "n-red", shadow: "rgba(229, 9, 20, 0.4)" },
    { title: "Net Revenue", value: "₹45,000", icon: <FiDollarSign />, color: "n-blue", shadow: "rgba(0, 212, 255, 0.4)" },
    { title: "Active Now", value: "840", icon: <FiActivity />, color: "n-green", shadow: "rgba(57, 255, 20, 0.4)" },
    { title: "Rating", value: "4.8/5", icon: <FiStar />, color: "n-yellow", shadow: "rgba(255, 215, 0, 0.4)" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="glass-sidebar">
        <div className="logo-box">WP</div>
        <nav className="nav-links">
          <div className="nav-item active"><FiPlay /></div>
          <div className="nav-item"><FiUsers /></div>
          <div className="nav-item"><FiDollarSign /></div>
          <div className="nav-item"><FiTrendingUp /></div>
        </nav>
      </div>

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Admin <span className="highlight">Dashboard</span></h1>
            <p>Real-time analytics & subscriptions</p>
          </div>
          <div className="profile-section">
            <div className="notif-bell"><FiActivity /></div>
            <Image src="https://i.pravatar.cc/150?u=admin" roundedCircle className="admin-avatar" />
          </div>
        </header>

        {/* Stats Grid */}
        <Row className="g-4 mb-5">
          {stats.map((stat, i) => (
            <Col key={i} lg={3} md={6}>
              <motion.div 
                whileHover={{ y: -10 }}
                className={`stat-card-new ${stat.color}`}
                style={{ boxShadow: `0 10px 30px ${stat.shadow}` }}
              >
                <div className="stat-info">
                  <span className="stat-label">{stat.title}</span>
                  <h2 className="stat-number">{stat.value}</h2>
                </div>
                <div className="stat-icon-box">{stat.icon}</div>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Table Section */}
        <div className="recent-section">
          <h3 className="section-title">Recent Subscriptions</h3>
          <div className="custom-table-wrapper">
            <div className="table-header-row">
              <div className="th-cell">CONTENT</div>
              <div className="th-cell">USER</div>
              <div className="th-cell">PRICE</div>
              <div className="th-cell">DATE</div>
              <div className="th-cell text-center">STATUS</div>
            </div>

            {subscriptions.map((sub, index) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="table-data-row"
              >
                <div className="td-cell">
                  <div className="movie-info">
                    <img src={sub.img} alt="poster" className="mini-poster" />
                    <span>{sub.item}</span>
                  </div>
                </div>
                <div className="td-cell">{sub.user}</div>
                <div className="td-cell fw-bold">{sub.price}</div>
                <div className="td-cell text-muted">{sub.date}</div>
                <div className="td-cell text-center">
                  <Badge className={`status-pill ${sub.status.toLowerCase()}`}>
                    {sub.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;