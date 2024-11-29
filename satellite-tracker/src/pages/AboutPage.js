import React from 'react';
import './styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1>About Us</h1>
      
      <section className="about-section">
        <h2>What do we do on this website?</h2>
        <p>
          This website is a platform dedicated to satellite tracking through sky observation. We use the n2yo API to build an interactive application where users can see visual passes of satellites in the sky while learning about location data and space tracking technology.
        </p>
      </section>

      <section className="non-profit">
        <h2>A Non-Profit Entity</h2>
        <p>
          This project is entirely non-profit. Our mission is to provide an educational tool that allows users to learn more about space and the technology behind satellite tracking, with no commercial intent. All efforts are focused on learning and the love of science.
        </p>
      </section>

      <section className="motivation">
        <h2>Motivation and Passion</h2>
        <p>
          The project started as an initiative to learn how React and JavaScript work, as well as to explore the possibilities of modern web development. But beyond the technical aspect, the project is inspired by our passion for looking at the stars at night and observing the sky. We love astronomy and want to share this passion with everyone, allowing people to view and track satellites passing over their cities.
        </p>
      </section>

      <section className="call-to-action">
        <p>
          We invite you to explore our app, track satellites, and learn more about space. Thank you for being a part of this educational adventure with us!
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
