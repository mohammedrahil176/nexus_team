import React, { useState } from 'react';
import { useTeam } from '../store';
import { TeamMember } from '../types';
import { useAuth } from '../AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Plus, Trash2, Edit2, X, Check, LogIn, LogOut, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const emptyMember: TeamMember = {
  id: '',
  name: '',
  role: '',
  bio: '',
  photoUrl: '',
  coverUrl: '',
  fontFamily: 'sans',
  achievements: [],
  skills: [],
  linkedin: '',
  instagram: '',
  github: '',
  phone: '',
  email: ''
};

export default function Admin() {
  const { members, addMember, updateMember, deleteMember, loading: teamLoading } = useTeam();
  const { user, signIn, logOut, loading: authLoading, getGoogleAccessToken } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMember | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [sheetLink, setSheetLink] = useState<string | null>(null);

  if (authLoading || teamLoading) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login Required</h1>
        <p className="text-gray-500 mb-8">Please sign in with your Google account to manage team profiles and generate QR codes.</p>
        <button 
          onClick={signIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const allowedEmails = ['insta.bithacker@gmail.com', '69.creww@gmail.com'];
  if (!user.email || !allowedEmails.includes(user.email)) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          The account <strong>{user.email}</strong> is not authorized to access the admin panel.
        </p>
        <button 
          onClick={logOut}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    );
  }

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({ ...member });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({ ...emptyMember, id: Math.random().toString(36).substring(2, 9) });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const syncDataToSheets = async (currentMembers: TeamMember[]) => {
    const token = getGoogleAccessToken();
    if (!token) return;

    try {
      let sheetId = localStorage.getItem('nexus_team_spreadsheet_id');

      if (!sheetId) {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: 'Nexus Team Members Master List'
            }
          })
        });
        
        if (!createRes.ok) throw new Error('Failed to create spreadsheet');
        const spreadsheet = await createRes.json();
        sheetId = spreadsheet.spreadsheetId;
        localStorage.setItem('nexus_team_spreadsheet_id', sheetId!);
      }

      const values = [
        ['Name', 'Name ID', 'Phone Number', 'Role'],
        ...currentMembers.map(m => [m.name, m.id, m.phone, m.role])
      ];
      
      // Clear previous data
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:D:clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:D${values.length}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });
      
      if (!updateRes.ok) {
        if (updateRes.status === 403 || updateRes.status === 404) {
          localStorage.removeItem('nexus_team_spreadsheet_id');
        }
        throw new Error('Failed to write data to spreadsheet');
      }
    } catch (e) {
      console.error('Error syncing to sheets:', e);
      throw e;
    }
  };

  const exportToSheets = async () => {
    const token = getGoogleAccessToken();
    if (!token) {
      alert("Please sign in again to grant Google Sheets access.");
      signIn();
      return;
    }
    
    setIsExporting(true);
    setSheetLink(null);
    try {
      await syncDataToSheets(members);
      const sheetId = localStorage.getItem('nexus_team_spreadsheet_id');
      setSheetLink(`https://docs.google.com/spreadsheets/d/${sheetId}`);
    } catch (e: any) {
      alert('Error exporting to Google Sheets: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleArrayChange = (field: 'achievements' | 'skills', value: string) => {
    if (!formData) return;
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: array });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'coverUrl') => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({ ...formData, [field]: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      let updatedMembers = [...members];

      if (editingId === 'new') {
        await addMember(formData);
        updatedMembers.push(formData);
      } else {
        await updateMember(formData.id, formData);
        updatedMembers = updatedMembers.map(m => m.id === formData.id ? formData : m);
      }
      
      // Auto sync to sheets in background
      syncDataToSheets(updatedMembers).catch(console.error);

      setEditingId(null);
      setFormData(null);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save member.");
    }
  };

  const getFullUrl = (memberId: string) => {
    return `${window.location.origin}/team/${memberId}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage team members and generate QR codes.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={exportToSheets}
            disabled={isExporting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" />
            {isExporting ? 'Exporting...' : 'Export to Sheets'}
          </button>
          <button 
            onClick={handleAddNew}
            disabled={editingId !== null}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
          <button 
            onClick={logOut}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
      
      {sheetLink && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <span>Successfully exported data to Google Sheets!</span>
          </div>
          <a 
            href={sheetLink} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Open Sheet <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Member List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Team Members</h2>
          {members.length === 0 && <p className="text-gray-500 text-sm">No members found.</p>}
          
          {members.map(member => (
            <div 
              key={member.id} 
              className={`p-4 rounded-xl border transition-colors ${editingId === member.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => handleEdit(member)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => setShowQR(showQR === member.id ? null : member.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                >
                  QR Code
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this member?')) {
                      await deleteMember(member.id);
                      if (editingId === member.id) handleCancel();
                      syncDataToSheets(members.filter(m => m.id !== member.id)).catch(console.error);
                    }
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {showQR === member.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <QRCodeDisplay url={getFullUrl(member.id)} name={member.name} />
                  <Link to={`/team/${member.id}`} target="_blank" className="block text-center text-xs text-blue-600 hover:underline mt-2">
                    Open Profile
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          {editingId ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId === 'new' ? 'Add New Member' : 'Edit Member'}
                </h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formData && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">URL Slug / ID</label>
                      <input 
                        type="text" 
                        value={formData.id} 
                        onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        disabled={editingId !== 'new'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="e.g. aqheel-sharma"
                      />
                      {editingId === 'new' && <p className="text-xs text-gray-500">This forms the URL: /team/slug</p>}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Role / Title</label>
                      <input 
                        type="text" 
                        value={formData.role} 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Photo (Avatar)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'photoUrl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.photoUrl && (
                        <div className="mt-2">
                          <img src={formData.photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Background/Cover Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'coverUrl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.coverUrl && (
                        <div className="mt-2">
                          <img src={formData.coverUrl} alt="Cover Preview" className="h-16 w-32 object-cover rounded border" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Font Option</label>
                      <select 
                        value={formData.fontFamily || 'sans'} 
                        onChange={e => setFormData({...formData, fontFamily: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="sans">Modern Sans (Default)</option>
                        <option value="serif">Classic Serif</option>
                        <option value="mono">Typewriter Mono</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Lists */}
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Achievements (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.achievements.join(', ')} 
                        onChange={e => handleArrayChange('achievements', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Award 1, Award 2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.skills.join(', ')} 
                        onChange={e => handleArrayChange('skills', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="React, Design, C++"
                      />
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input 
                        type="text" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                      <input 
                        type="url" 
                        value={formData.linkedin} 
                        onChange={e => setFormData({...formData, linkedin: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                      <input 
                        type="url" 
                        value={formData.instagram} 
                        onChange={e => setFormData({...formData, instagram: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                      <input 
                        type="url" 
                        value={formData.github} 
                        onChange={e => setFormData({...formData, github: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                      onClick={handleCancel}
                      className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={!formData.name || !formData.id}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      Save Member
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Edit2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Member Selected</h3>
              <p className="text-gray-500 max-w-sm">
                Select a member from the list to edit their profile, or click "Add Member" to create a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
