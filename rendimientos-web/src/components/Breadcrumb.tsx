import { useLocation, Link } from 'react-router-dom';

export function Breadcrumb() {
  const location = useLocation();
  
  // No mostrar breadcrumb en login
  if (location.pathname === '/login') {
    return null;
  }

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      { name: 'Inicio', path: '/app', icon: '🏠' }
    ];

    if (pathSegments.includes('admin')) {
      items.push({ name: 'Administración', path: '/admin', icon: '⚙️' });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex px-8 py-4 bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.path} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-6 h-6 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              )}
              
              {isLast ? (
                <span className="inline-flex items-center text-sm font-medium text-gray-500">
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
