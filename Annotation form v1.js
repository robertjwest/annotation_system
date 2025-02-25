import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const AnnotationSystem = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('create');
  
  // State to store form data
  const [formData, setFormData] = useState({
    id: '', // Used for tracking which annotation is being edited
    documentId: '',
    documentLabel: '',
    documentType: '',
    groupId: '',
    groupName: '',
    entityType: '',
    confidence: '',
    entityLabel: '',
    entityDescription: '',
    revisedEntityLabel: '',
    revisedEntityDescription: '',
    effective: true,
    entityValue: '',
    entityValueDataType: '',
    entityValueStatsType: '',
    entityValueDispersion: '',
    entityValueDispersionType: '',
    entityValueUnitOfMeasurement: '',
    context: '',
    comment: '',
    person: '',
    questionsForRW: '',
    notes: ''
  });

  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);

  // State to store document/group options
  const [documents, setDocuments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  
  // State to store annotations
  const [annotations, setAnnotations] = useState([]);

  // State for dropdown options
  const [documentTypeOptions, setDocumentTypeOptions] = useState([
    "Report of RCT", 
    "Report of observational study"
  ]);
  
  const [entityTypeOptions, setEntityTypeOptions] = useState([
    "Outcome incl motivation, capability, behaviour", 
    "Intervention incl BCT, mode of delivery", 
    "Setting incl vehicle type", 
    "Methodology incl sample size", 
    "Participants incl type of journey"
  ]);
  
  const [confidenceOptions, setConfidenceOptions] = useState([
    "High", "Low", "Marginal"
  ]);
  
  const [entityValueDataTypeOptions, setEntityValueDataTypeOptions] = useState([
    "Absolute value", "Change score"
  ]);
  
  const [entityValueStatsTypeOptions, setEntityValueStatsTypeOptions] = useState([
    "Mean", "Percentage", "Regression coefficient (beta)", "Count", "Median"
  ]);
  
  const [entityValueDispersionTypeOptions, setEntityValueDispersionTypeOptions] = useState([
    "SD", "Variance"
  ]);

  // Modal states
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddOptionModal, setShowAddOptionModal] = useState({ field: null, value: '' });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState({ type: null, id: null });
  
  // New document/group states
  const [newDocument, setNewDocument] = useState({
    id: '',
    label: '',
    type: ''
  });
  
  const [newGroup, setNewGroup] = useState({
    id: '',
    name: ''
  });
  
  // Search/filter states for management tab
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocument, setFilterDocument] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Load all data from localStorage
  const loadAllData = () => {
    loadDocumentData();
    loadAnnotations();
    loadDropdownOptions();
  };
  
  // Load document data
  const loadDocumentData = () => {
    const savedData = localStorage.getItem('annotationDocuments');
    let docData = [];
    
    if (savedData) {
      docData = JSON.parse(savedData);
    } else {
      // Default data if nothing is saved
      docData = [
        {
          id: "155_2008_Van Nes",
          label: "Improving speed behaviour - the potential of in-car speed assistance and speed limit credibility",
          type: "Report of RCT",
          groups: [
            { id: 1, name: "Intelligent speed system" },
            { id: 2, name: "Intervention subgroup (Intelligent speed system + low credibility)" },
            { id: 3, name: "Intervention subgroup (Intelligent speed system + high credibility)" },
            { id: 100, name: "Control group" }
          ]
        },
        {
          id: "166_2010_Farmer",
          label: "Effects of in-vehicle monitoring on the driving behavior of teenagers",
          type: "Report of RCT",
          groups: [
            { id: 1, name: "Monitoring, alert and web notification" },
            { id: 2, name: "Monitoring, alert, no web" },
            { id: 3, name: "Monitoring only" },
            { id: 100, name: "Control group" }
          ]
        }
      ];
      
      // Save default data
      localStorage.setItem('annotationDocuments', JSON.stringify(docData));
    }
    
    // Sort documents by ID
    docData.sort((a, b) => a.id.localeCompare(b.id));
    setDocuments(docData);
  };
  
  // Load annotations
  const loadAnnotations = () => {
    const savedAnnotations = localStorage.getItem('annotations');
    
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  };
  
  // Load dropdown options
  const loadDropdownOptions = () => {
    const savedOptions = localStorage.getItem('dropdownOptions');
    
    if (savedOptions) {
      const options = JSON.parse(savedOptions);
      if (options.documentType) setDocumentTypeOptions(options.documentType);
      if (options.entityType) setEntityTypeOptions(options.entityType);
      if (options.confidence) setConfidenceOptions(options.confidence);
      if (options.entityValueDataType) setEntityValueDataTypeOptions(options.entityValueDataType);
      if (options.entityValueStatsType) setEntityValueStatsTypeOptions(options.entityValueStatsType);
      if (options.entityValueDispersionType) setEntityValueDispersionTypeOptions(options.entityValueDispersionType);
    }
  };
  
  // Save dropdown options
  const saveDropdownOptions = () => {
    const options = {
      documentType: documentTypeOptions,
      entityType: entityTypeOptions,
      confidence: confidenceOptions,
      entityValueDataType: entityValueDataTypeOptions,
      entityValueStatsType: entityValueStatsTypeOptions,
      entityValueDispersionType: entityValueDispersionTypeOptions
    };
    
    localStorage.setItem('dropdownOptions', JSON.stringify(options));
  };

  // Save documents to localStorage
  const saveDocuments = (docs) => {
    localStorage.setItem('annotationDocuments', JSON.stringify(docs));
  };
  
  // Save annotations to localStorage
  const saveAnnotations = (annots) => {
    localStorage.setItem('annotations', JSON.stringify(annots));
  };

  // Handle document selection
  const handleDocumentChange = (e) => {
    const selectedDocId = e.target.value;
    const selectedDoc = documents.find(doc => doc.id === selectedDocId);
    
    setCurrentDocument(selectedDoc);
    
    if (selectedDoc) {
      // Update form data with document details
      setFormData(prev => ({
        ...prev,
        documentId: selectedDoc.id,
        documentLabel: selectedDoc.label,
        documentType: selectedDoc.type,
        // Reset group-related fields
        groupId: '',
        groupName: ''
      }));
      
      // Update available groups for this document
      setGroups(selectedDoc.groups);
      setCurrentGroup(null);
    } else {
      // Clear form if no document is selected
      setFormData(prev => ({
        ...prev,
        documentId: '',
        documentLabel: '',
        documentType: '',
        groupId: '',
        groupName: ''
      }));
      setGroups([]);
      setCurrentGroup(null);
    }
  };

  // Handle group selection
  const handleGroupChange = (e) => {
    const selectedGroupId = parseInt(e.target.value);
    const selectedGroup = groups.find(group => group.id === selectedGroupId);
    
    setCurrentGroup(selectedGroup);
    
    if (selectedGroup) {
      // Update form data with group details
      setFormData(prev => ({
        ...prev,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name
      }));
    } else {
      // Clear group fields if no group is selected
      setFormData(prev => ({
        ...prev,
        groupId: '',
        groupName: ''
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle new document input changes
  const handleNewDocumentChange = (e) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new group input changes
  const handleNewGroupChange = (e) => {
    const { name, value } = e.target;
    setNewGroup(prev => ({
      ...prev,
      [name]: name === 'id' ? parseInt(value) || '' : value
    }));
  };

  // Add new document
  const handleAddDocument = () => {
    // Validate inputs
    if (!newDocument.id || !newDocument.label || !newDocument.type) {
      alert('Please fill in all document fields');
      return;
    }
    
    // Check if document ID already exists
    if (documents.some(doc => doc.id === newDocument.id)) {
      alert('A document with this ID already exists');
      return;
    }
    
    // Create new document object
    const newDoc = {
      id: newDocument.id,
      label: newDocument.label,
      type: newDocument.type,
      groups: []
    };
    
    // Add to documents list
    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
    
    // Select the newly created document
    setCurrentDocument(newDoc);
    setFormData(prev => ({
      ...prev,
      documentId: newDoc.id,
      documentLabel: newDoc.label,
      documentType: newDoc.type,
      groupId: '',
      groupName: ''
    }));
    setGroups([]);
    
    // Close modal and reset form
    setShowAddDocumentModal(false);
    setNewDocument({ id: '', label: '', type: '' });
  };

  // Add new group to current document
  const handleAddGroup = () => {
    // Validate inputs
    if (!currentDocument) {
      alert('Please select a document first');
      return;
    }
    
    if (!newGroup.id || !newGroup.name) {
      alert('Please fill in all group fields');
      return;
    }
    
    // Check if group ID already exists in this document
    if (groups.some(group => group.id === newGroup.id)) {
      alert('A group with this ID already exists in this document');
      return;
    }
    
    // Create new group
    const newGroupObj = {
      id: newGroup.id,
      name: newGroup.name
    };
    
    // Update groups for current document
    const updatedGroups = [...groups, newGroupObj];
    setGroups(updatedGroups);
    
    // Update document with new group
    const updatedDocuments = documents.map(doc => {
      if (doc.id === currentDocument.id) {
        return { ...doc, groups: updatedGroups };
      }
      return doc;
    });
    
    setDocuments(updatedDocuments);
    saveDocuments(updatedDocuments);
    
    // Select the newly created group
    setCurrentGroup(newGroupObj);
    setFormData(prev => ({
      ...prev,
      groupId: newGroupObj.id,
      groupName: newGroupObj.name
    }));
    
    // Close modal and reset form
    setShowAddGroupModal(false);
    setNewGroup({ id: '', name: '' });
  };

  // Delete a document
  const handleDeleteDocument = (docId) => {
    // Find document to confirm deletion
    const docToDelete = documents.find(doc => doc.id === docId);
    if (!docToDelete) return;
    
    // Show confirmation dialog
    setShowDeleteConfirmModal({
      type: 'document',
      id: docId,
      name: docToDelete.label
    });
  };
  
  // Confirm delete document
  const confirmDeleteDocument = () => {
    const docId = showDeleteConfirmModal.id;
    
    // Remove all annotations associated with this document
    const updatedAnnotations = annotations.filter(a => a.documentId !== docId);
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    // Remove document from list
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    saveDocuments(updatedDocuments);
    
    // If the current document is being deleted, reset form
    if (currentDocument && currentDocument.id === docId) {
      setCurrentDocument(null);
      setGroups([]);
      setCurrentGroup(null);
      setFormData(prev => ({
        ...prev,
        documentId: '',
        documentLabel: '',
        documentType: '',
        groupId: '',
        groupName: ''
      }));
    }
    
    // Close confirmation dialog
    setShowDeleteConfirmModal({ type: null, id: null });
  };
  
  // Delete a group
  const handleDeleteGroup = (docId, groupId) => {
    // Find document and group to confirm deletion
    const docWithGroup = documents.find(doc => doc.id === docId);
    if (!docWithGroup) return;
    
    const groupToDelete = docWithGroup.groups.find(g => g.id === groupId);
    if (!groupToDelete) return;
    
    // Show confirmation dialog
    setShowDeleteConfirmModal({
      type: 'group',
      id: { docId, groupId },
      name: groupToDelete.name,
      docName: docWithGroup.label
    });
  };
  
  // Confirm delete group
  const confirmDeleteGroup = () => {
    const { docId, groupId } = showDeleteConfirmModal.id;
    
    // Remove all annotations associated with this group
    const updatedAnnotations = annotations.filter(
      a => !(a.documentId === docId && a.groupId === groupId)
    );
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    // Remove group from document
    const updatedDocuments = documents.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          groups: doc.groups.filter(g => g.id !== groupId)
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocuments);
    saveDocuments(updatedDocuments);
    
    // If the current group is being deleted, reset group selection
    if (currentDocument && currentDocument.id === docId && 
        currentGroup && currentGroup.id === groupId) {
      setCurrentGroup(null);
      setFormData(prev => ({
        ...prev,
        groupId: '',
        groupName: ''
      }));
      
      // Update groups list for the current document
      const updatedGroups = currentDocument.groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
    }
    
    // Close confirmation dialog
    setShowDeleteConfirmModal({ type: null, id: null });
  };
  
  // Delete an annotation
  const handleDeleteAnnotation = (annotationId) => {
    // Find annotation to confirm deletion
    const annotToDelete = annotations.find(a => a.id === annotationId);
    if (!annotToDelete) return;
    
    // Show confirmation dialog
    setShowDeleteConfirmModal({
      type: 'annotation',
      id: annotationId,
      name: `${annotToDelete.documentId} - ${annotToDelete.entityLabel}`
    });
  };
  
  // Confirm delete annotation
  const confirmDeleteAnnotation = () => {
    const annotId = showDeleteConfirmModal.id;
    
    // Remove annotation from list
    const updatedAnnotations = annotations.filter(a => a.id !== annotId);
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    // Close confirmation dialog
    setShowDeleteConfirmModal({ type: null, id: null });
  };

  // Add new dropdown option
  const handleAddOption = () => {
    if (!showAddOptionModal.field || !showAddOptionModal.value) return;
    
    // Add new option to appropriate dropdown
    switch (showAddOptionModal.field) {
      case 'documentType':
        if (!documentTypeOptions.includes(showAddOptionModal.value)) {
          setDocumentTypeOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      case 'entityType':
        if (!entityTypeOptions.includes(showAddOptionModal.value)) {
          setEntityTypeOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      case 'confidence':
        if (!confidenceOptions.includes(showAddOptionModal.value)) {
          setConfidenceOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      case 'entityValueDataType':
        if (!entityValueDataTypeOptions.includes(showAddOptionModal.value)) {
          setEntityValueDataTypeOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      case 'entityValueStatsType':
        if (!entityValueStatsTypeOptions.includes(showAddOptionModal.value)) {
          setEntityValueStatsTypeOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      case 'entityValueDispersionType':
        if (!entityValueDispersionTypeOptions.includes(showAddOptionModal.value)) {
          setEntityValueDispersionTypeOptions(prev => [...prev, showAddOptionModal.value]);
        }
        break;
      default:
        break;
    }
    
    // Save updated options
    saveDropdownOptions();
    
    // Reset the add option state
    setShowAddOptionModal({ field: null, value: '' });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for required fields
    const requiredFields = ['documentId', 'groupId', 'entityType', 'confidence', 'entityLabel'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Generate a unique ID for the annotation if not editing
    let updatedAnnotations;
    
    if (isEditing) {
      // Update existing annotation
      updatedAnnotations = annotations.map(annot => 
        annot.id === formData.id ? { ...formData } : annot
      );
      
      alert('Annotation updated successfully!');
    } else {
      // Create new annotation with a unique ID
      const newAnnotation = {
        ...formData,
        id: `annotation_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      updatedAnnotations = [...annotations, newAnnotation];
      alert('Annotation saved successfully!');
    }
    
    // Update state and save to localStorage
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    // Reset form and editing state
    resetForm();
    setIsEditing(false);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      documentId: currentDocument ? currentDocument.id : '',
      documentLabel: currentDocument ? currentDocument.label : '',
      documentType: currentDocument ? currentDocument.type : '',
      groupId: currentGroup ? currentGroup.id : '',
      groupName: currentGroup ? currentGroup.name : '',
      entityType: '',
      confidence: '',
      entityLabel: '',
      entityDescription: '',
      revisedEntityLabel: '',
      revisedEntityDescription: '',
      effective: true,
      entityValue: '',
      entityValueDataType: '',
      entityValueStatsType: '',
      entityValueDispersion: '',
      entityValueDispersionType: '',
      entityValueUnitOfMeasurement: '',
      context: '',
      comment: '',
      person: '',
      questionsForRW: '',
      notes: ''
    });
  };
  
  // Edit an annotation
  const handleEditAnnotation = (annotationId) => {
    const annotationToEdit = annotations.find(a => a.id === annotationId);
    if (!annotationToEdit) return;
    
    // Set form data to the selected annotation
    setFormData(annotationToEdit);
    
    // Set current document and update groups
    const doc = documents.find(d => d.id === annotationToEdit.documentId);
    if (doc) {
      setCurrentDocument(doc);
      setGroups(doc.groups);
      
      // Set current group
      const group = doc.groups.find(g => g.id === annotationToEdit.groupId);
      if (group) {
        setCurrentGroup(group);
      }
    }
    
    // Set editing state
    setIsEditing(true);
    
    // Switch to create tab
    setActiveTab('create');
  };
  
  // Export annotations to Excel
  const exportToExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert annotations to worksheet data
    const wsData = annotations.map(a => ({
      "Document ID": a.documentId,
      "Document label": a.documentLabel,
      "Document type": a.documentType,
      "Group ID": a.groupId,
      "Group name": a.groupName,
      "Entity type": a.entityType,
      "Confidence": a.confidence,
      "Entity label": a.entityLabel,
      "Entity description": a.entityDescription,
      "Revised entity label": a.revisedEntityLabel,
      "Revised entity description": a.revisedEntityDescription,
      "Effective": a.effective ? 1 : 0,
      "Entity value": a.entityValue,
      "Entity value data type": a.entityValueDataType,
      "Entity value stats type": a.entityValueStatsType,
      "Entity value dispersion": a.entityValueDispersion,
      "Entity value dispersion type": a.entityValueDispersionType,
      "Entity value unit of measurement": a.entityValueUnitOfMeasurement,
      "Context": a.context,
      "Comment": a.comment,
      "Person": a.person,
      "Questions for RW": a.questionsForRW,
      "Notes": a.notes
    }));
    
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(wsData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Annotations");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "annotations_export.xlsx");
  };
  
  // Filter annotations based on search and filters
  const getFilteredAnnotations = () => {
    return annotations.filter(a => {
      // Apply document filter
      if (filterDocument && a.documentId !== filterDocument) return false;
      
      // Apply group filter
      if (filterGroup && a.groupId !== parseInt(filterGroup)) return false;
      
      // Apply search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          a.documentId.toLowerCase().includes(searchLower) ||
          a.documentLabel.toLowerCase().includes(searchLower) ||
          a.groupName.toLowerCase().includes(searchLower) ||
          a.entityLabel.toLowerCase().includes(searchLower) ||
          a.entityDescription.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Scientific Intervention Annotation System</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'create'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create/Edit Annotation
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Annotations
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'documents'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('documents')}
        >
          Manage Documents
        </button>
      </div>
      
      {/* Create/Edit Annotation Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {isEditing && (
            <div className="bg-yellow-100 p-4 rounded-md mb-4">
              <p className="font-medium text-yellow-800">
                Editing annotation: {formData.documentId} - {formData.entityLabel}
              </p>
              <button 
                type="button"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
                className="mt-2 text-sm text-yellow-800 underline"
              >
                Cancel editing
              </button>
            </div>
          )}
          
          {/* Document Selection */}
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-700">Document Information</h2>
              <button 
                type="button"
                onClick={() => setShowAddDocumentModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add New Document
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Document ID:</label>
                <select 
                  name="documentId"
                  value={formData.documentId} 
                  onChange={handleDocumentChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isEditing}
                >
                  <option value="">Select a document</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.id}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Document Type:</label>
                <div className="flex">
                  <select 
                    name="documentType"
                    value={formData.documentType} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isEditing}
                  >
                    <option value="">Select document type</option>
                    {documentTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'documentType', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    disabled={isEditing}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block mb-2 font-medium">Document Label:</label>
              <input 
                type="text"
                name="documentLabel"
                value={formData.documentLabel} 
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isEditing}
              />
            </div>
          </div>
          
          {/* Group Selection */}
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-700">Group Information</h2>
              <button 
                type="button"
                onClick={() => setShowAddGroupModal(true)}
                disabled={!currentDocument || isEditing}
                className={`px-3 py-2 rounded-md ${
                  currentDocument && !isEditing
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add New Group
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Group ID:</label>
                <select 
                  name="groupId"
                  value={formData.groupId} 
                  onChange={handleGroupChange}
                  disabled={!formData.documentId || isEditing}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.id}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Group Name:</label>
                <input 
                  type="text"
                  name="groupName"
                  value={formData.groupName} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isEditing}
                />
              </div>
            </div>
          </div>
          
          {/* Entity Information */}
          <div className="bg-purple-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">Entity Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Entity Type:</label>
                <div className="flex">
                  <select 
                    name="entityType"
                    value={formData.entityType} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select entity type</option>
                    {entityTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'entityType', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Confidence:</label>
                <div className="flex">
                  <select 
                    name="confidence"
                    value={formData.confidence} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select confidence level</option>
                    {confidenceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'confidence', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Entity Label:</label>
                <input 
                  type="text"
                  name="entityLabel"
                  value={formData.entityLabel} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., average driving speed"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Entity Description:</label>
                <textarea 
                  name="entityDescription"
                  value={formData.entityDescription} 
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe the entity in detail"
                ></textarea>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Revised Entity Label:</label>
                <input 
                  type="text"
                  name="revisedEntityLabel"
                  value={formData.revisedEntityLabel} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Effective:</label>
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    name="effective"
                    checked={formData.effective} 
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2">Yes, this entity represents an effective intervention</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Revised Entity Description:</label>
              <textarea 
                name="revisedEntityDescription"
                value={formData.revisedEntityDescription} 
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
          
          {/* Entity Value Information */}
          <div className="bg-yellow-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-yellow-700">Entity Value Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Entity Value:</label>
                <input 
                  type="text"
                  name="entityValue"
                  value={formData.entityValue} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 78"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Entity Value Data Type:</label>
                <div className="flex">
                  <select 
                    name="entityValueDataType"
                    value={formData.entityValueDataType} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select data type</option>
                    {entityValueDataTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'entityValueDataType', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Entity Value Stats Type:</label>
                <div className="flex">
                  <select 
                    name="entityValueStatsType"
                    value={formData.entityValueStatsType} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select stats type</option>
                    {entityValueStatsTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'entityValueStatsType', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Entity Value Dispersion:</label>
                <input 
                  type="text"
                  name="entityValueDispersion"
                  value={formData.entityValueDispersion} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 5.2"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Entity Value Dispersion Type:</label>
                <div className="flex">
                  <select 
                    name="entityValueDispersionType"
                    value={formData.entityValueDispersionType} 
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select dispersion type</option>
                    {entityValueDispersionTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddOptionModal({ field: 'entityValueDispersionType', value: '' })}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Unit of Measurement:</label>
                <input 
                  type="text"
                  name="entityValueUnitOfMeasurement"
                  value={formData.entityValueUnitOfMeasurement} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., km/h"
                />
              </div>
            </div>
          </div>
          
          {/* Context and Additional Information */}
          <div className="bg-red-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Context and Additional Information</h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Context:</label>
              <textarea 
                name="context"
                value={formData.context} 
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Add relevant context from the document"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Comment:</label>
              <textarea 
                name="comment"
                value={formData.comment} 
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Add any comments"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Person:</label>
                <input 
                  type="text"
                  name="person"
                  value={formData.person} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Your initials"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Questions for RW:</label>
                <input 
                  type="text"
                  name="questionsForRW"
                  value={formData.questionsForRW} 
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block mb-2 font-medium">Notes relating to questions for RW:</label>
              <textarea 
                name="notes"
                value={formData.notes} 
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isEditing ? 'Update Annotation' : 'Save Annotation'}
            </button>
          </div>
        </form>
      )}
      
      {/* Manage Annotations */}
      {activeTab === 'manage' && (
        <div>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Annotation Management</h2>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={annotations.length === 0}
              >
                Export to Excel
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <h3 className="font-medium mb-3">Search and Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search annotations..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm">Filter by Document:</label>
                <select
                  value={filterDocument}
                  onChange={e => setFilterDocument(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Documents</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.id}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm">Filter by Group:</label>
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!filterDocument}
                >
                  <option value="">All Groups</option>
                  {filterDocument && 
                    documents.find(d => d.id === filterDocument)?.groups.map(group => (
                      <option key={group.id} value={group.id}>{group.id} - {group.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
          
          {/* Annotations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 uppercase">Document</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 uppercase">Group</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 uppercase">Entity Label</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 uppercase">Entity Type</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredAnnotations().length > 0 ? (
                  getFilteredAnnotations().map(annotation => (
                    <tr key={annotation.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="text-sm font-medium">{annotation.documentId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-sm">{annotation.groupName}</div>
                        <div className="text-xs text-gray-500">ID: {annotation.groupId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-sm">{annotation.entityLabel}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-sm">{annotation.entityType}</div>
                        <div className="text-xs text-gray-500">Confidence: {annotation.confidence}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAnnotation(annotation.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAnnotation(annotation.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-3 text-center text-gray-500">
                      No annotations found. {searchTerm || filterDocument || filterGroup ? 'Try adjusting your search or filters.' : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Manage Documents */}
      {activeTab === 'documents' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Document Management</h2>
            
            <button
              type="button"
              onClick={() => setShowAddDocumentModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add New Document
            </button>
          </div>
          
          {/* Documents and Groups */}
          <div className="space-y-6">
            {documents.length > 0 ? (
              documents.map(document => (
                <div key={document.id} className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">{document.id}</h3>
                      <p className="text-gray-600">{document.label}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-200 text-xs rounded">
                        {document.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete Document
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Groups</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentDocument(document);
                          setGroups(document.groups);
                          setShowAddGroupModal(true);
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Add Group
                      </button>
                    </div>
                    
                    {document.groups.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">ID</th>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Name</th>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {document.groups.map(group => (
                              <tr key={group.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 text-sm">{group.id}</td>
                                <td className="py-2 px-3 text-sm">{group.name}</td>
                                <td className="py-2 px-3">
                                  <button
                                    onClick={() => handleDeleteGroup(document.id, group.id)}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No groups added to this document yet.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No documents found. Add a new document to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Document ID:</label>
                <input 
                  type="text"
                  name="id"
                  value={newDocument.id}
                  onChange={handleNewDocumentChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 155_2008_Van Nes"
                />
              </div>
              
              <div>
                <label className="block mb-1">Document Label:</label>
                <input 
                  type="text"
                  name="label"
                  value={newDocument.label}
                  onChange={handleNewDocumentChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Document title"
                />
              </div>
              
              <div>
                <label className="block mb-1">Document Type:</label>
                <select 
                  name="type"
                  value={newDocument.type}
                  onChange={handleNewDocumentChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select document type</option>
                  {documentTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setShowAddDocumentModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Document
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Group to {currentDocument?.id}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Group ID (number):</label>
                <input 
                  type="number"
                  name="id"
                  value={newGroup.id}
                  onChange={handleNewGroupChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 1, 2, 100"
                />
              </div>
              
              <div>
                <label className="block mb-1">Group Name:</label>
                <input 
                  type="text"
                  name="name"
                  value={newGroup.name}
                  onChange={handleNewGroupChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Control group"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddGroup}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Group
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Option Modal */}
      {showAddOptionModal.field && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Option</h3>
            <div className="mb-4">
              <label className="block mb-2">New value for {showAddOptionModal.field}:</label>
              <input 
                type="text"
                value={showAddOptionModal.value}
                onChange={(e) => setShowAddOptionModal(prev => ({ ...prev, value: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddOptionModal({ field: null, value: '' })}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Confirm Delete</h3>
            
            {showDeleteConfirmModal.type === 'document' && (
              <p className="mb-4">
                Are you sure you want to delete the document "{showDeleteConfirmModal.name}"? This will also delete all
                associated groups and annotations. This action cannot be undone.
              </p>
            )}
            
            {showDeleteConfirmModal.type === 'group' && (
              <p className="mb-4">
                Are you sure you want to delete the group "{showDeleteConfirmModal.name}" from document "{showDeleteConfirmModal.docName}"? 
                This will also delete all associated annotations. This action cannot be undone.
              </p>
            )}
            
            {showDeleteConfirmModal.type === 'annotation' && (
              <p className="mb-4">
                Are you sure you want to delete the annotation "{showDeleteConfirmModal.name}"? 
                This action cannot be undone.
              </p>
            )}
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal({ type: null, id: null })}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (showDeleteConfirmModal.type === 'document') {
                    confirmDeleteDocument();
                  } else if (showDeleteConfirmModal.type === 'group') {
                    confirmDeleteGroup();
                  } else if (showDeleteConfirmModal.type === 'annotation') {
                    confirmDeleteAnnotation();
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationSystem;
