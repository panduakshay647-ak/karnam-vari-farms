import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Customer } from '../../types';
import { Users, Search, Phone, Mail, Calendar, DollarSign, Award } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await dataService.getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    const unsub = dataService.subscribe('orders', fetchCustomers);
    return unsub;
  }, []);

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Patron Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Customer Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View customer order frequencies, lifetime spend, and repeat buyer loyalty
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">First Order</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4 text-right">Patron Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map(cust => (
                <tr key={cust.email} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                    {cust.name}
                  </td>
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{cust.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{cust.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {cust.total_orders} {cust.total_orders === 1 ? 'order' : 'orders'}
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-[#1b4332] text-sm">
                    ₹{cust.total_spent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {new Date(cust.first_order_date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {new Date(cust.last_order_date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {cust.is_returning ? (
                      <span className="inline-flex items-center gap-1 bg-[#1b4332] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        <Award className="w-3 h-3 text-[#c58940]" /> Repeat Patron
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        First Time
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
