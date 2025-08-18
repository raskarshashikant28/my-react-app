import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchAllUsers, saveUserGlobally, deleteUserGlobally, updateUserGlobally } from './globalDB';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Property Identification
    gridNo: '',
    mapId: '',
    prabhagNo: '',
    zoneNo: '',
    wardNo: '',
    photoId1: null,
    photoId2: null,
    propertyTaxPaid: '',
    junaNo: '',
    assessmentYear: '2024-2025',
    oldAssessmentYear: '',
    latitude: '',
    longitude: '',
    surveyNo: '',
    plotNo: '',
    buildingName: '',
    blockNo: '',
    locality: '',
    subLocality: '',
    streetName: '',
    pincode: '',
    
    // Ownership & Property Type
    typeOfOwner: '',
    natureOfProperty: [],
    categoryOfProperty: '',
    propertyOwnerName: '',
    mobileNo: '',
    renterName: '',
    landlineNo: '',
    uidNo: '',
    emailId: '',
    plotArea: '',
    totalFloors: '',
    currentFloor: '',
    areaClassification: [],
    presentStatus: '',
    
    // Usage of Property
    usageOfProperty: '',
    usageSubType: '',
    constructionType: '',
    builtUpArea: '',
    yearOfConstruction: '',
    typeOfConstruction: '',
    useType: '',
    estimatedValue: '',
    parking: false,
    basement: false,
    
    // Floor Details
    floors: [
      { name: 'Ground Floor', rcc: false, loadBearing: false, shade: false }
    ],
    
    // Civic Amenities
    supplyWater: false,
    waterConnection: false,
    tapSize: '',
    tapConsumption: '',
    msedcolNo: '',
    drainageLine: false,
    vermicomposting: false,
    rainwaterHarvesting: false,
    solarFacilities: false,
    noOfSeats: '',
    
    // Remarks & Signature
    remarks: '',
    respondentName: '',
    respondentSign: null,
    surveyorName: '',
    checkedBy: '',
    checkedDate: '',
    completionDate: new Date().toISOString().split('T')[0]
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(null);
  const [showDetailView, setShowDetailView] = useState(null);
  const [language, setLanguage] = useState('en');
  const [deletePassword, setDeletePassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const texts = {
    en: {
      welcome: 'Property Survey App',
      description: 'Complete property surveys and view all survey data',
      home: 'Home',
      survey: 'Survey',
      list: 'List',
      submit: 'Submit Survey',
      update: 'Update Survey',
      cancel: 'Cancel',
      next: 'Next',
      previous: 'Previous',
      deleteConfirm: 'Are you sure you want to delete this survey?',
      deleteTitle: 'Delete Survey',
      yes: 'Yes, Delete',
      no: 'Cancel'
    },
    mr: {
      welcome: 'मालमत्ता सर्वेक्षण अॅप',
      description: 'मालमत्ता सर्वेक्षण पूर्ण करा आणि सर्व सर्वेक्षण डेटा पहा',
      home: 'होम',
      survey: 'सर्वेक्षण',
      list: 'यादी',
      submit: 'सर्वेक्षण सबमिट करा',
      update: 'सर्वेक्षण अपडेट करा',
      cancel: 'रद्द करा',
      next: 'पुढे',
      previous: 'मागे',
      deleteConfirm: 'तुम्हाला खात्री आहे की तुम्ही हे सर्वेक्षण हटवू इच्छिता?',
      deleteTitle: 'सर्वेक्षण हटवा',
      yes: 'होय, हटवा',
      no: 'रद्द करा'
    }
  };

  const t = texts[language];

  const sections = [
    'Property Identification',
    'Ownership & Property Type', 
    'Usage of Property',
    'Civic Amenities',
    'Remarks & Signature'
  ];

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize image to max 400x300 to reduce size significantly
        const maxWidth = 400;
        const maxHeight = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with low quality to reduce size
        const base64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(base64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files[0]) {
      try {
        const base64 = await convertToBase64(files[0]);
        setFormData(prev => ({ ...prev, [name]: base64 }));
      } catch (error) {
        console.error('Error converting file:', error);
      }
    } else if (type === 'checkbox') {
      if (name === 'natureOfProperty' || name === 'areaClassification') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFloorChange = (index, field, checked) => {
    setFormData(prev => ({
      ...prev,
      floors: prev.floors.map((floor, i) => 
        i === index ? { ...floor, [field]: checked } : floor
      )
    }));
  };

  const addFloor = () => {
    const floorNumber = formData.floors.length;
    const floorName = floorNumber === 0 ? 'Ground Floor' : `${floorNumber}${floorNumber === 1 ? 'st' : floorNumber === 2 ? 'nd' : floorNumber === 3 ? 'rd' : 'th'} Floor`;
    
    setFormData(prev => ({
      ...prev,
      floors: [...prev.floors, { name: floorName, rcc: false, loadBearing: false, shade: false }]
    }));
  };

  const removeFloor = (index) => {
    if (formData.floors.length > 1) {
      setFormData(prev => ({
        ...prev,
        floors: prev.floors.filter((_, i) => i !== index)
      }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await fetchAllUsers();
      if (users && users.length >= 0) {
        setUsers(users);
        console.log('✅ Fetched users:', users.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Keep existing users on error - don't clear them
      console.log('⚠️ Keeping existing users due to fetch error');
    }
  };

  const saveUser = async (userData) => {
    return await saveUserGlobally(userData);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(user);
    setCurrentSection(0);
    setActiveTab('form');
  };

  const handleViewDetails = (user) => {
    setShowDetailView(user);
  };

  const generatePDF = () => {
    if (!showDetailView) return;
    
    try {
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print function not available');
    }
  };

  const downloadPDF = () => {
    generatePDF();
  };

  const handleDelete = async (user) => {
    setShowDeletePopup(user);
  };

  const confirmDelete = async () => {
    if (showDeletePopup) {
      // Check if password matches survey number or grid number
      if (deletePassword !== showDeletePopup.surveyNo && deletePassword !== showDeletePopup.gridNo) {
        alert('Incorrect survey number. Please enter the correct survey number or grid number.');
        return;
      }
      
      setLoading(true);
      await deleteUserGlobally(showDeletePopup.id);
      const updatedUsers = users.filter(u => u.id !== showDeletePopup.id);
      setUsers(updatedUsers);
      setShowDeletePopup(null);
      setDeletePassword('');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow explicit submit button clicks
    if (!isSubmitting) {
      console.log('Form submission blocked - not from submit button');
      return;
    }
    
    if (formData.gridNo && formData.propertyOwnerName) {
      setLoading(true);
      
      try {
        if (editingUser) {
          await updateUserGlobally(editingUser.id, formData);
          const updatedUsers = users.map(user => 
            user.id === editingUser.id ? { ...user, ...formData } : user
          );
          setUsers(updatedUsers);
          setEditingUser(null);
        } else {
          const newUser = await saveUser(formData);
          setUsers([...users, newUser]);
        }
        
        // Reset form
        setFormData({
          gridNo: '', mapId: '', prabhagNo: '', zoneNo: '', wardNo: '',
          photoId1: null, photoId2: null, propertyTaxPaid: '', junaNo: '',
          assessmentYear: '2024-2025', oldAssessmentYear: '', latitude: '', longitude: '',
          surveyNo: '', plotNo: '', buildingName: '', blockNo: '', locality: '',
          subLocality: '', streetName: '', pincode: '', typeOfOwner: '',
          natureOfProperty: [], categoryOfProperty: '', propertyOwnerName: '',
          mobileNo: '', renterName: '', landlineNo: '', uidNo: '', emailId: '',
          plotArea: '', totalFloors: '', currentFloor: '', areaClassification: [],
          presentStatus: '', usageOfProperty: '', usageSubType: '', constructionType: '',
          builtUpArea: '', yearOfConstruction: '', typeOfConstruction: '', useType: '',
          estimatedValue: '', parking: false, basement: false,
          floors: [{ name: 'Ground Floor', rcc: false, loadBearing: false, shade: false }],
          supplyWater: false, waterConnection: false, tapSize: '', tapConsumption: '',
          msedcolNo: '', drainageLine: false, vermicomposting: false, rainwaterHarvesting: false,
          solarFacilities: false, noOfSeats: '', remarks: '', respondentName: '',
          respondentSign: null, surveyorName: '', checkedBy: '', checkedDate: ''
        });
        setCurrentSection(0);
        setActiveTab('view');
      } catch (error) {
        console.error('Error saving survey:', error);
        alert('Error saving survey. Please try again.');
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
    }
  };

  const renderSection = () => {
    switch(currentSection) {
      case 0: // Property Identification
        return (
          <div className="form-section">
            <h3>Property Identification</h3>
            
            <div className="form-group">
              <label>Grid No *</label>
              <input type="text" name="gridNo" value={formData.gridNo} onChange={handleInputChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Photo ID No-1</label>
                <input type="file" name="photoId1" accept="image/*" capture="camera" onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Photo ID No-2</label>
                <input type="file" name="photoId2" accept="image/*" capture="camera" onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Locality/Village Name</label>
              <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} placeholder="Enter locality or village name" />
            </div>

            <div className="form-group">
              <label>Location Coordinates</label>
              <div className="location-group">
                <input type="text" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleInputChange} />
                <input type="text" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleInputChange} />
                <button type="button" onClick={getCurrentLocation} className="location-btn">📍 Get Location</button>
              </div>
            </div>

            {/* Commented out fields - available in full form */}
            {/*
            <div className="form-group">
              <label>Map Id/GIS ID</label>
              <input type="text" name="mapId" value={formData.mapId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Prabhag No</label>
              <input type="text" name="prabhagNo" value={formData.prabhagNo} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Zone No</label>
              <input type="text" name="zoneNo" value={formData.zoneNo} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Ward No</label>
              <input type="text" name="wardNo" value={formData.wardNo} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Property Tax Paid</label>
              <div className="radio-group">
                <label><input type="radio" name="propertyTaxPaid" value="Yes" checked={formData.propertyTaxPaid === 'Yes'} onChange={handleInputChange} /> Yes</label>
                <label><input type="radio" name="propertyTaxPaid" value="No" checked={formData.propertyTaxPaid === 'No'} onChange={handleInputChange} /> No</label>
              </div>
            </div>
            <div className="form-group">
              <label>Survey No</label>
              <input type="text" name="surveyNo" value={formData.surveyNo} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Plot No / Shop No / Flat No</label>
              <input type="text" name="plotNo" value={formData.plotNo} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Locality/Village Name</label>
              <input type="text" name="locality" value={formData.locality} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Pin Code</label>
              <input type="number" name="pincode" value={formData.pincode} onChange={handleInputChange} />
            </div>
            */}
          </div>
        );

      case 1: // Ownership & Property Type
        return (
          <div className="form-section">
            <h3>Ownership & Property Type</h3>
            
            <div className="form-group">
              <label>Property Owner Name *</label>
              <input type="text" name="propertyOwnerName" value={formData.propertyOwnerName} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Mobile No</label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Type of Owner</label>
              <div className="radio-group">
                {['Private', 'Public', 'State Govt', 'Central Govt'].map(type => (
                  <label key={type}>
                    <input type="radio" name="typeOfOwner" value={type} checked={formData.typeOfOwner === type} onChange={handleInputChange} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Commented out fields - available in full form */}
            {/*
            <div className="form-group">
              <label>Nature of Property</label>
              <div className="checkbox-group">
                {['Apartments', 'Row House', 'Bungalow', 'Commercial', 'Industrial'].map(nature => (
                  <label key={nature}>
                    <input type="checkbox" name="natureOfProperty" value={nature} checked={formData.natureOfProperty.includes(nature)} onChange={handleInputChange} />
                    {nature}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Category of Property</label>
              <div className="radio-group">
                {['Owner', 'Occupier', 'Lease', 'Rent'].map(category => (
                  <label key={category}>
                    <input type="radio" name="categoryOfProperty" value={category} checked={formData.categoryOfProperty === category} onChange={handleInputChange} />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Email ID</label>
              <input type="email" name="emailId" value={formData.emailId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Plot Area (Sq. M)</label>
              <input type="number" name="plotArea" value={formData.plotArea} onChange={handleInputChange} />
            </div>
            */}
          </div>
        );

      case 2: // Usage of Property
        return (
          <div className="form-section">
            <h3>Usage of Property</h3>
            
            <div className="form-group">
              <label>Usage of Property</label>
              <div className="radio-group">
                {['Residential', 'Commercial', 'Mixed', 'Industrial'].map(usage => (
                  <label key={usage}>
                    <input type="radio" name="usageOfProperty" value={usage} checked={formData.usageOfProperty === usage} onChange={handleInputChange} />
                    {usage}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Built-up Area (Sq.M)</label>
              <input type="number" name="builtUpArea" value={formData.builtUpArea} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Year of Construction</label>
              <input type="number" name="yearOfConstruction" value={formData.yearOfConstruction} onChange={handleInputChange} />
            </div>

            {/* Commented out fields - available in full form */}
            {/*
            <div className="form-group">
              <label>Usage Sub Type</label>
              <select name="usageSubType" value={formData.usageSubType} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Hospital">Hospital</option>
                <option value="Hall">Hall</option>
                <option value="Shop">Shop</option>
                <option value="Office">Office</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type of Construction</label>
              <select name="typeOfConstruction" value={formData.typeOfConstruction} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="RCC">RCC</option>
                <option value="Load Bearing">Load Bearing</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            */}
          </div>
        );

      case 3: // Civic Amenities
        return (
          <div className="form-section">
            <h3>Civic Amenities</h3>
            
            <div className="form-group">
              <label>Water Supply</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" name="supplyWater" checked={formData.supplyWater} onChange={handleInputChange} />
                  Supply Water
                </label>
                <label>
                  <input type="checkbox" name="waterConnection" checked={formData.waterConnection} onChange={handleInputChange} />
                  Water Connection
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Drainage & Environment</label>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" name="drainageLine" checked={formData.drainageLine} onChange={handleInputChange} />
                  Drainage line / Septic Tank
                </label>
                <label>
                  <input type="checkbox" name="solarFacilities" checked={formData.solarFacilities} onChange={handleInputChange} />
                  Solar Electric Facilities
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>MSEDCOL No</label>
              <input type="text" name="msedcolNo" value={formData.msedcolNo} onChange={handleInputChange} />
            </div>

            {/* Commented out fields - available in full form */}
            {/*
            <div className="form-group">
              <label>Tap Size</label>
              <select name="tapSize" value={formData.tapSize} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="0.5">0.5"</option>
                <option value="0.75">0.75"</option>
                <option value="1">1"</option>
              </select>
            </div>
            */}
          </div>
        );

      case 4: // Remarks & Signature
        return (
          <div className="form-section">
            <h3>Remarks & Signature</h3>
            
            <div className="form-group">
              <label>Remarks</label>
              <select name="remarks" value={formData.remarks} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Open Plot">Open Plot</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
                <option value="Demolished">Demolished</option>
              </select>
            </div>

            <div className="form-group">
              <label>Surveyor Name</label>
              <input type="text" name="surveyorName" value={formData.surveyorName} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Sign of Respondent</label>
              <input type="file" name="respondentSign" accept="image/*" capture="camera" onChange={handleInputChange} />
            </div>

            {/* Commented out fields - available in full form */}
            {/*
            <div className="form-group">
              <label>Name of Respondent</label>
              <input type="text" name="respondentName" value={formData.respondentName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Checked By</label>
              <input type="text" name="checkedBy" value={formData.checkedBy} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Checked Date</label>
              <input type="date" name="checkedDate" value={formData.checkedDate} onChange={handleInputChange} />
            </div>
            */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🏠 Property Survey</h1>
          <div className="language-toggle">
            <button 
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button 
              className={language === 'mr' ? 'active' : ''}
              onClick={() => setLanguage('mr')}
            >
              मराठी
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <div className="welcome-content">
              <div className="app-icon">🏠</div>
              <h1>{t.welcome}</h1>
              <p>{t.description}</p>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Total Surveys</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">🌍</span>
                  <span className="stat-label">Global Data</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="survey-form">
            <div className="section-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${((currentSection + 1) / sections.length) * 100}%`}}></div>
              </div>
              <p>Section {currentSection + 1} of {sections.length}: {sections[currentSection]}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {renderSection()}
              
              <div className="form-navigation">
                {currentSection > 0 && (
                  <button type="button" onClick={() => setCurrentSection(currentSection - 1)} className="nav-btn-form prev">
                    {t.previous}
                  </button>
                )}
                
                {currentSection < sections.length - 1 ? (
                  <button type="button" onClick={() => setCurrentSection(currentSection + 1)} className="nav-btn-form next">
                    {t.next}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="submit-btn"
                    onClick={() => setIsSubmitting(true)}
                  >
                    {loading ? '⏳' : (editingUser ? t.update : t.submit)}
                  </button>
                )}
              </div>

              {editingUser && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingUser(null);
                    setCurrentSection(0);
                    setFormData({
                      gridNo: '', mapId: '', prabhagNo: '', zoneNo: '', wardNo: '',
                      photoId1: null, photoId2: null, propertyTaxPaid: '', junaNo: '',
                      assessmentYear: '2024-2025', oldAssessmentYear: '', latitude: '', longitude: '',
                      surveyNo: '', plotNo: '', buildingName: '', blockNo: '', locality: '',
                      subLocality: '', streetName: '', pincode: '', typeOfOwner: '',
                      natureOfProperty: [], categoryOfProperty: '', propertyOwnerName: '',
                      mobileNo: '', renterName: '', landlineNo: '', uidNo: '', emailId: '',
                      plotArea: '', totalFloors: '', currentFloor: '', areaClassification: [],
                      presentStatus: '', usageOfProperty: '', usageSubType: '', constructionType: '',
                      builtUpArea: '', yearOfConstruction: '', typeOfConstruction: '', useType: '',
                      estimatedValue: '', parking: false, basement: false,
                      floors: [{ name: 'Ground Floor', rcc: false, loadBearing: false, shade: false }],
                      supplyWater: false, waterConnection: false, tapSize: '', tapConsumption: '',
                      msedcolNo: '', drainageLine: false, vermicomposting: false, rainwaterHarvesting: false,
                      solarFacilities: false, noOfSeats: '', remarks: '', respondentName: '',
                      respondentSign: null, surveyorName: '', checkedBy: '', checkedDate: ''
                    });
                  }}
                  className="cancel-btn-form"
                >
                  {t.cancel}
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <div className="view-header">
              <h2>Survey Data</h2>
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search by name or survey number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <span onClick={async () => {
                if (loading) return; // Prevent multiple clicks
                setLoading(true);
                try {
                  const currentUsers = [...users]; // Backup current users
                  await fetchUsers();
                  console.log('✅ Refresh completed successfully');
                } catch (error) {
                  console.error('Refresh failed:', error);
                  // Users are already preserved in fetchUsers function
                } finally {
                  setLoading(false);
                }
              }} className="refresh-icon" title="Refresh">
                {loading ? '⏳' : '🔄'}
              </span>
            </div>
            {users.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📝</div>
                <p>No surveys completed yet</p>
                <p><small>Start your first property survey!</small></p>
              </div>
            ) : (
              <div className="user-list">
                {users.filter(user => 
                  user.propertyOwnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.surveyNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.gridNo?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(user => (
                  <div key={user.id} className="survey-card clickable" onClick={() => handleViewDetails(user)}>
                    <div className="survey-info">
                      <div className="survey-status">
                        <span className="grid-badge">Grid: {user.gridNo}</span>
                        {user.assessmentYear && <span className="year-badge">{user.assessmentYear}</span>}
                      </div>
                      <div className="survey-header">
                        <h3>Survey: {user.surveyNo || user.gridNo}</h3>
                        <div className="survey-actions" onClick={(e) => e.stopPropagation()}>
                          <span onClick={() => handleEdit(user)} className="edit-icon" title="Edit">
                            ✏️
                          </span>
                          <span onClick={() => handleDelete(user)} className="delete-icon" title="Delete">
                            🗑️
                          </span>
                        </div>
                      </div>
                      <div className="survey-details">
                        <div className="detail-row">
                          <span className="detail-label">🏠 Owner:</span>
                          <span className="detail-value">{user.propertyOwnerName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📱 Mobile:</span>
                          <span className="detail-value">{user.mobileNo}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📍 Location:</span>
                          <span className="detail-value">{user.locality || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">📅 Completed:</span>
                          <span className="detail-value">{user.completionDate || 'N/A'}</span>
                        </div>
                      </div>
                      {(user.photoId1 || user.photoId2) && (
                        <div className="survey-images">
                          <div className="image-row">
                            <div className="image-half">
                              {user.photoId1 ? (
                                <img 
                                  src={user.photoId1} 
                                  alt="Property Photo 1" 
                                  className="survey-image-half"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {user.photoId1 && <div className="survey-image-fallback-half">📷</div>}
                            </div>
                            <div className="image-half">
                              {user.photoId2 ? (
                                <img 
                                  src={user.photoId2} 
                                  alt="Property Photo 2" 
                                  className="survey-image-half"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {user.photoId2 && <div className="survey-image-fallback-half">📷</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} 
          onClick={() => setActiveTab('home')}
        >
          <span className="icon">🏠</span>
          <span className="label">{t.home}</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`} 
          onClick={() => setActiveTab('form')}
        >
          <span className="icon">📝</span>
          <span className="label">{t.survey}</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          <span className="icon">📊</span>
          <span className="label">{t.list}</span>
        </button>
      </nav>

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h3>{t.deleteTitle}</h3>
            </div>
            <div className="popup-content">
              <p>{t.deleteConfirm}</p>
              <p><strong>Survey: {showDeletePopup.surveyNo || showDeletePopup.gridNo}</strong></p>
              <div className="password-input">
                <label>Enter Survey Number to confirm:</label>
                <input 
                  type="text" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Survey Number or Grid Number"
                  className="delete-password-input"
                />
              </div>
            </div>
            <div className="popup-actions">
              <button onClick={() => {
                setShowDeletePopup(null);
                setDeletePassword('');
              }} className="cancel-btn">
                {t.no}
              </button>
              <button onClick={confirmDelete} className="delete-btn" disabled={loading}>
                {loading ? '⏳' : t.yes}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailView && (
        <div className="popup-overlay detail-overlay">
          <div className="detail-popup">
            <div className="detail-header">
              <h3>Property Survey Details</h3>
              <div className="detail-actions">
                <button onClick={downloadPDF} className="pdf-btn">📄 Print/PDF</button>
                <button onClick={() => setShowDetailView(null)} className="close-btn">✕</button>
              </div>
            </div>
            <div className="detail-content" id="detail-view-content">
              <div className="detail-section">
                <h4>Property Identification</h4>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Grid No:</strong> {showDetailView.gridNo}</div>
                  <div className="detail-item"><strong>Map ID:</strong> {showDetailView.mapId}</div>
                  <div className="detail-item"><strong>Prabhag No:</strong> {showDetailView.prabhagNo}</div>
                  <div className="detail-item"><strong>Zone No:</strong> {showDetailView.zoneNo}</div>
                  <div className="detail-item"><strong>Ward No:</strong> {showDetailView.wardNo}</div>
                  <div className="detail-item"><strong>Property Tax Paid:</strong> {showDetailView.propertyTaxPaid}</div>
                  <div className="detail-item"><strong>Assessment Year:</strong> {showDetailView.assessmentYear}</div>
                  <div className="detail-item"><strong>Location:</strong> {showDetailView.latitude || 'N/A'}, {showDetailView.longitude || 'N/A'}</div>
                  <div className="detail-item"><strong>Survey No:</strong> {showDetailView.surveyNo}</div>
                  <div className="detail-item"><strong>Plot No:</strong> {showDetailView.plotNo}</div>
                  <div className="detail-item"><strong>Building Name:</strong> {showDetailView.buildingName}</div>
                  <div className="detail-item"><strong>Locality:</strong> {showDetailView.locality}</div>
                  <div className="detail-item"><strong>Street:</strong> {showDetailView.streetName}</div>
                  <div className="detail-item"><strong>Pin Code:</strong> {showDetailView.pincode}</div>
                </div>
              </div>

              {(showDetailView.photoId1 || showDetailView.photoId2) && (
                <div className="detail-section">
                  <h4>Property Photos</h4>
                  <div className="detail-images">
                    {showDetailView.photoId1 && (
                      <div className="detail-image">
                        <img 
                          src={showDetailView.photoId1} 
                          alt="Property Photo 1" 
                          className="detail-photo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="photo-placeholder" style={{display: 'none'}}>📷 Photo 1</div>
                        <p>Photo ID 1</p>
                      </div>
                    )}
                    {showDetailView.photoId2 && (
                      <div className="detail-image">
                        <img 
                          src={showDetailView.photoId2} 
                          alt="Property Photo 2" 
                          className="detail-photo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="photo-placeholder" style={{display: 'none'}}>📷 Photo 2</div>
                        <p>Photo ID 2</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Ownership & Property Type</h4>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Type of Owner:</strong> {showDetailView.typeOfOwner}</div>
                  <div className="detail-item"><strong>Nature of Property:</strong> {showDetailView.natureOfProperty?.join(', ') || 'N/A'}</div>
                  <div className="detail-item"><strong>Category:</strong> {showDetailView.categoryOfProperty}</div>
                  <div className="detail-item"><strong>Owner Name:</strong> {showDetailView.propertyOwnerName}</div>
                  <div className="detail-item"><strong>Mobile:</strong> {showDetailView.mobileNo}</div>
                  <div className="detail-item"><strong>Email:</strong> {showDetailView.emailId}</div>
                  <div className="detail-item"><strong>Plot Area:</strong> {showDetailView.plotArea} Sq.M</div>
                  <div className="detail-item"><strong>Total Floors:</strong> {showDetailView.totalFloors}</div>
                  <div className="detail-item"><strong>Present Status:</strong> {showDetailView.presentStatus}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Usage of Property</h4>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Usage:</strong> {showDetailView.usageOfProperty}</div>
                  <div className="detail-item"><strong>Sub Type:</strong> {showDetailView.usageSubType}</div>
                  <div className="detail-item"><strong>Construction Type:</strong> {showDetailView.constructionType}</div>
                  <div className="detail-item"><strong>Built-up Area:</strong> {showDetailView.builtUpArea} Sq.M</div>
                  <div className="detail-item"><strong>Year of Construction:</strong> {showDetailView.yearOfConstruction}</div>
                  <div className="detail-item"><strong>Type of Construction:</strong> {showDetailView.typeOfConstruction}</div>
                  <div className="detail-item"><strong>Use Type:</strong> {showDetailView.useType}</div>
                  <div className="detail-item"><strong>Estimated Value:</strong> {showDetailView.estimatedValue}</div>
                  <div className="detail-item"><strong>Parking:</strong> {showDetailView.parking ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Basement:</strong> {showDetailView.basement ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Civic Amenities</h4>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Supply Water:</strong> {showDetailView.supplyWater ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Water Connection:</strong> {showDetailView.waterConnection ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Tap Size:</strong> {showDetailView.tapSize}"</div>
                  <div className="detail-item"><strong>Tap Consumption:</strong> {showDetailView.tapConsumption}</div>
                  <div className="detail-item"><strong>MSEDCOL No:</strong> {showDetailView.msedcolNo}</div>
                  <div className="detail-item"><strong>Drainage Line:</strong> {showDetailView.drainageLine ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Vermicomposting:</strong> {showDetailView.vermicomposting ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Rainwater Harvesting:</strong> {showDetailView.rainwaterHarvesting ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>Solar Facilities:</strong> {showDetailView.solarFacilities ? 'Yes' : 'No'}</div>
                  <div className="detail-item"><strong>No. of Seats:</strong> {showDetailView.noOfSeats}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Floor Details</h4>
                {showDetailView.floors?.map((floor, index) => (
                  <div key={index} className="floor-detail">
                    <strong>{floor.name}:</strong>
                    <span>
                      {floor.rcc && 'RCC/Pucca '}
                      {floor.loadBearing && 'Load Bearing '}
                      {floor.shade && 'Shade/Patra/Khan'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h4>Remarks & Signature</h4>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Remarks:</strong> {showDetailView.remarks}</div>
                  <div className="detail-item"><strong>Respondent Name:</strong> {showDetailView.respondentName}</div>
                  <div className="detail-item"><strong>Surveyor Name:</strong> {showDetailView.surveyorName}</div>
                  <div className="detail-item"><strong>Checked By:</strong> {showDetailView.checkedBy}</div>
                  <div className="detail-item"><strong>Checked Date:</strong> {showDetailView.checkedDate}</div>
                </div>
                {showDetailView.respondentSign && (
                  <div className="signature-section">
                    <strong>Respondent Signature:</strong>
                    <img 
                      src={showDetailView.respondentSign} 
                      alt="Respondent Signature" 
                      className="signature-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="signature-placeholder" style={{display: 'none'}}>✍️ Signature</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;