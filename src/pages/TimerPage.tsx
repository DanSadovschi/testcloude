import Timer from '../components/Timer';
import FavoritesList from '../components/FavoritesList';

export default function TimerPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4 dark:text-white">Timer</h1>
      <Timer />
      <FavoritesList />
    </div>
  );
}
