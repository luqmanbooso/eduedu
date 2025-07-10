import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Award, 
  Calendar, 
  User, 
  CheckCircle, 
  Star,
  Trophy,
  Medal,
  Printer,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { certificateAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CourseCompletionCertificate = ({ courseId, course, onClose }) => {
  const { user } = useAuth();
  const certificateRef = useRef(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await certificateAPI.getCertificate(courseId);
      setCertificate(response.certificate);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      // Generate new certificate if not exists
      generateCertificate();
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setIsGenerating(true);
      const response = await certificateAPI.generateCertificate(courseId);
      setCertificate(response.certificate);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);
      
      // Generate canvas from certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${course.title}-Certificate.pdf`);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const text = `I just completed "${course.title}" and earned my certificate! 🎓`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyVerificationLink = () => {
    const verificationUrl = `${window.location.origin}/verify-certificate/${certificate?.verificationId}`;
    navigator.clipboard.writeText(verificationUrl);
    toast.success('Verification link copied to clipboard!');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Completion Certificate</h2>
                <p className="text-gray-600">Congratulations on completing the course!</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="p-6">
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-purple-50 to-blue-50 border-4 border-purple-200 rounded-lg p-8 text-center relative overflow-hidden flex flex-col justify-between"
            style={{ width: '800px', height: '600px', margin: '0 auto' }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10">
                <Award className="w-24 h-24 text-purple-600" />
              </div>
              <div className="absolute top-10 right-10">
                <Trophy className="w-24 h-24 text-purple-600" />
              </div>
              <div className="absolute bottom-10 left-10">
                <Medal className="w-24 h-24 text-purple-600" />
              </div>
              <div className="absolute bottom-10 right-10">
                <Star className="w-24 h-24 text-purple-600" />
              </div>
            </div>

            {/* Header */}
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-600 rounded-full mb-4">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-purple-800 mb-2">Certificate of Completion</h1>
              <div className="w-40 h-1 bg-purple-600 mx-auto mb-8"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-grow flex flex-col justify-center">
              <p className="text-xl text-gray-700 mb-4">This is to certify that</p>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4 border-b-2 border-purple-300 pb-4 mx-auto w-3/4">
                {user?.name || 'Student Name'}
              </h2>
              
              <p className="text-xl text-gray-700 mb-2">has successfully completed the course</p>
              
              <h3 className="text-3xl font-semibold text-purple-800 mb-4">
                "{course?.title}"
              </h3>
              
              <p className="text-lg text-gray-600">
                Instructed by <span className="font-semibold">{course?.instructor?.name}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between mt-auto pt-8">
              <div className="text-left">
                <div className="border-t-2 border-gray-400 pt-2 w-56">
                  <p className="text-md text-gray-600">Date of Completion</p>
                  <p className="font-semibold text-lg text-gray-800">
                    {formatDate(certificate?.completedAt || new Date())}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-2">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-gray-600">Verified Certificate</p>
              </div>
              
              <div className="text-right">
                <div className="border-t-2 border-gray-400 pt-2 w-56">
                  <p className="text-md text-gray-600">Certificate ID</p>
                  <p className="font-mono text-md text-gray-800">
                    {certificate?.verificationId || 'CERT-' + Date.now()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download & Print */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Download & Share</h3>
              <div className="space-y-3">
                <button
                  onClick={downloadCertificate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  <span>Print Certificate</span>
                </button>
                
                <button
                  onClick={copyVerificationLink}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Copy Verification Link</span>
                </button>
              </div>
            </div>

            {/* Social Sharing */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Share Your Achievement</h3>
              <div className="space-y-3">
                <button
                  onClick={() => shareOnSocialMedia('linkedin')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>Share on LinkedIn</span>
                </button>
                
                <button
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span>Share on Twitter</span>
                </button>
                
                <button
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Share on Facebook</span>
                </button>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Certificate Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Course Duration</p>
                <p className="font-medium">{course?.estimatedDuration || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Completion Date</p>
                <p className="font-medium">{formatDate(certificate?.completedAt || new Date())}</p>
              </div>
              <div>
                <p className="text-gray-600">Final Score</p>
                <p className="font-medium">{certificate?.finalScore || 'Pass'}%</p>
              </div>
              <div>
                <p className="text-gray-600">Certificate ID</p>
                <p className="font-mono text-xs">{certificate?.verificationId || 'CERT-' + Date.now()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseCompletionCertificate;
