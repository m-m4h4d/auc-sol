import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useNow } from '../../utils';
import PriceBoard from '../PriceBoard/PriceBoard';
import LotRow from '../LotRow/LotRow';
import './Home.css';

const Home = () => {
  const [auctions, setAuctions] = useState(null);
  const [error, setError] = useState(null);
  const now = useNow();

  useEffect(() => {
    api('/auctions')
      .then(setAuctions)
      .catch((err) => setError(err.message));
  }, []);

  const live = (auctions || []).filter((a) => a.endsAt > now).sort((a, b) => a.endsAt - b.endsAt);
  const [featured, ...others] = live;

  let hero;
  if (error) {
    hero = <div className="hero-empty"><p className="error">Couldn't load auctions: {error}</p></div>;
  } else if (!auctions) {
    hero = <div className="hero-empty hero-loading" aria-busy="true" />;
  } else if (!featured) {
    hero = (
      <div className="hero-empty">
        <h1>No live auctions right now.</h1>
        <p>List an item and it shows up here for everyone to bid on.</p>
        <Link to="/create-auction" className="btn btn-paddle">List an item</Link>
      </div>
    );
  } else {
    hero = (
      <PriceBoard
        auction={featured}
        now={now}
        heading={
          <div className="hero-heading">
            <p className="hero-kicker">Ending soonest</p>
            <h1>
              <Link to={`/auction/${featured.id}`}>{featured.title}</Link>
            </h1>
            <p className="hero-seller">Listed by {featured.seller}</p>
          </div>
        }
      >
        <Link to={`/auction/${featured.id}`} className="btn btn-paddle">Bid on this item</Link>
      </PriceBoard>
    );
  }

  return (
    <div className="home page">
      <div className="home-hero">{hero}</div>

      <div className="home-columns">
        <section className="home-live" aria-labelledby="live-heading">
          <div className="section-header">
            <h2 id="live-heading">Also live</h2>
            <Link to="/auctions">See all auctions</Link>
          </div>
          {others.length === 0 ? (
            <p className="home-quiet">Nothing else is live yet.</p>
          ) : (
            others.slice(0, 6).map((auction) => <LotRow key={auction.id} auction={auction} now={now} />)
          )}
        </section>

        <aside className="home-sell" aria-labelledby="sell-heading">
          <h2 id="sell-heading">Have something to sell?</h2>
          <ol>
            <li>List your item with a starting price and a deadline.</li>
            <li>Other people bid. Each new bid has to beat the last one.</li>
            <li>When time runs out, the highest bid wins.</li>
          </ol>
          <Link to="/create-auction" className="btn btn-primary">List an item</Link>
        </aside>
      </div>
    </div>
  );
};

export default Home;
