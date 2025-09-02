import { useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';
import { useNotification } from '../contexts/NotificationContext';
import './MemberCard.css';

const MemberCard = () => {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [duplicateMembers, setDuplicateMembers] = useState([]);
  const { showNotification } = useNotification();


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      showNotification('Please enter member name or phone', 'error');
      return;
    }

    setLoading(true);
    setMember(null);
    setDuplicateMembers([]);

    try {
      // Try by phone first
      let response;
      try {
        response = await axios.post('http://localhost:3000/api/checkin', {
          phone: searchValue.trim()
        });
        setMember(response.data.member);
        showNotification('Member found!', 'success');
      } catch (error) {
        // If phone fails, try by name
        try {
          response = await axios.post('http://localhost:3000/api/checkin', {
            name: searchValue.trim()
          });
          setMember(response.data.member);
          showNotification('Member found!', 'success');
        } catch (nameError) {
          // Handle duplicate members (status code 300)
          if (nameError.response?.status === 300 && nameError.response?.data?.duplicateMembers) {
            setDuplicateMembers(nameError.response.data.duplicateMembers);
            showNotification('Multiple members found with similar names', 'warning');
          } else {
            showNotification('Member not found', 'error');
          }
        }
      }
    } catch (error) {
      showNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a specific member from duplicates
  const handleSelectMember = (selectedMember) => {
    setMember(selectedMember);
    setDuplicateMembers([]);
    showNotification('Member selected!', 'success');
  };

  const handleSavePDF = async () => {
    const cardElement = document.querySelector('.id-card');
    
    if (!cardElement) {
      showNotification('ID Card not found. Please generate a card first.', 'error');
      return;
    }

    try {
      showNotification('Generating PDF...', 'info');
      
      // Create a clone of the card for PDF with optimized styling
      const cardClone = cardElement.cloneNode(true);
      cardClone.style.width = '53.98mm';  // full portrait width
      cardClone.style.height = '85.6mm';  // full portrait height
      cardClone.style.padding = '3mm';
      cardClone.style.margin = '0';  // no margin needed without border
      cardClone.style.border = 'none';  // remove border
      cardClone.style.borderRadius = '0';  // remove border radius
      cardClone.style.fontSize = '8px';
      cardClone.style.lineHeight = '1.2';
      cardClone.style.boxShadow = 'none';
      cardClone.style.backgroundColor = '#ffffff';
      cardClone.style.position = 'absolute';
      cardClone.style.left = '-9999px';
      cardClone.style.top = '0';
      
      // Adjust internal elements for PDF
      const headerSection = cardClone.querySelector('.header-section');
      if (headerSection) {
        headerSection.style.paddingBottom = '1.5mm';
        headerSection.style.marginBottom = '2mm';
        const h1 = headerSection.querySelector('h1');
        if (h1) h1.style.fontSize = '10px';
        const subtitle = headerSection.querySelector('.card-subtitle');
        if (subtitle) subtitle.style.fontSize = '6px';
      }
      
      const memberIdBox = cardClone.querySelector('.member-id-box');
      if (memberIdBox) {
        memberIdBox.style.padding = '1.5mm';
        memberIdBox.style.marginBottom = '2.5mm';  // increased margin bottom
        const idLarge = memberIdBox.querySelector('.member-id-large');
        if (idLarge) {
          idLarge.style.fontSize = '14px';
          idLarge.style.marginBottom = '1mm';  // add some spacing below ID
        }
        const idLabel = memberIdBox.querySelector('.member-id-label');
        if (idLabel) idLabel.style.fontSize = '6px';
      }
      
      const detailLabels = cardClone.querySelectorAll('.detail-label');
      detailLabels.forEach(label => {
        label.style.fontSize = '6px';
        label.style.marginBottom = '0.5mm';
      });
      
      const detailValues = cardClone.querySelectorAll('.detail-value');
      detailValues.forEach(value => {
        value.style.fontSize = '7px';
        value.style.marginBottom = '2mm';
        value.style.lineHeight = '1.4';
      });
      
      const detailsGrid = cardClone.querySelector('.details-grid');
      if (detailsGrid) {
        detailsGrid.style.gap = '1mm 2mm';
      }
      
      const statusBadge = cardClone.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.style.display = 'inline';
        statusBadge.style.setProperty('font-size', '7px', 'important');  // force override
        statusBadge.style.setProperty('padding', '0', 'important');
        statusBadge.style.setProperty('border-radius', '0', 'important');
        statusBadge.style.setProperty('background', 'transparent', 'important');
        statusBadge.style.setProperty('border', 'none', 'important');
        statusBadge.style.setProperty('white-space', 'nowrap', 'important');
        statusBadge.style.setProperty('line-height', 'inherit', 'important');
        statusBadge.style.setProperty('vertical-align', 'baseline', 'important');
        statusBadge.style.setProperty('font-weight', 'bold', 'important');
        statusBadge.style.setProperty('text-transform', 'uppercase', 'important');
        
        // Remove any Tailwind classes that might interfere
        statusBadge.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg');
        statusBadge.classList.remove('p-1', 'p-2', 'p-3', 'px-1', 'px-2', 'px-3', 'py-1', 'py-2');
      }
      
      const footerSection = cardClone.querySelector('.footer-section');
      if (footerSection) {
        footerSection.style.paddingTop = '1mm';
        footerSection.style.marginTop = 'auto';
        const footerTexts = footerSection.querySelectorAll('.footer-text');
        footerTexts.forEach(text => {
          text.style.fontSize = '5px';
          text.style.margin = '0.5mm 0';
        });
      }
      
      // Add to DOM temporarily
      document.body.appendChild(cardClone);
      
      // CR80 standard dimensions in mm (portrait)
      const CR80_WIDTH_MM = 53.98;   // portrait width
      const CR80_HEIGHT_MM = 85.6;   // portrait height
      
      // Convert mm to points (1 mm = 2.834645669 points)
      const mmToPoints = 2.834645669;
      const cardWidthPt = CR80_WIDTH_MM * mmToPoints;
      const cardHeightPt = CR80_HEIGHT_MM * mmToPoints;

      // Create canvas from cloned card element with high resolution
      const canvas = await html2canvas(cardClone, {
        scale: 4, // Higher resolution for PDF
        useCORS: true,
        backgroundColor: '#ffffff',
        width: cardClone.offsetWidth,
        height: cardClone.offsetHeight,
        logging: false
      });

      // Remove clone from DOM
      document.body.removeChild(cardClone);

      // Create PDF with exact CR80 dimensions (portrait orientation)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [cardWidthPt, cardHeightPt]
      });

      // Calculate image dimensions to fit perfectly (portrait)
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = cardWidthPt;   // direct mapping
      const imgHeight = cardHeightPt; // direct mapping

      // Add image to PDF with exact fit
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

      // Save PDF
      const fileName = `Member_ID_Card_${member.name.replace(/\s+/g, '_')}_${member.id}.pdf`;
      pdf.save(fileName);
      
      showNotification(`PDF saved: ${fileName}`, 'success');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      showNotification('Failed to generate PDF. Please try again.', 'error');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 print:p-0 print:m-0 print:max-w-none">
      <div className="card mb-6 print:hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Member ID Card Generator
          </h2>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <label className="form-label">Search Member</label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Enter phone number or name"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md w-full"
              >
                {loading ? 'Searching...' : 'Find Member'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Duplicate Members Selection */}
      {duplicateMembers.length > 0 && (
        <div className="card mb-6 border-l-4 border-yellow-500 print:hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-800">
                  Multiple Members Found
                </h3>
                <p className="text-yellow-600">
                  Please select the correct member to generate their ID card:
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {duplicateMembers.map((duplicateMember) => (
                <div
                  key={duplicateMember.id}
                  onClick={() => handleSelectMember(duplicateMember)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-yellow-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-gray-900 mr-2">{duplicateMember.name}</h4>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Click to Select
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> #{duplicateMember.id}
                        </div>
                        {duplicateMember.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {duplicateMember.phone}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Type:</span> {duplicateMember.membershipType}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Expires:</span> {formatDate(duplicateMember.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> For faster searches in the future, use the member's phone number or ID number.
              </p>
            </div>
          </div>
        </div>
      )}

      {member && (
        <div className="space-y-6">
          {/* Save to PDF Button */}
          <div className="text-center">
            <button
              onClick={handleSavePDF}
              className="btn btn-primary btn-md"
            >
              📄 Save ID Card as PDF
            </button>
          </div>

          {/* Member ID Card */}
          <div className="member-card-container">
            <div className="id-card">
              {/* Header */}
              <div className="header-section">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'}}>
                  <span className="text-3xl" style={{marginRight: '0.5rem'}}>🏋️</span>
                  <h1>GYM MANAGER</h1>
                </div>
                <p className="card-subtitle">MEMBER ID CARD</p>
              </div>

              {/* Content */}
              <div className="content-section">
                {/* ID Number */}
                <div className="member-id-box">
                  <div className="member-id-label">MEMBER ID</div>
                  <div className="member-id-large">#{member.id}</div>
                </div>

                {/* Member Details */}
                <div className="details-grid">
                  <div>
                    <div className="detail-label">Name</div>
                    <div className="detail-value">{member.name}</div>
                  </div>
                  
                  {member.phone && (
                    <div>
                      <div className="detail-label">Phone</div>
                      <div className="detail-value">{member.phone}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="detail-label">Type</div>
                    <div className="detail-value">{member.membershipType}</div>
                  </div>
                  
                  <div>
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      <span className={`status-badge ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="detail-label">Valid From</div>
                    <div className="detail-value">{formatDate(member.startDate)}</div>
                  </div>
                  
                  <div>
                    <div className="detail-label">Valid Until</div>
                    <div className="detail-value">{formatDate(member.endDate)}</div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="qr-section">
                <div className="qr-container">
                  <QRCode
                    size={50}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={JSON.stringify({
                      id: member.id,
                      name: member.name,
                      membershipType: member.membershipType,
                      endDate: member.endDate,
                      phone: member.phone || '',
                      timestamp: Date.now()
                    })}
                    viewBox={`0 0 50 50`}
                  />
                </div>
                <div className="qr-label">SCAN FOR<br/>CHECK-IN</div>
              </div>

              {/* Footer */}
              <div className="footer-section">
                <p className="footer-text">Present this card for gym access</p>
                <p className="footer-text">Member ID: #{member.id}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card print:hidden">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to use your Member ID:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>QR Code Scan:</strong> Scan the QR code on your card for instant check-in</p>
                <p>• <strong>Member ID:</strong> Tell the staff your Member ID: <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded font-mono">#{member.id}</span></p>
                <p>• <strong>Phone Number:</strong> Use your phone number: <span className="bg-gray-100 px-2 py-1 rounded font-mono">{member.phone}</span></p>
                <p>• <strong>Print this card</strong> and bring it to the gym for faster access</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCard;