import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Trophy, 
  Calendar, 
  User, 
  BookOpen, 
  Star,
  Copy,
  Check,
  Award,
  ExternalLink,
  Printer
} from 'lucide-react';
import { certificateAPI } from '../services/api';
import toast from 'react-hot-toast';

const CertificateViewer = () => {
  const { certificateId, verificationCode } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId, verificationCode]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await certificateAPI.verifyCertificate(certificateId, verificationCode);
      setCertificate(response.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setError('Certificate not found or invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await certificateAPI.downloadCertificate(certificateId);
      
      // Create blob URL and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.courseTitle}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out my completion certificate for "${certificate.courseTitle}"! 🎉`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Certificate link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 print:bg-white print:py-0">
      <style jsx>{`
        @media print {
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-gray-400 { border-color: #9ca3af !important; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0">
        {/* Download Button Only */}
        <div className="flex justify-end mb-8 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors print:hidden"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Certificate Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-gray-200 max-w-5xl mx-auto print:shadow-none print:border-gray-400"
          style={{
            aspectRatio: '1.414', // A4 ratio
            minHeight: '800px'
          }}
        >
          <div className="h-full p-10 relative bg-gradient-to-br from-blue-50 via-white to-purple-50 print:bg-white">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-2 border-dashed border-purple-300 rounded-lg print:border-gray-400"></div>
            <div className="absolute inset-6 border border-purple-200 rounded-lg print:border-gray-300"></div>
            
            {/* Decorative Corner Elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-purple-400 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-purple-400 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-purple-400 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-purple-400 rounded-br-lg"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-around items-center text-center px-6">
              
              {/* Header */}
              <div className="-mt-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3 shadow-lg">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-wider">
                  CERTIFICATE OF COMPLETION
                </h1>
                
                {/* Decorative Line */}
                <div className="flex justify-center mt-3">
                  <div className="w-40 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>

              {/* Main Content */}
              <div className="my-4 space-y-4">
                <p className="text-lg text-gray-600 font-light">
                  This is to certify that
                </p>
                
                <div className="py-2">
                  <h3 className="text-4xl font-bold text-purple-700 mb-1 border-b-2 border-purple-300 pb-2 inline-block px-6">
                    {certificate.userName}
                  </h3>
                </div>
                
                <p className="text-lg text-gray-600 font-light">
                  has successfully completed the course
                </p>
                
                <div className="py-1">
                  <h4 className="text-3xl font-semibold text-blue-600 italic leading-relaxed">
                    "{certificate.courseTitle}"
                  </h4>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center shadow-inner">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1 text-sm">INSTRUCTOR</h5>
                  <p className="text-gray-600 text-base">{certificate.instructorName || 'N/A'}</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center shadow-inner">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1 text-sm">COMPLETED ON</h5>
                  <p className="text-gray-600 text-base">{formatDate(certificate.completionDate)}</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center shadow-inner">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1 text-sm">GRADE</h5>
                  <p className="text-gray-600 font-bold text-base">{certificate.grade} ({certificate.score}%)</p>
                </div>
              </div>

              {/* Skills Section */}
              {certificate.skills && certificate.skills.length > 0 && (
                <div className="w-full max-w-2xl">
                  <h5 className="font-semibold text-gray-700 mb-3 text-center text-sm">SKILLS ACQUIRED</h5>
                  <div className="flex flex-wrap justify-center gap-2">
                    {certificate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="-mb-4 pt-4 border-t border-gray-300 w-full max-w-4xl">
                <div className="grid grid-cols-2 gap-6 text-xs text-gray-500">
                  <div className="text-left">
                    <p className="font-semibold mb-1">Certificate ID</p>
                    <p>{certificate.certificateId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold mb-1">Verification Code</p>
                    <p>{certificate.verificationCode}</p>
                  </div>
                </div>
                
                {/* Verification Seal */}
                <div className="flex justify-center mt-3">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 shadow-md">
                    <Trophy className="w-3 h-3" />
                    <span>VERIFIED by EduCharity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Info */}
        <div className="mt-8 text-center print:hidden">
          <p className="text-sm text-gray-600">
            This certificate can be verified at any time using the certificate ID and verification code above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
