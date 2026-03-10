'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AddDoctor() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    contactNo: '',
    address: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/doctors/add', {
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
        specialization: '',
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Onboard New Doctor</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm space-y-8">
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Doctor onboarded successfully!
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error} (Note: Only Admins can add doctors)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Details</h3>
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
              label="Specialization" 
              name="specialization" 
              value={formData.specialization} 
              onChange={handleChange} 
              placeholder="e.g. Cardiology"
              required 
            />
            <Input 
              label="Contact Number" 
              name="contactNo" 
              value={formData.contactNo} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account & Credentials</h3>
            <Input 
              label="Email Address" 
              name="email" 
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Temporary Password" 
              name="password" 
              type="password"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Full Address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" isLoading={loading} className="w-full md:w-auto px-12">
            Add Doctor to Staff
          </Button>
        </div>
      </form>
    </div>
  );
}
