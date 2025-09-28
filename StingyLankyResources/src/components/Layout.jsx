import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 container mx-auto px-4 py-6">
        <Sidebar />
        <main className="flex-1 lg:pl-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;