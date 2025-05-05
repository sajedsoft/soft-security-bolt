import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Contact } from '../../types/contact';
import type { Site } from '../../types/site';
import ContactList from './ContactList';
import ContactForm from './ContactForm';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
    fetchSites();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          site:sites (
            site_name
          )
        `)
        .order('last_name', { nullsLast: true });
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contacts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, site_name')
        .order('site_name');
      
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sites';
      console.error(errorMessage);
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select(`
          *,
          site:sites (
            site_name
          )
        `)
        .single();

      if (error) throw error;

      setContacts([...contacts, data]);
      setShowForm(false);
      toast.success('Contact added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add contact';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = async (contactData: Partial<Contact>) => {
    if (!selectedContact) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', selectedContact.id)
        .select(`
          *,
          site:sites (
            site_name
          )
        `)
        .single();

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === selectedContact.id ? data : contact
      ));
      setSelectedContact(null);
      setShowForm(false);
      toast.success('Contact updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update contact';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete contact';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShareContact = async (contact: Contact) => {
    const shareText = `
Contact Information:
${contact.site?.site_name ? `Site: ${contact.site.site_name}` : ''}
Name: ${contact.first_name} ${contact.last_name}
${contact.job_title ? `Position: ${contact.job_title}` : ''}
${contact.phone_number ? `Phone: ${contact.phone_number}` : ''}
${contact.email ? `Email: ${contact.email}` : ''}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contact: ${contact.first_name} ${contact.last_name}`,
          text: shareText
        });
        toast.success('Contact shared successfully');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareText);
          toast.success('Contact details copied to clipboard');
        }
      }
    } else {
      // Fallback for browsers without share API
      await navigator.clipboard.writeText(shareText);
      toast.success('Contact details copied to clipboard');
    }
  };

  if (loading && !contacts.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !contacts.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setSelectedContact(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Contact
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <ContactForm
            onSubmit={selectedContact ? handleEditContact : handleAddContact}
            onCancel={() => {
              setShowForm(false);
              setSelectedContact(null);
            }}
            initialData={selectedContact || undefined}
            sites={sites}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ContactList
            contacts={contacts}
            onEdit={(contact) => {
              setSelectedContact(contact);
              setShowForm(true);
            }}
            onDelete={handleDeleteContact}
            onShare={handleShareContact}
          />
        </div>
      )}
    </div>
  );
}