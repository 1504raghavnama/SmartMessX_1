import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log detailed information for debugging
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    console.error("Full location object:", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-2 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-4 text-sm text-muted-foreground">Requested path: {location.pathname}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
