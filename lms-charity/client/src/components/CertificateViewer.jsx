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
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            onClick={() => navigate('/my-learning')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Back to My Learning</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <div className="relative print:hidden">
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => document.getElementById('shareMenu').classList.toggle('hidden')}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <div id="shareMenu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button 
                  onClick={() => handleShare('linkedin')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Share on LinkedIn
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Share on Twitter
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Share on Facebook
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => handleShare('copy')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  {copied ? <Check className="w-4 h-4 mr-3" /> : <Copy className="w-4 h-4 mr-3" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-gray-200 max-w-4xl mx-auto print:shadow-none print:border-gray-400"
          style={{
            aspectRatio: '1.414', // A4 ratio
            minHeight: '800px'
          }}
        >
          <div className="h-full p-12 relative bg-gradient-to-br from-blue-50 via-white to-purple-50 print:bg-white">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-double border-purple-300 rounded-lg print:border-gray-400"></div>
            <div className="absolute inset-8 border border-purple-200 rounded-lg print:border-gray-300"></div>
            
            {/* Decorative Corner Elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-purple-400 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-purple-400 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-purple-400 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-purple-400 rounded-br-lg"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8">
              
              {/* Header */}
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-wide">
                  CERTIFICATE
                </h1>
                <h2 className="text-2xl font-semibold text-purple-600 tracking-widest uppercase">
                  of Completion
                </h2>
                
                {/* Decorative Line */}
                <div className="flex justify-center mt-6">
                  <div className="w-32 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-8 space-y-6">
                <p className="text-xl text-gray-600 font-light">
                  This is to certify that
                </p>
                
                <div className="py-4">
                  <h3 className="text-4xl font-bold text-gray-800 mb-2 border-b-2 border-purple-300 pb-2 inline-block px-8">
                    {certificate.studentName}
                  </h3>
                </div>
                
                <p className="text-xl text-gray-600 font-light">
                  has successfully completed the course
                </p>
                
                <div className="py-2">
                  <h4 className="text-3xl font-semibold text-purple-700 italic leading-relaxed">
                    "{certificate.courseTitle}"
                  </h4>
                </div>
                
                <p className="text-lg text-gray-600">
                  and has demonstrated proficiency in the subject matter
                </p>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-3 gap-8 mb-8 w-full max-w-3xl">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1">INSTRUCTOR</h5>
                  <p className="text-gray-600">{certificate.courseInstructor || 'N/A'}</p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1">COMPLETED</h5>
                  <p className="text-gray-600">{formatDate(certificate.completionDate)}</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-gray-700 mb-1">GRADE</h5>
                  <p className="text-gray-600 font-bold">{certificate.grade}</p>
                  <p className="text-sm text-gray-500">({certificate.score}%)</p>
                </div>
              </div>

              {/* Skills Section */}
              {certificate.skills && certificate.skills.length > 0 && (
                <div className="mb-8 w-full max-w-2xl">
                  <h5 className="font-semibold text-gray-700 mb-4 text-center">SKILLS ACQUIRED</h5>
                  <div className="flex flex-wrap justify-center gap-3">
                    {certificate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-8 border-t border-gray-300 w-full">
                <div className="grid grid-cols-2 gap-8 text-sm text-gray-500">
                  <div className="text-left">
                    <p className="font-semibold mb-1">Certificate Details</p>
                    <p>ID: {certificate.certificateId}</p>
                    <p>Verification: {certificate.verificationCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold mb-1">Achievement</p>
                    <p>Credits Earned: {certificate.creditsEarned || 0}</p>
                    <p>Status: Verified Certificate</p>
                  </div>
                </div>
                
                {/* Verification Seal */}
                <div className="flex justify-center mt-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>VERIFIED CERTIFICATE</span>
                    <Trophy className="w-4 h-4" />
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
