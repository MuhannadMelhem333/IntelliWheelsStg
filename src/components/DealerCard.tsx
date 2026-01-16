'use client';

import type { Dealer } from '@/lib/types';
import { Button } from './Button';

interface DealerCardProps {
    dealer: Dealer;
    onClick: () => void;
    className?: string;
    resolvedTheme?: string;
}

export function DealerCard({ dealer, onClick, className = '', resolvedTheme }: DealerCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${resolvedTheme === 'dark'
                ? 'border-slate-700 bg-slate-800'
                : 'border-slate-200 bg-white'
                } ${className}`}
        >
            {/* Dealer Image */}
            {dealer.image_url && (
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                        src={dealer.image_url}
                        alt={dealer.name}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {dealer.verified && (
                        <div className="absolute top-3 right-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                            ✓ Verified
                        </div>
                    )}
                </div>
            )}

            {/* Dealer Info */}
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold transition-colors group-hover:text-indigo-600 ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {dealer.name}
                        </h3>
                        {!dealer.image_url && dealer.verified && (
                            <span className="mt-1 inline-block text-xs font-semibold text-emerald-600">
                                ✓ Verified Dealer
                            </span>
                        )}
                    </div>

                    {dealer.rating && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                                <svg className="h-5 w-5 fill-amber-400" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className={`text-lg font-bold ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{dealer.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-slate-500">{dealer.reviews_count || 0} reviews</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {dealer.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{dealer.location}</span>
                    </div>
                )}

                {/* Distance */}
                {dealer.distance && (
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {dealer.distance.toFixed(1)} km away
                        </div>
                    </div>
                )}

                {/* Description Preview */}
                {dealer.description && (
                    <p className="line-clamp-2 text-sm text-slate-600">
                        {dealer.description}
                    </p>
                )}

                {/* View Details Button */}
                <Button
                    className="mt-4 w-full font-semibold transition-colors hover:bg-indigo-700 bg-indigo-600"
                    resolvedTheme={resolvedTheme}
                    variant="primary"
                    style={{ backgroundColor: '#4f46e5' }} // Indigo-600
                >
                    View Details →
                </Button>
            </div>
        </div>
    );
}
