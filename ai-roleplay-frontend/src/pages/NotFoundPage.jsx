import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div>
      <h2>页面未找到</h2>
      <p>返回 <Link to="/">首页</Link></p>
    </div>
  );
}


