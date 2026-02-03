import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Headset, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a utils file, if not I'll inline standard tailwind-merge logic or create it.

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { title: 'Agenda Diaria', icon: Calendar, path: '/agenda' },
        { title: 'Actividades Soporte', icon: Headset, path: '/soporte' },
        { title: 'Configuración', icon: Settings, path: '/config' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-40
                ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full py-6 px-3">
                    {/* Logo Area */}
                    <div className="mb-10 flex items-center justify-center">
                        <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-opacity duration-300 ${!isOpen && 'md:hidden'}`}>
                            VERKKOM
                        </h1>
                        {/* Icono Solo para minified sidebar */}
                        <div className={`text-2xl font-bold text-primary ${isOpen ? 'hidden' : 'hidden md:block'}`}>
                            V
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-2 flex-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }
                                    `}
                                >
                                    <Icon size={22} className={`${isActive ? 'text-primary-foreground' : 'text-foreground/70 group-hover:text-primary'} transition-colors`} />
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && 'md:hidden'}`}>
                                        {item.title}
                                    </span>

                                    {/* Tooltip for minified sidebar */}
                                    {!isOpen && (
                                        <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none shadow-md z-50 whitespace-nowrap">
                                            {item.title}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="mt-auto border-t border-border pt-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                A
                            </div>
                            <div className={`transition-all duration-300 ${!isOpen && 'md:hidden'}`}>
                                <p className="text-sm font-semibold text-foreground">Admin</p>
                                <p className="text-xs text-muted-foreground">admin@verkkom.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
