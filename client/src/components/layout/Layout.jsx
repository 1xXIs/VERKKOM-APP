import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar fijo a la izquierda */}
            <Sidebar />

            {/* Contenido principal se desplaza a la derecha */}
            <main className="flex-1 md:ml-20 lg:ml-64 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
