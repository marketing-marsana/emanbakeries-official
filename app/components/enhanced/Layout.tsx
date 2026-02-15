/**
 * ENHANCED REACT COMPONENTS - JISR STYLE
 * Premium HR 360 System - Layout & Navigation Components
 * 
 * Design Philosophy (Jisr-inspired):
 * - Clean, minimal aesthetic with ample whitespace
 * - Modern typography hierarchy
 * - Smooth animations and micro-interactions
 * - Professional color palette (dark blue/navy, clean whites)
 * - Accessible, intuitive navigation
 * - Premium enterprise feel
 */

import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Bell, Globe, User, LogOut, Settings } from 'lucide-react';

// ============================================================================
// COLOR PALETTE - Jisr-inspired
// ============================================================================
export const colors = {
    primary: '#1F2937', // Dark navy (main)
    secondary: '#6366F1', // Indigo (accents)
    accent: '#F59E0B', // Amber (highlights)
    background: '#F9FAFB', // Off-white
    surface: '#FFFFFF', // Pure white
    border: '#E5E7EB', // Light gray
    text: {
        primary: '#111827', // Dark gray
        secondary: '#6B7280', // Medium gray
        tertiary: '#9CA3AF', // Light gray
    },
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
    },
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================
interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    children?: NavItem[];
}

interface SidebarProps {
    navItems: NavItem[];
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose }) => {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpanded = (name: string) => {
        setExpandedItems((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const isActive = (href: string) => pathname?.startsWith(href) || false;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-200 
          z-40 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">HR</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">Eman360</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                    {navItems.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleExpanded(item.name)}
                                        className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg 
                      transition-all duration-200 font-medium text-sm
                      ${expandedItems.includes(item.name)
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="text-gray-400">{item.icon}</span>
                                            {item.name}
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${expandedItems.includes(item.name) ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>
                                    {expandedItems.includes(item.name) && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`
                            block px-4 py-2.5 rounded-lg text-sm transition-all
                            ${isActive(child.href)
                                                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                        }
                          `}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg 
                    transition-all duration-200 font-medium text-sm
                    ${isActive(item.href)
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <span>{item.icon}</span>
                                    <span className="flex-1">{item.name}</span>
                                    {item.badge && (
                                        <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </aside>
        </>
    );
};

// ============================================================================
// TOPBAR/HEADER COMPONENT
// ============================================================================
interface TopbarProps {
    onMenuClick: () => void;
    user?: { name: string; email: string; avatar?: string };
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, user }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-20">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="hidden md:flex items-center gap-4 flex-1">
                        <input
                            type="text"
                            placeholder="Search employees, documents..."
                            className="w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Notifications</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-sm font-medium text-gray-900">Payroll processed</p>
                                    <p className="text-xs text-gray-600 mt-1">Feb 15, 2024</p>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Language */}
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        EN
                    </button>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="hidden sm:inline text-sm text-gray-700 font-medium">{user?.name}</span>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-600">{user?.email}</p>
                                </div>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Profile
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <div className="border-t border-gray-100 my-2" />
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// LAYOUT WRAPPER
// ============================================================================
interface LayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    user?: { name: string; email: string };
}

export const Layout: React.FC<LayoutProps> = ({ children, navItems, user }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
            <div className="flex pt-20">
                <Sidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 lg:ml-0">
                    <div className="p-8 max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
};

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    actions,
    breadcrumbs,
}) => {
    return (
        <div className="mb-8">
            {breadcrumbs && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {crumb.href ? (
                                <Link href={crumb.href} className="text-indigo-600 hover:text-indigo-700">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900">{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && <span className="text-gray-400">/</span>}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                    {description && <p className="text-gray-600">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </div>
    );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================
interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    border?: boolean;
    shadow?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    border = true,
    shadow = 'sm',
}) => {
    const shadowClass = {
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    }[shadow];

    return (
        <div
            className={`
        bg-white rounded-lg p-6
        ${border ? 'border border-gray-200' : ''}
        ${shadowClass}
        ${hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-300' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================
interface KPICardProps {
    label: string;
    value: string | number;
    change?: { value: number; isPositive: boolean };
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({
    label,
    value,
    change,
    icon,
    color = 'blue',
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        red: 'bg-red-50 text-red-700',
        purple: 'bg-purple-50 text-purple-700',
    };

    return (
        <Card hover border>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                    {change && (
                        <div
                            className={`text-xs font-semibold ${change.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}% this month
                        </div>
                    )}
                </div>
                {icon && <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>}
            </div>
        </Card>
    );
};

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    children,
    className = '',
    ...props
}) => {
    const baseClass = 'font-semibold transition-all duration-200 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary:
            'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg',
        secondary:
            'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 border border-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
        ghost:
            'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading && <span className="animate-spin">⚙️</span>}
            {icon}
            {children}
        </button>
    );
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helpText,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                <input
                    className={`
            w-full px-4 py-2.5 rounded-lg border transition-all
            ${icon ? 'pl-10' : ''}
            ${error
                            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                            : 'border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400'
                        }
            focus:outline-none text-gray-900 placeholder-gray-400
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </div>
    );
};

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
interface BadgeProps {
    status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    label: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'md' }) => {
    const statusClasses = {
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold border ${statusClasses[status]} ${sizeClasses[size]}`}
        >
            {label}
        </span>
    );
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} relative z-10 max-h-screen overflow-y-auto`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">{children}</div>

                    {/* Footer */}
                    {footer && (
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default {
    colors,
    Layout,
    Sidebar,
    Topbar,
    PageHeader,
    Card,
    KPICard,
    Button,
    Input,
    Badge,
    Modal,
};
