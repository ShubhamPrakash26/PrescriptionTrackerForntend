import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, FileText, Users, Filter as FilterIcon, XCircle, Trash2 } from 'lucide-react';
import api from "../api";

const Dashboard = () => {
  // Family Members
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // New member form
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    gender: '',
    relationship: '',
  });

  // Document Upload form
  const [showForm, setShowForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');

  // Documents (Prescriptions and Reports)
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Filters
  const [filterTags, setFilterTags] = useState(["ENT", "Cardiology"]);
  const [filterChecks, setFilterChecks] = useState({ time: false, type: false, id: false });
  const [filterDocType, setFilterDocType] = useState(''); // Prescription or Report or ""
  const [filterMember, setFilterMember] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'member', 'prescription', or 'report'
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Tag options
  const tagOptions = useMemo(
    () => [
      "ENT", 
      "Cardiology", 
      "Neuro", 
      "General", 
      "Follow-up", 
      "Heart", 
      "Orthopedics", 
      "Dermatology"
    ],
    []
  );

  const tableHeaderClass =
    'px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider';
  const tableCellClass =
    'px-4 py-3 whitespace-nowrap text-sm text-white';
  const tableRowClass =
    'bg-blue-700 even:bg-blue-500 hover:bg-blue-800 transition';
  const tableBadgeClass =
    'inline-block px-2 py-1 rounded-full text-xs font-semibold bg-cyan-200 text-blue-900 mr-1';

  // Fetch family members from backend
  const fetchMembers = async () => {
  try {
    setLoadingMembers(true);
    const res = await api.get("/api/family");
    const fetchedMembers = res.data || [];

    // Ensure Self is added if missing
    const hasSelf = fetchedMembers.some(m => m.name.toLowerCase() === 'self');
    if (!hasSelf) {
      fetchedMembers.unshift({
        name: 'Self',
        relationship: 'Self',
        memberId: 'self',
        gender: '',
        age: ''
      });
    }

    setMembers(fetchedMembers);
    setLoadingMembers(false);
  } catch (err) {
    console.error("Failed to fetch members", err);
    setLoadingMembers(false);

    // Always include Self if API fails
    setMembers([{
      name: 'Self',
      relationship: 'Self',
      memberId: 'self',
      gender: '',
      age: ''
    }]);
  }
};


  // Fetch documents (prescriptions & reports)
  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      
      const paramsBase = {};
      if (filterMember && filterMember !== "all") {
        paramsBase.memberId = filterMember;
      }
      if (filterTag && filterTag !== "all") {
        paramsBase.tags = filterTag;
      }
      
      console.log("Fetching documents with params:", paramsBase);

      if (filterDocType === "Prescription" || filterDocType === "all" || filterDocType === "") {
        console.log("Fetching prescriptions...");
        const presRes = await api.get("/api/prescriptions", {
          params: paramsBase,
        });
        console.log("Prescription response:", presRes.data);
        setPrescriptions(presRes.data || []);
      } else {
        setPrescriptions([]);
      }

      if (filterDocType === "Report" || filterDocType === "all" || filterDocType === "") {
        console.log("Fetching reports...");
        const repRes = await api.get("/api/reports", {
          params: paramsBase,
        });
        console.log("Report response:", repRes.data);
        setReports(repRes.data || []);
      } else {
        setReports([]);
      }

      setLoadingDocs(false);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      setLoadingDocs(false);
    }
  };
  useEffect(() => {
  fetchMembers();
  fetchDocuments();
}, []);
  useEffect(() => {
    fetchDocuments();
  }, [filterMember, filterTag, filterDocType]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setFilePreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
    }
  };

  // Add new family member API call
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relationship) {
      alert("Please fill required fields");
      return;
    }

    // Check for duplicates
    if (
       members.some(
       (m) => m.name.toLowerCase() === newMember.name.trim().toLowerCase()
      )
      ) {
        alert("Member with this name already exists");
        return;
    }


    try {
      console.log("Adding new member:", newMember);
      const res = await api.post("/api/family", newMember);
      console.log("Add member response:", res.data);
      
      setMembers((prev) => [...prev, res.data]);
      setShowMemberForm(false);
      setNewMember({ name: "", age: "", gender: "", relationship: "" });
    } catch (err) {
      console.error("Failed to add member", err);
      alert("Failed to add member: " + (err.response?.data?.message || err.message));
      
      setMembers([...members, { ...newMember, memberId: Date.now().toString() }]);
      setNewMember({
        name: '',
        age: '',
        gender: '',
        relationship: '',
      });
      setShowMemberForm(false);
    }
  };

  // Handle document upload
  const handleAddDocument = async () => {
    if (!selectedDocType) {
      alert("Select document type");
      return;
    }
    if (!selectedMember) {
      alert("Select family member");
      return;
    }
    if (!documentName.trim()) {
      alert("Enter document name");
      return;
    }
    if (!selectedTag) {
      alert("Select tag");
      return;
    }
    if (!documentFile) {
      alert("Select a file to upload");
      return;
    }

    try {
      console.log("Preparing to upload document:", {
        type: selectedDocType,
        name: documentName,
        member: selectedMember,
        tag: selectedTag
      });
      
      // Create a new FormData instance for each request
      const formData = new FormData();
      
      if (selectedDocType === "Prescription") {
        formData.append("title", documentName.trim());
        formData.append("memberId", selectedMember);
        formData.append("tags", selectedTag);
        if (documentDate) formData.append("date", documentDate);
        formData.append("file", documentFile);
        
        console.log("Uploading prescription...");
        const response = await api.post("/api/prescriptions", formData, {
          headers: { 
            "Content-Type": "multipart/form-data"
          }
        });
        console.log("Prescription upload response:", response.data);
      } else {
        formData.append("type", documentName.trim());
        formData.append("memberId", selectedMember);
        formData.append("tags", selectedTag);
        if (documentDate) formData.append("date", documentDate);
        formData.append("file", documentFile);
        console.log("Uploading report...");
        const response = await api.post("/api/reports", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        console.log("Report upload response:", response.data);
      }
      clearForm();
      fetchDocuments();
      
      alert(`${selectedDocType} uploaded successfully!`);
    } catch (err) {
      console.error(`Failed to upload ${selectedDocType.toLowerCase()}:`, err);
      
      // Error logging
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      
      alert(`Failed to upload ${selectedDocType.toLowerCase()}: ${err.response?.data?.message || err.message}`);

      const docData = {
        name: documentName,
        date: documentDate,
        tag: selectedTag,
        member: selectedMember,
        fileName: documentFile.name,
        previewUrl: filePreviewUrl,
        fileType: documentFile.type,
        id: `PR-${1000 + (prescriptions.length + reports.length)}`
      };

      if (selectedDocType === 'Prescription') {
        setPrescriptions([...prescriptions, docData]);
      } else {
        setReports([...reports, docData]);
      }

      clearForm();
    }
  };
  const clearForm = () => {
    setDocumentName('');
    setDocumentDate('');
    setDocumentFile(null);
    setFilePreviewUrl('');
    setSelectedTag('');
    setSelectedMember('');
    setSelectedDocType('');
    setShowForm(false);
  };

  // Filter UI handlers
  const handleTagRemove = (tag) => setFilterTags(tags => tags.filter(t => t !== tag));
  const handleTagAdd = (tag) => {
    if (!filterTags.includes(tag)) setFilterTags(tags => [...tags, tag]);
  };
  const handleCheck = (key) => setFilterChecks(chk => ({ ...chk, [key]: !chk[key] }));

  // Delete functionality
  const handleDeleteMember = (member) => {
    setDeleteType('member');
    setDeleteItemId(member.memberId || member._id);
    setDeleteItemName(member.name);
    setShowDeleteModal(true);
  };

  const handleDeletePrescription = (prescription) => {
    setDeleteType('prescription');
    setDeleteItemId(prescription._id);
    setDeleteItemName(prescription.title);
    setShowDeleteModal(true);
  };

  const handleDeleteReport = (report) => {
    setDeleteType('report');
    setDeleteItemId(report._id);
    setDeleteItemName(report.type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'member') {
        await api.delete(`/api/family/${deleteItemId}`);
        setMembers(members.filter(m => (m.memberId || m._id) !== deleteItemId));
      } else if (deleteType === 'prescription') {
        await api.delete(`/api/prescriptions/${deleteItemId}`);
        setPrescriptions(prescriptions.filter(p => p._id !== deleteItemId));
      } else if (deleteType === 'report') {
        await api.delete(`/api/reports/${deleteItemId}`);
        setReports(reports.filter(r => r._id !== deleteItemId));
      }
      setShowDeleteModal(false);
    } catch (err) {
      console.error(`Failed to delete ${deleteType}:`, err);
      alert(`Failed to delete ${deleteType}: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-8 mt-10 pt-12 grid gap-8 bg-gray-50 min-h-screen">

      {/* Top Row: Family Members Card and Filter Card */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card className="hover:shadow-xl transition">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">Family Members</h4>
              <Button 
                onClick={() => setShowMemberForm(true)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add Member
              </Button>
            </div>
            <div className="space-y-4">
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No family members added yet</p>
              ) : (
                <ul className="space-y-3">
                  {members.map((member) => (
                    <li key={member.memberId || member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">
                          {member.relationship} • {member.age} years • {member.gender}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteMember(member)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Filter Card */}
        <div className="flex justify-end items-start h-full pt-6 pr-6">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-4 w-56 flex flex-col gap-2">
            {/* Member Filter */}
            <div>
              <div className="font-semibold text-gray-700 mb-1 text-sm">Family Member</div>
              <select
                className="w-full border border-cyan-200 rounded px-2 py-1 text-xs text-cyan-700 bg-cyan-50 focus:outline-none"
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="">All Members</option>
                {members.map((member) => (
                  <option key={member.memberId || member._id} value={member.memberId || member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Document Type Filter */}
            <div>
              <div className="font-semibold text-gray-700 mb-1 text-sm">Document Type</div>
              <select
                className="w-full border border-cyan-200 rounded px-2 py-1 text-xs text-cyan-700 bg-cyan-50 focus:outline-none"
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
              >
                <option value="">All Documents</option>
                <option value="Prescription">Prescriptions</option>
                <option value="Report">Reports</option>
              </select>
            </div>
            
            {/* Tags Filter */}
            <div>
              <div className="font-semibold text-gray-700 mb-1 text-sm">Tags</div>
              <div className="flex flex-wrap gap-1 mb-1">
                {filterTags.map(tag => (
                  <span key={tag} className="bg-cyan-100 text-cyan-800 rounded-full px-2 py-0.5 flex items-center text-xs font-semibold">
                    {tag}
                    <button className="ml-0.5" onClick={() => handleTagRemove(tag)}>
                      <XCircle className="w-3 h-3 text-cyan-500 hover:text-cyan-700" />
                    </button>
                  </span>
                ))}
                <select
                  className="ml-1 border border-cyan-200 rounded px-1 py-0.5 text-xs text-cyan-700 bg-cyan-50 focus:outline-none"
                  onChange={e => { if (e.target.value) { handleTagAdd(e.target.value); e.target.value = ''; } }}
                  value=""
                >
                  <option value="">+ Add</option>
                  {tagOptions.filter(tag => !filterTags.includes(tag)).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Existing Checkboxes */}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1 cursor-pointer text-xs">
                <input type="checkbox" checked={filterChecks.time} onChange={() => handleCheck('time')} className="accent-cyan-500 w-3 h-3" />
                <span className="font-semibold">Time</span>
                <span className="text-[10px] text-gray-400 ml-1">Description</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs">
                <input type="checkbox" checked={filterChecks.type} onChange={() => handleCheck('type')} className="accent-cyan-500 w-3 h-3" />
                <span className="font-semibold">Type</span>
                <span className="text-[10px] text-gray-400 ml-1">Description</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs">
                <input type="checkbox" checked={filterChecks.id} onChange={() => handleCheck('id')} className="accent-cyan-500 w-3 h-3" />
                <span className="font-semibold">ID</span>
                <span className="text-[10px] text-gray-400 ml-1">Description</span>
              </label>
            </div>
            
            {/* Filter Button */}
            <Button 
              className="bg-cyan-400 hover:bg-cyan-500 text-white font-semibold rounded-xl w-full py-2 flex items-center gap-1 shadow-md text-base mt-1"
              onClick={fetchDocuments}
            >
              <FilterIcon className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="relative bg-white rounded-xl shadow-md p-0 mt-8">
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h4 className="text-xl font-bold text-blue-900">Prescriptions ({prescriptions.length})</h4>
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow p-2" onClick={() => setShowForm(true)}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200 rounded-xl overflow-hidden">
            <thead className="bg-blue-900">
              <tr>
                <th className={tableHeaderClass}>ID</th>
                <th className={tableHeaderClass}>Name</th>
                <th className={tableHeaderClass}>Date</th>
                <th className={tableHeaderClass}>Tag</th>
                <th className={tableHeaderClass}>Family Member</th>
                <th className={tableHeaderClass}>File</th>
                <th className={tableHeaderClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-blue-900 bg-blue-100">No prescriptions uploaded yet.</td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p._id} className={tableRowClass}>
                    <td className={tableCellClass + ' font-bold'}>{p._id}</td>
                    <td className={tableCellClass}>{p.title}</td>
                    <td className={tableCellClass}>{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                    <td className={tableCellClass}>
                      {p.tags && p.tags.length > 0 && (
                        <span className={tableBadgeClass}>{p.tags[0]}</span>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      {members.find(m => (m.memberId || m._id) === p.memberId)?.name || p.memberId}
                    </td>
                    <td className={tableCellClass}>
                      {p.imageUrl ? (
                        <a
                          href={p.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-100 hover:text-white underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-blue-100">No file</span>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-300 hover:text-red-100"
                        onClick={() => handleDeletePrescription(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Table */}
      <div className="relative bg-white rounded-xl shadow-md p-0 mt-8">
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h4 className="text-xl font-bold text-blue-900">Reports ({reports.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200 rounded-xl overflow-hidden">
            <thead className="bg-blue-900">
              <tr>
                <th className={tableHeaderClass}>ID</th>
                <th className={tableHeaderClass}>Name</th>
                <th className={tableHeaderClass}>Date</th>
                <th className={tableHeaderClass}>Tag</th>
                <th className={tableHeaderClass}>Family Member</th>
                <th className={tableHeaderClass}>File</th>
                <th className={tableHeaderClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-blue-900 bg-blue-100">No reports uploaded yet.</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className={tableRowClass}>
                    <td className={tableCellClass + ' font-bold'}>{r._id}</td>
                    <td className={tableCellClass}>{r.type}</td>
                    <td className={tableCellClass}>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td className={tableCellClass}>
                      {r.tags && r.tags.length > 0 && (
                        <span className={tableBadgeClass}>{r.tags[0]}</span>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      {members.find(m => (m.memberId || m._id) === r.memberId)?.name || r.memberId}
                    </td>
                    <td className={tableCellClass}>
                      {r.fileUrl ? (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-100 hover:text-white underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-blue-100">No file</span>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-300 hover:text-red-100"
                        onClick={() => handleDeleteReport(r)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Form Modal */}
      <AnimatePresence>
        {showMemberForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="w-full max-w-lg relative overflow-visible shadow-2xl rounded-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Add Family Member</h4>
                  <Button variant="ghost" size="icon" onClick={() => setShowMemberForm(false)}>
                    <X />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Enter member's full name" 
                      value={newMember.name} 
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))} 
                    />
                  </div>
                  
                  <div>
                    <Label>Age</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter age" 
                      value={newMember.age} 
                      onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))} 
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select 
                      value={newMember.gender} 
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Relationship</Label>
                    <Select 
                      value={newMember.relationship} 
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Self">Self</SelectItem>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleAddMember} 
                    className="w-full"
                    disabled={!newMember.name || !newMember.relationship}
                  >
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal with Animation */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="w-full max-w-lg relative overflow-visible shadow-2xl rounded-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Add Document</h4>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                    <X />
                  </Button>
                </div>

                <Input placeholder="Document Name" value={documentName} onChange={(e) => setDocumentName(e.target.value)} />
                <Input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />

                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Document Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {tagOptions.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Member" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {members.length > 0 ? (
                      members.map((m) => (
                        <SelectItem key={m.memberId || m._id} value={m.memberId || m._id}>
                          {m.name} {m.relationship !== 'Self' ? `- ${m.relationship}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-gray-400 text-sm">No members added</div>
                    )}
                  </SelectContent>
                </Select>

                <Input type="file" onChange={handleFileChange} />
                {documentFile && (
                  <div className="mt-2">
                    {filePreviewUrl ? (
                      <img src={filePreviewUrl} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                    ) : (
                      <div className="text-gray-500">{documentFile.name}</div>
                    )}
                  </div>
                )}

                <Button className="w-full" onClick={handleAddDocument}>Save</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="w-full max-w-md relative overflow-visible shadow-2xl rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg text-red-600">Confirm Delete</h4>
                  <Button variant="ghost" size="icon" onClick={() => setShowDeleteModal(false)}>
                    <X />
                  </Button>
                </div>
                
                <div className="py-2">
                  <p className="text-gray-700">
                    Are you sure you want to delete {deleteType === 'member' ? 'family member' : deleteType} "{deleteItemName}"? 
                    This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
