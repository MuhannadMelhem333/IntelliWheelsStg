'use client';

import { useState } from 'react';
import type { DealerDetail } from '@/lib/types';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';

interface DealerDetailModalProps {
    dealer: DealerDetail;
    onClose: () => void;
    theme?: 'light' | 'dark';
}

export function DealerDetailModal({ dealer, onClose, theme = 'light' }: DealerDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'contact'>('overview');
    const [selectedImage, setSelectedImage] = useState(0);

    const showroomImages = dealer.showroom_images || [];
    const hasShowroom = showroomImages.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-slideUp ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
                {/* Header */}
                <div className={`sticky top-0 z-20 border-b backdrop-blur-sm px-6 py-4 ${theme === 'dark' ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-white/95'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{dealer.name}</h2>
                                {dealer.verified && (
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>
                            {dealer.location && (
                                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>📍 {dealer.location}</p>
                            )}
                        </div>

                        {dealer.rating && (
                            <div className="flex items-center gap-2 mr-4">
                                <svg className="h-6 w-6 fill-amber-400" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <div>
                                    <div className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{dealer.rating.toFixed(1)}</div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{dealer.reviews_count || 0} reviews</div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            title="Close"
                            variant="ghost"
                            resolvedTheme={theme}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className={`mt-4 flex gap-1 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                        {[
                            { id: 'overview', label: 'Overview', icon: '📋' },
                            { id: 'inventory', label: `Inventory (${dealer.cars?.length || 0})`, icon: '🚗' },
                            { id: 'contact', label: 'Contact', icon: '📞' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Showroom Gallery */}
                            {hasShowroom && (
                                <div>
                                    <h3 className={`mb-3 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Showroom Gallery</h3>
                                    <div className="space-y-3">
                                        <div className="relative overflow-hidden rounded-2xl">
                                            <img
                                                src={showroomImages[selectedImage]}
                                                alt={`Showroom ${selectedImage + 1}`}
                                                className="h-96 w-full object-cover"
                                            />
                                        </div>
                                        {showroomImages.length > 1 && (
                                            <div className="grid grid-cols-6 gap-2">
                                                {showroomImages.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedImage(idx)}
                                                        className={`overflow-hidden rounded-lg transition-all ${selectedImage === idx
                                                            ? 'ring-2 ring-indigo-600 ring-offset-2'
                                                            : 'opacity-60 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-16 w-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* About */}
                            {dealer.description && (
                                <div>
                                    <h3 className={`mb-3 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>About</h3>
                                    <p className={`leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{dealer.description}</p>
                                </div>
                            )}

                            {/* Business Hours */}
                            {dealer.business_hours && Object.keys(dealer.business_hours).length > 0 && (
                                <div>
                                    <h3 className={`mb-3 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Business Hours</h3>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {Object.entries(dealer.business_hours).map(([day, hours]) => (
                                            <div key={day} className={`flex justify-between rounded-lg px-4 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                <span className={`font-medium capitalize ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{day}</span>
                                                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{hours as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div>
                            {dealer.cars && dealer.cars.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {dealer.cars.map((car) => (
                                        <div key={car.id} className={`group overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={car.image || '/placeholder-car.png'}
                                                    alt={car.model}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {car.make} {car.model}
                                                </h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{car.year}</p>
                                                <p className="mt-2 text-xl font-bold text-indigo-600">
                                                    {car.price?.toLocaleString()} {car.currency || 'JOD'}
                                                </p>
                                                <Button
                                                    className="mt-3 w-full font-semibold transition-colors hover:bg-indigo-700 bg-indigo-600"
                                                    resolvedTheme={theme}
                                                    variant="primary"
                                                    style={{ backgroundColor: '#4f46e5' }} // Indigo-600
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                                    <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className={`mt-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No vehicles available at this time</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Contact Information</h3>

                                {dealer.contact_email && (
                                    <a
                                        href={`mailto:${dealer.contact_email}`}
                                        className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="rounded-full bg-indigo-100 p-3">
                                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</div>
                                            <div className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{dealer.contact_email}</div>
                                        </div>
                                    </a>
                                )}

                                {dealer.contact_phone && (
                                    <a
                                        href={`tel:${dealer.contact_phone}`}
                                        className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="rounded-full bg-emerald-100 p-3">
                                            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</div>
                                            <div className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{dealer.contact_phone}</div>
                                        </div>
                                    </a>
                                )}
                            </div>

                            <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
                                <h3 className={`mb-4 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Send a Message</h3>
                                <form className="space-y-3">
                                    <Input
                                        type="text"
                                        placeholder="Your Name"
                                        resolvedTheme={theme}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Your Email"
                                        resolvedTheme={theme}
                                    />
                                    <Textarea
                                        placeholder="Your Message"
                                        rows={4}
                                        resolvedTheme={theme}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full font-semibold transition-colors hover:bg-indigo-700 bg-indigo-600"
                                        resolvedTheme={theme}
                                        variant="primary"
                                        style={{ backgroundColor: '#4f46e5' }} // Indigo-600
                                    >
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
