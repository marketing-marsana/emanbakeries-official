'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AddEmployeeWorkflow() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Identity
        firstName: '',
        lastName: '',
        arabicName: '',
        identityNumber: '', // Iqama or National ID
        birthDate: '',
        nationality: '',
        gender: 'Male',
        email: '',
        phone: '',

        // Step 2: Contract (Qiwa)
        position: '',
        department: '',
        salaryBasic: '',
        salaryHousing: '',
        salaryTransport: '',
        startDate: '',
        contractDuration: '12', // Months
        probationPeriod: '90', // Days

        // Step 3: Compliance (Muqeem/GOSI)
        iqamaExpiry: '',
        passportNumber: '',
        borderNumber: '',
        sponsorId: '700XXXXXXX', // Default Company ID
        gosiRegDate: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        // 1. Calculate Total Salary
        const totalSalary = Number(formData.salaryBasic || 0) + Number(formData.salaryHousing || 0) + Number(formData.salaryTransport || 0);

        // 2. Insert into Employees
        const { data: emp, error: empError } = await supabase.from('employees').insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            // arabic_name: formData.arabicName, // Schema needs update for this, putting in metadata for now if needed, or ignoring
            identity_number: formData.identityNumber,
            birth_date: formData.birthDate,
            nationality: formData.nationality,
            gender: formData.gender,
            email: formData.email,
            phone_number: formData.phone,
            position: formData.position,
            department: formData.department,
            salary: totalSalary,
            joining_date: formData.startDate,
            status: 'Active',
            created_at: new Date().toISOString()
        }).select().single();

        if (empError) {
            alert('Error adding employee: ' + empError.message);
            setLoading(false);
            return;
        }

        // 3. Insert into Compliance (Simulating the Saudi Workflow steps)
        const { error: compError } = await supabase.from('employee_compliance').insert({
            employee_id: emp.id,
            iqama_number: formData.identityNumber,
            iqama_expiry_gregorian: formData.iqamaExpiry,
            passport_number: formData.passportNumber,
            border_number: formData.borderNumber,
            contract_status: 'Active (Qiwa)',
            work_permit_expiry_date: formData.iqamaExpiry // Usually aligned
        });

        // 4. Insert into Financials
        const { error: finError } = await supabase.from('employee_financials').insert({
            employee_id: emp.id,
            basic_salary: Number(formData.salaryBasic),
            housing_allowance: Number(formData.salaryHousing),
            transport_allowance: Number(formData.salaryTransport),
            total_salary: totalSalary
        });

        if (compError || finError) {
            console.error('Compliance/Financials error:', compError, finError);
            // Non-fatal, employee created
        }

        setLoading(false);
        alert('Employee Onboarding Completed Successfully!');
        router.push('/employees');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">New Employee Onboarding</h2>
                    <p className="text-gray-600 mt-2">Saudi Labor Law Compliant Workflow (Qiwa • Muqeem • GOSI)</p>
                </div>

                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        {['Personal Identity', 'Contract (Qiwa)', 'Compliance & GOSI', 'Review'].map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = step >= stepNum;
                            const isCurrent = step === stepNum;
                            return (
                                <div key={idx} className="flex flex-col items-center bg-gray-50 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {stepNum}
                                    </div>
                                    <span className={`text-sm mt-2 font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8">

                    {/* STEP 1: PERSONAL IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Step 1: Personal & Identity Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name (English)</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name (English)</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name (Arabic)</label>
                                    <input type="text" name="arabicName" value={formData.arabicName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-right" placeholder="الاسم الكامل" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Identity Number (Iqama / National ID)</label>
                                    <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" required />
                                    <p className="text-xs text-gray-500 mt-1">Must be 10 digits</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                    <select name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                                        <option value="">Select...</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="Egypt">Egypt</option>
                                        <option value="India">India</option>
                                        <option value="Pakistan">Pakistan</option>
                                        <option value="Philippines">Philippines</option>
                                        <option value="Bangladesh">Bangladesh</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" placeholder="+966..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONTRACT */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Step 2: Employment Contract (Qiwa)</h3>
                            <p className="text-sm text-gray-500">This data will be used to generate the electronic contract on Qiwa.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Position</label>
                                    <input type="text" name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                                        <option value="">Select...</option>
                                        <option value="Management">Management</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Sales">Sales</option>
                                        <option value="HR">HR</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contract Duration (Months)</label>
                                    <input type="number" name="contractDuration" value={formData.contractDuration} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Probation Period (Days)</label>
                                    <select name="probationPeriod" value={formData.probationPeriod} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border">
                                        <option value="90">90 Days</option>
                                        <option value="180">180 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="font-semibold text-green-800 mb-4">Compensation Package (Mudad / WPS)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase">Basic Salary</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-gray-500">SAR</span>
                                            <input type="number" name="salaryBasic" value={formData.salaryBasic} onChange={handleChange} className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase">Housing</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-gray-500">SAR</span>
                                            <input type="number" name="salaryHousing" value={formData.salaryHousing} onChange={handleChange} className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase">Transport</label>
                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-2 text-gray-500">SAR</span>
                                            <input type="number" name="salaryTransport" value={formData.salaryTransport} onChange={handleChange} className="block w-full pl-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-green-200 flex justify-between items-center">
                                    <span className="font-bold text-green-900">Total Monthly Salary</span>
                                    <span className="font-bold text-xl text-green-900">
                                        SAR {(Number(formData.salaryBasic) + Number(formData.salaryHousing) + Number(formData.salaryTransport)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: COMPLIANCE */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Step 3: Government Compliance</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                                    <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Border Number (New Arrivals)</label>
                                    <input type="text" name="borderNumber" value={formData.borderNumber} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Iqama Expiry Date</label>
                                    <input type="date" name="iqamaExpiry" value={formData.iqamaExpiry} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsor ID</label>
                                    <input type="text" name="sponsorId" value={formData.sponsorId} readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 border cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h4 className="font-semibold text-yellow-800 mb-2">GOSI Registration</h4>
                                <p className="text-sm text-yellow-700 mb-4">Ensure the employee is registered in GOSI effective from the joining date.</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">GOSI Registration Date</label>
                                    <input type="date" name="gosiRegDate" value={formData.gosiRegDate || formData.startDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Review Onboarding Details</h3>
                                <p className="text-gray-600">Please verify all information before finalizing the employee profile.</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Full Name</span>
                                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Identity (Iqama)</span>
                                        <span className="font-medium">{formData.identityNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Position</span>
                                        <span className="font-medium">{formData.position}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Joining Date</span>
                                        <span className="font-medium">{formData.startDate}</span>
                                    </div>
                                    <div className="col-span-2 pt-4 border-t border-gray-200">
                                        <span className="text-gray-500 block">Total Salary Package</span>
                                        <span className="font-bold text-lg text-indigo-600">
                                            SAR {(Number(formData.salaryBasic) + Number(formData.salaryHousing) + Number(formData.salaryTransport)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="confirm" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                <label htmlFor="confirm" className="text-sm text-gray-700">
                                    I confirm that all contracts have been registered on Qiwa and GOSI registration is pending.
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                disabled={loading}
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/employees')}
                                className="px-6 py-2 text-gray-500 font-medium hover:text-gray-700 transition"
                            >
                                Cancel
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md flex items-center gap-2"
                            >
                                {loading ? 'Creating...' : 'Create Employee Profile'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
