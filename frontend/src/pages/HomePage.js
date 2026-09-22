import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <main>
    <h1>AppealFinder</h1>
    <p>Upload a photo of an outfit and find similar clothing items to buy.</p>
    <p>
      <Link to="/login">Log in</Link> | <Link to="/register">Register</Link>
    </p>
  </main>
);

export default HomePage;
