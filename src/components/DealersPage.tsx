'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Dealer, DealerDetail, DealerRegistration } from '@/lib/types';
import { fetchDealers, fetchDealerById, registerDealer, getDealerProfile } from '@/lib/api';
import { DealerMap } from './DealerMap';
import { DealerCard } from './DealerCard';
import { DealerDetailModal } from './DealerDetailModal';
import { DealerRegistrationWizard } from './DealerRegistrationWizard';
import { Input } from './Input';
import { Button } from './Button';
import { Select } from './Select';

interface DealersPageProps {
    token: string | null;
    user: any;
    theme: 'light' | 'dark';
    onShowToast: (message: string, type: 'success' | 'error') => void;
}

export function DealersPage({ token, user, theme, onShowToast }: DealersPageProps) {
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const resolvedTheme = theme;
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedDealer, setSelectedDealer] = useState<DealerDetail | null>(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [dealerProfile, setDealerProfile] = useState<Dealer | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');

    // Load dealers on mount
    useEffect(() => {
        loadDealers();
        requestUserLocation();
        if (user) {
            loadDealerProfile();
        }
    }, [user]);

    const requestUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log('Geolocation not available');
                }
            );
        }
    };

    const loadDealers = async () => {
        try {
            setLoading(true);
            console.log('Loading dealers...');
            const lat = userLocation?.lat;
            const lng = userLocation?.lng;

            // Don't pass token - it's a public endpoint
            const response = await fetchDealers(lat, lng, 100);
            console.log('Dealers response:', response);

            if (response.success) {
                setDealers(response.dealers || []);
                console.log(`Loaded ${response.dealers?.length || 0} dealers`);
            } else {
                console.error('Failed to load dealers - success: false');
            }
        } catch (error) {
            console.error('Failed to load dealers:', error);
            onShowToast('Failed to load dealers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadDealerProfile = async () => {
        try {
            const response = await getDealerProfile(token);
            if (response.success) {
                setDealerProfile(response.dealer);
            }
        } catch (error) {
            setDealerProfile(null);
        }
    };

    const handleDealerClick = async (dealer: Dealer) => {
        try {
            const response = await fetchDealerById(dealer.id, token);
            if (response.success) {
                setSelectedDealer(response.dealer);
            }
        } catch (error) {
            onShowToast('Failed to load dealer details', 'error');
        }
    };

    const handleRegisterDealer = async (data: DealerRegistration) => {
        try {
            const response = await registerDealer(data, token);
            if (response.success) {
                onShowToast(response.message || 'Registration submitted successfully!', 'success');
                setShowRegistration(false);
                loadDealerProfile();
            }
        } catch (error: any) {
            onShowToast(error.message || 'Registration failed', 'error');
            throw error;
        }
    };

    // Filter and sort dealers
    const filteredDealers = useMemo(() => {
        let result = [...dealers];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (d) =>
                    d.name.toLowerCase().includes(query) ||
                    d.location?.toLowerCase().includes(query) ||
                    d.description?.toLowerCase().includes(query)
            );
        }

        // Verified filter
        if (filterVerified !== null) {
            result = result.filter((d) => d.verified === filterVerified);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    return (a.distance || 999) - (b.distance || 999);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return result;
    }, [dealers, searchQuery, filterVerified, sortBy]);

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 rounded-3xl bg-slate-200" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-96 rounded-3xl bg-slate-200" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header with gradient matching website theme */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold">Find Your Perfect Dealer</h1>
                        <p className="mt-2 text-lg text-slate-300">
                            Connect with verified car dealers near you
                        </p>

                        {/* Search Bar */}
                        <div className="mt-6 flex gap-3">
                            <div className="relative flex-1">
                                <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search dealers by name or location..."
                                    resolvedTheme={resolvedTheme}
                                    className="pl-12"
                                />
                            </div>

                            {!dealerProfile && user && (
                                <Button
                                    onClick={() => setShowRegistration(true)}
                                    className="font-semibold shadow-lg transition-all hover:scale-105"
                                    variant="primary"
                                    resolvedTheme={resolvedTheme}
                                >
                                    Register as Dealer
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        {/* Verified Filter */}
                        <Button
                            onClick={() => setFilterVerified(filterVerified === true ? null : true)}
                            variant={filterVerified === true ? 'primary' : 'outline'}
                            className="text-sm font-semibold transition-all"
                            resolvedTheme={resolvedTheme}
                            style={filterVerified === true ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
                        >
                            ✓ Verified Only
                        </Button>

                        {/* Sort Dropdown */}
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            resolvedTheme={resolvedTheme}
                            className="text-sm font-semibold"
                        >
                            <option value="distance">Sort by Distance</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="name">Sort by Name</option>
                        </Select>

                        {/* Clear Filters */}
                        {(searchQuery || filterVerified !== null) && (
                            <Button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterVerified(null);
                                }}
                                className="text-sm font-semibold hover:bg-slate-50"
                                variant="outline"
                                resolvedTheme={resolvedTheme}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className={`flex rounded-xl border ${resolvedTheme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white'} p-1 shadow-sm`}>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${viewMode === 'map' ? `${resolvedTheme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}` : `${resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Map
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${viewMode === 'list' ? `${resolvedTheme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}` : `${resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            List
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredDealers.length}</span> dealer{filteredDealers.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>

                {/* Map View */}
                {viewMode === 'map' && (
                    <div className={`relative h-[600px] overflow-hidden rounded-3xl border shadow-xl z-0 lg:h-[800px] ${resolvedTheme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        {filteredDealers.length > 0 ? (
                            <DealerMap
                                dealers={filteredDealers}
                                onDealerClick={handleDealerClick}
                                userLocation={userLocation}
                                theme={resolvedTheme as 'light' | 'dark'}
                                className="h-[600px]"
                            />
                        ) : (
                            <div className={`flex h-[600px] items-center justify-center ${resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <div className="text-center">
                                    <svg className={`mx-auto h-16 w-16 ${resolvedTheme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className={`mt-4 text-lg font-semibold ${resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>No dealers found</p>
                                    <p className={`mt-1 text-sm ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your filters</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <>
                        {filteredDealers.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredDealers.map((dealer) => (
                                    <DealerCard
                                        key={dealer.id}
                                        dealer={dealer}
                                        onClick={() => handleDealerClick(dealer)}
                                        resolvedTheme={resolvedTheme}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={`rounded-3xl border-2 border-dashed p-16 text-center ${resolvedTheme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                                <svg className={`mx-auto h-20 w-20 ${resolvedTheme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className={`mt-4 text-xl font-semibold ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>No dealers found</h3>
                                <p className="mt-2 text-slate-500">
                                    {searchQuery
                                        ? `No dealers match your search "${searchQuery}"`
                                        : 'No dealers available in your area'}
                                </p>
                                {(searchQuery || filterVerified !== null) && (
                                    <Button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterVerified(null);
                                        }}
                                        className="mt-4 px-6 py-2 font-semibold"
                                        variant="primary"
                                        resolvedTheme={resolvedTheme}
                                        style={{ backgroundColor: '#4f46e5' }} // Indigo-600
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedDealer && (
                <DealerDetailModal
                    dealer={selectedDealer}
                    onClose={() => setSelectedDealer(null)}
                    theme={theme}
                />
            )}

            {showRegistration && (
                <DealerRegistrationWizard
                    onSubmit={handleRegisterDealer}
                    onCancel={() => setShowRegistration(false)}
                    initialEmail={user?.email}
                    theme={resolvedTheme}
                />
            )}
        </>
    );
}
