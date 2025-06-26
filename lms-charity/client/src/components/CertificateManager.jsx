import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Award, 
  Calendar, 
  Shield, 
  ExternalLink,
  Share2,
  Copy,
  CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CertificateManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCert, setGeneratingCert] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (courseId, courseName, score = 100) => {
    try {
      setGeneratingCert(courseId);
      const response = await axios.post('/api/certificates/generate', {
        courseId,
        score
      });
      
      setCertificates(prev => [response.data.certificate, ...prev]);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(null);
    }
  };

  const downloadCertificate = async (certificateId, courseName) => {
    try {
      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${courseName}-Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificateId) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Course Certificate',
          text: 'Check out my course completion certificate!',
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  const copyVerificationCode = async (code) => {
    await navigator.clipboard.writeText(code);
    toast.success('Verification code copied!');
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'Pass': 'text-gray-600 bg-gray-100'
    };
    return gradeColors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Certificates
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Award size={16} />
          <span>{certificates.length} certificates earned</span>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <Award size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No certificates yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete courses to earn certificates and showcase your achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <motion.div
              key={certificate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            >
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <Award size={24} />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(certificate.grade)}`}>
                    {certificate.grade}
                  </span>
                </div>
                <h3 className="font-semibold mt-2 text-lg">
                  {certificate.course?.title || 'Course Certificate'}
                </h3>
              </div>

              {/* Certificate Content */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Certificate ID:</span>
                    <button
                      onClick={() => copyVerificationCode(certificate.certificateId)}
                      className="font-mono text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>{certificate.certificateId}</span>
                      <Copy size={12} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(certificate.completionDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                  
                  {certificate.score && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Score:</span>
                      <span className="font-semibold text-green-600">
                        {certificate.score}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Skills Gained:</span>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {certificate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{certificate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification */}
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle size={16} />
                  <span>Verified Certificate</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadCertificate(certificate._id, certificate.course?.title)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => shareCertificate(certificate.certificateId)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Share2 size={16} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`/verify-certificate/${certificate.certificateId}`, '_blank')}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </motion.button>
                </div>

                {/* Verification Code */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Verification Code:</span>
                    <button
                      onClick={() => copyVerificationCode(certificate.verificationCode)}
                      className="font-mono hover:text-blue-600 flex items-center space-x-1"
                    >
                      <span>{certificate.verificationCode}</span>
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Generate Certificate Button (for testing) */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-4 right-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generateCertificate('test-course-id', 'Test Course', 95)}
            disabled={generatingCert}
            className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <Award size={16} />
            <span>{generatingCert ? 'Generating...' : 'Generate Test Certificate'}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Certificate Verification Component (for public verification page)
export const CertificateVerification = ({ certificateId, verificationCode }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (certificateId && verificationCode) {
      verifyCertificate();
    }
  }, [certificateId, verificationCode]);

  const verifyCertificate = async () => {
    try {
      const response = await axios.get(`/api/certificates/verify/${certificateId}/${verificationCode}`);
      setCertificate(response.data.certificate);
      setIsValid(response.data.isValid);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="text-center py-16">
        <Shield size={64} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Valid</h2>
        <p className="text-gray-600">
          The certificate ID or verification code is invalid or the certificate has been revoked.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg border-2 border-green-500 p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Valid Certificate</h2>
        
        <div className="space-y-4 text-left max-w-md mx-auto">
          <div>
            <span className="text-gray-600">Student Name:</span>
            <p className="font-semibold">{certificate.studentName}</p>
          </div>
          
          <div>
            <span className="text-gray-600">Course:</span>
            <p className="font-semibold">{certificate.courseName}</p>
          </div>
          
          <div>
            <span className="text-gray-600">Completion Date:</span>
            <p className="font-semibold">{new Date(certificate.completionDate).toLocaleDateString()}</p>
          </div>
          
          <div>
            <span className="text-gray-600">Grade:</span>
            <p className="font-semibold">{certificate.grade}</p>
          </div>
          
          {certificate.score && (
            <div>
              <span className="text-gray-600">Score:</span>
              <p className="font-semibold">{certificate.score}%</p>
            </div>
          )}
          
          {certificate.skills && certificate.skills.length > 0 && (
            <div>
              <span className="text-gray-600">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {certificate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateManager;
