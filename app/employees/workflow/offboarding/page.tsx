'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, Save, XCircle, ArrowLeft } from 'lucide-react';

function OffboardingWorkflowContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const employeeId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [employee, setEmployee] = useState<any>(null);
    const [progress, setProgress] = useState({
        qiwa_removed: false,
        gosi_removed: false,
        mudad_removed: false,
        muqeem_removed: false,
        notes: ''
    });

    useEffect(() => {
        if (employeeId) {
            fetchData();
        }
    }, [employeeId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Employee
            const { data: emp, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('id', employeeId)
                .single();

            if (empError) throw empError;
            setEmployee(emp);

            // 2. Fetch or Init Progress
            const { data: prog, error: progError } = await supabase
                .from('offboarding_progress')
                .select('*')
                .eq('employee_id', employeeId)
                .single();

            if (prog) {
                setProgress(prog);
            } else {
                // Initialize if not exists (First time opening = Start Offboarding)
                // Also update status to 'Offboarding' if not already
                if (emp.status === 'Active') {
                    await supabase
                        .from('employees')
                        .update({ status: 'Offboarding' })
                        .eq('id', employeeId);

                    // Create entry
                    const { data: newProg } = await supabase
                        .from('offboarding_progress')
                        .insert({ employee_id: employeeId })
                        .select()
                        .single();

                    if (newProg) setProgress(newProg);
                }
            }

        } catch (err) {
            console.error('Error fetching offboarding data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Check if final step is done
            let newStatus = 'Offboarding';
            if (progress.muqeem_removed) {
                const confirmTerminate = window.confirm(
                    "You have marked 'Muqeem Removed'. This will finalize the employee status to 'Terminated'. Proceed?"
                );
                if (!confirmTerminate) {
                    setSaving(false);
                    return;
                }
                newStatus = 'Terminated';
            }

            // Update Progress Table
            const { error: progError } = await supabase
                .from('offboarding_progress')
                .upsert({
                    employee_id: employeeId,
                    ...progress,
                    updated_at: new Date().toISOString()
                });

            if (progError) throw progError;

            // Update Employee Status
            const { error: empError } = await supabase
                .from('employees')
                .update({ status: newStatus })
                .eq('id', employeeId);

            if (empError) throw empError;

            alert('Offboarding progress saved successfully.');
            if (newStatus === 'Terminated') {
                router.push('/employees'); // Go back to list
            }

        } catch (err) {
            console.error('Error saving progress:', err);
            alert('Failed to save offboarding progress.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading workflow...</div>;
    if (!employee) return <div className="p-12 text-center text-red-500">Employee not found.</div>;

    const steps = [
        { key: 'qiwa_removed', label: 'Remove from Qiwa', desc: 'Step 1: Cancel active contract and remove specific employment linkage.' },
        { key: 'gosi_removed', label: 'Remove from GOSI', desc: 'Step 2: Terminate social insurance registration and settle contributions.' },
        { key: 'mudad_removed', label: 'Remove from Mudad', desc: 'Step 3: Ensure payroll account linkage is severed.' },
        { key: 'muqeem_removed', label: 'Remove from Muqeem', desc: 'Step 4 (Final): Process final exit or transfer sponsorship. Completing this terminates employment.' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 border-b border-red-100 p-6 flex justify-between items-center">
                    <div>
                        <button onClick={() => router.back()} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <h1 className="text-2xl font-bold text-red-800 flex items-center gap-2">
                            <XCircle className="w-6 h-6" />
                            Offboarding Workflow
                        </h1>
                        <p className="text-red-600 mt-1">
                            Terminating: <span className="font-bold">{employee.full_name_en}</span> ({employee.position})
                        </p>
                    </div>
                    <div className="bg-white px-3 py-1 rounded text-red-600 font-mono text-sm border border-red-200">
                        {progress.muqeem_removed ? 'TERMINATED' : 'IN PROGRESS'}
                    </div>
                </div>

                {/* Status Warning */}
                {!progress.muqeem_removed && (
                    <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-800">Action Required</p>
                            <p className="text-xs text-orange-600">
                                This employee is marked as 'Offboarding'. Payroll generation will be skipped.
                                Complete all steps to finalize termination.
                            </p>
                        </div>
                    </div>
                )}

                {/* Workflow Steps */}
                <div className="p-6 space-y-6">
                    {steps.map((step, idx) => (
                        <div key={step.key} className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                            // @ts-ignore
                            progress[step.key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    // @ts-ignore
                                    checked={progress[step.key]}
                                    onChange={(e) => setProgress({ ...progress, [step.key]: e.target.checked })}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <label className={`font-semibold ${
                                        // @ts-ignore
                                        progress[step.key] ? 'text-green-800 line-through opacity-75' : 'text-gray-900'
                                        }`}>
                                        {step.label}
                                    </label>
                                    {/* @ts-ignore */}
                                    {progress[step.key] && (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Done
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                            </div>
                        </div>
                    ))}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Final Remarks / Notes</label>
                        <textarea
                            value={progress.notes || ''}
                            onChange={(e) => setProgress({ ...progress, notes: e.target.value })}
                            className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                            placeholder="Add reason for leaving, handover details, etc..."
                        />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2 text-white font-medium rounded-lg transition disabled:opacity-50 ${progress.muqeem_removed ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {saving ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {progress.muqeem_removed ? 'Finalize Termination' : 'Save Draft Progress'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OffboardingWorkflowPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OffboardingWorkflowContent />
        </Suspense>
    );
}
