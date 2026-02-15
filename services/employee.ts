import { supabase } from '@/lib/supabase'

export interface Employee {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    position: string
    department: string
    nationality: string
    iqama: string
    iqama_expiry: string
    base_salary: number
    status: string
    compliance_status: string
    hire_date: string
}

export const employeeService = {
    // Get all employees
    async getEmployees() {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('first_name', { ascending: true })

        if (error) throw error
        return data as Employee[]
    },

    // Get single employee
    async getEmployee(id: string) {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Employee
    },

    // Create employee
    async createEmployee(employee: Partial<Employee>) {
        const { data, error } = await supabase
            .from('employees')
            .insert([employee])
            .select()
            .single()

        if (error) throw error
        return data as Employee
    },

    // Update employee
    async updateEmployee(id: string, updates: Partial<Employee>) {
        const { data, error } = await supabase
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Employee
    },

    // Delete employee
    async deleteEmployee(id: string) {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id)

        if (error) throw error
    },
}
