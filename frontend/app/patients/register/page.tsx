'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPatient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'MALE',
    bloodGroup: '',
    contactNo: '',
    address: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // In a real app, you'd get the token from auth state/context
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'MALE',
        bloodGroup: '',
        contactNo: '',
        address: '',
        email: '',
        password: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Register New Patient</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm space-y-8">
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Patient registered successfully!
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error} (Note: Ensure backend is running and you are logged in)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            <Input 
              label="First Name" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Last Name" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Date of Birth" 
              name="dob" 
              type="date" 
              value={formData.dob} 
              onChange={handleChange} 
              required 
            />
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <Input 
              label="Blood Group" 
              name="bloodGroup" 
              value={formData.bloodGroup} 
              onChange={handleChange} 
              placeholder="e.g. O+" 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Account</h3>
            <Input 
              label="Contact Number" 
              name="contactNo" 
              value={formData.contactNo} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
            />
            <div className="pt-4 space-y-4">
              <h4 className="text-sm font-bold text-gray-600">Portal Access (Optional)</h4>
              <Input 
                label="Email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="patient@example.com"
              />
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••"
                helperText="Leave blank if portal access is not required"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" isLoading={loading} className="w-full md:w-auto px-12">
            Register Patient
          </Button>
        </div>
      </form>
    </div>
  );
}
