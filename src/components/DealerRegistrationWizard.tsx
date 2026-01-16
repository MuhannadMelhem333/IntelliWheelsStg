'use client';

import { useState } from 'react';
import type { DealerRegistration } from '@/lib/types';
import { Input } from './Input';
import { Textarea } from './Textarea';

interface DealerRegistrationWizardProps {
    onSubmit: (data: DealerRegistration) => Promise<void>;
    onCancel: () => void;
    initialEmail?: string;
    theme?: 'light' | 'dark';
}

export function DealerRegistrationWizard({ onSubmit, onCancel, initialEmail = '', theme }: DealerRegistrationWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<DealerRegistration>({
        name: '',
        location: '',
        contact_email: initialEmail,
        contact_phone: '',
        description: '',
        showroom_images: [],
        business_hours: {},
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof DealerRegistration, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

            <div className={`relative z-10 w-full max-w-2xl rounded-3xl shadow-2xl animate-slideUp ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Progress Bar */}
                <div className="px-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Register as Dealer</h2>
                        <button onClick={onCancel} className={`rounded-full p-2 hover:bg-slate-100 hover:text-slate-600 ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400'}`}>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Step {step} of {totalSteps}</p>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Basic Information</h3>

                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Business Name *</label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="e.g., Premium Motors"
                                    required
                                    resolvedTheme={theme!}
                                />
                            </div>

                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Location *</label>
                                <Input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => updateField('location', e.target.value)}
                                    placeholder="City, Country"
                                    required
                                    resolvedTheme={theme!}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={`mb-1 block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Email *</label>
                                    <Input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => updateField('contact_email', e.target.value)}
                                        required
                                        resolvedTheme={theme!}
                                    />
                                </div>

                                <div>
                                    <label className={`mb-1 block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Phone *</label>
                                    <Input
                                        type="tel"
                                        value={formData.contact_phone}
                                        onChange={(e) => updateField('contact_phone', e.target.value)}
                                        placeholder="+962-XXX-XXXX"
                                        required
                                        resolvedTheme={theme!}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Description */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>About Your Dealership</h3>

                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Tell customers about your dealership, specialties, and what makes you unique..."
                                    resolvedTheme={theme!}
                                    className="h-32"
                                />
                                <p className="mt-1 text-xs text-slate-500">{formData.description?.length || 0} characters</p>
                            </div>

                            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>💡 Tips for a great description:</h4>
                                <ul className={`mt-2 space-y-1 text-sm ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}`}>
                                    <li>• Highlight your specialties and unique offerings</li>
                                    <li>• Mention years of experience</li>
                                    <li>• Include any certifications or awards</li>
                                    <li>• Describe your customer service approach</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Review & Submit</h3>

                            <div className={`rounded-xl border p-4 space-y-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                                <div>
                                    <div className="text-sm font-medium text-slate-500">Business Name</div>
                                    <div className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formData.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-500">Location</div>
                                    <div className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formData.location}</div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="text-sm font-medium text-slate-500">Email</div>
                                        <div className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formData.contact_email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-500">Phone</div>
                                        <div className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formData.contact_phone}</div>
                                    </div>
                                </div>
                                {formData.description && (
                                    <div>
                                        <div className="text-sm font-medium text-slate-500">Description</div>
                                        <div className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>{formData.description}</div>
                                    </div>
                                )}
                            </div>

                            <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'bg-amber-900/20 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
                                <div className="flex gap-3">
                                    <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                                        <p className="font-semibold">Pending Verification</p>
                                        <p className="mt-1">Your registration will be reviewed by our team. You'll receive an email once your dealer account is approved.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className={`border-t px-6 py-4 flex justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button
                        onClick={step === 1 ? onCancel : handleBack}
                        className={`rounded-xl border px-6 py-2.5 font-semibold transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!formData.name || !formData.location || !formData.contact_email || !formData.contact_phone}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Registration ✓'}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
