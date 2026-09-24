import { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { useTripStore } from './store';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TripView } from './components/TripView';
import { SharedTripView } from './components/SharedTripView';

function App() {
  const { loadTrips } = useTripStore();

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/trip/:id" component={TripView} />
      <Route path="/shared" component={SharedTripView} />
      {/* 404 Fallback */}
      <Route>
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-50 font-sans p-6 text-center">
          <h1 className="text-8xl md:text-9xl font-bold font-display tracking-tighter mb-6 text-white/20">404</h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Destination Unknown</h2>
          <p className="text-zinc-400 max-w-md mb-8">The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.</p>
          <a href="/" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-[0.98] transition-transform">
            Return Home
          </a>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
