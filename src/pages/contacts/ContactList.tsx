import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import type { Contact } from '../../types/contact';
import toast from 'react-hot-toast';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onShare: (contact: Contact) => void;
}

export default function ContactList({ contacts, onEdit, onDelete, onShare }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (contact.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSite = !siteFilter || contact.site_id === siteFilter;

    return matchesSearch && matchesSite;
  });

  const uniqueSites = Array.from(new Set(contacts.map(c => c.site?.site_name).filter(Boolean)));

  const formatContactInfo = (contact: Contact) => {
    return `Site: ${contact.site?.site_name || 'N/A'}
Contact: ${contact.first_name} ${contact.last_name}
Position: ${contact.job_title || 'N/A'}
Phone: ${contact.phone_number || 'N/A'}
Email: ${contact.email || 'N/A'}`;
  };

  const handleCopyContact = async (contact: Contact) => {
    try {
      await navigator.clipboard.writeText(formatContactInfo(contact));
      toast.success('Contact copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy contact');
    }
  };

  const handleCopySiteContacts = async (siteId: string) => {
    const siteContacts = contacts.filter(c => c.site_id === siteId);
    if (siteContacts.length === 0) return;

    const siteName = siteContacts[0].site?.site_name;
    const text = `Site: ${siteName}\n\n${siteContacts.map(formatContactInfo).join('\n\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('All site contacts copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy contacts');
    }
  };

  const exportSiteToPDF = (siteId: string) => {
    const siteContacts = contacts.filter(c => c.site_id === siteId);
    if (siteContacts.length === 0) return;

    const siteName = siteContacts[0].site?.site_name;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Contact Sheet - ${siteName}`, 20, 20);
    
    // Add contacts
    doc.setFontSize(12);
    let y = 40;
    
    siteContacts.forEach((contact, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`${contact.first_name} ${contact.last_name}`, 20, y);
      doc.setFont(undefined, 'normal');
      y += 7;
      
      if (contact.job_title) {
        doc.text(`Position: ${contact.job_title}`, 20, y);
        y += 7;
      }
      
      if (contact.phone_number) {
        doc.text(`Phone: ${contact.phone_number}`, 20, y);
        y += 7;
      }
      
      if (contact.email) {
        doc.text(`Email: ${contact.email}`, 20, y);
        y += 7;
      }
      
      if (index < siteContacts.length - 1) {
        doc.line(20, y, 190, y);
        y += 10;
      }
    });

    doc.save(`${siteName}-contacts.pdf`);
    toast.success('PDF exported successfully');
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Job Title', 'Phone Number', 'Email', 'Site'];
    const csvData = filteredContacts.map(contact => [
      contact.first_name || '',
      contact.last_name || '',
      contact.job_title || '',
      contact.phone_number || '',
      contact.email || '',
      contact.site?.site_name || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts.csv';
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Sites</option>
            {uniqueSites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Export to CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.job_title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.phone_number || '-'}</div>
                  <div className="text-sm text-gray-500">{contact.email || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.site?.site_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleCopyContact(contact)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => onShare(contact)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Site Actions */}
      {uniqueSites.map(site => (
        <div key={site} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{site}</h3>
            <div className="space-x-4">
              <button
                onClick={() => handleCopySiteContacts(contacts.find(c => c.site?.site_name === site)?.site_id || '')}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                Copy All Contacts
              </button>
              <button
                onClick={() => exportSiteToPDF(contacts.find(c => c.site?.site_name === site)?.site_id || '')}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}